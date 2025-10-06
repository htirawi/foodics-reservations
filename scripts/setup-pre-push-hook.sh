#!/usr/bin/env bash
set -euo pipefail

# Setup script for pre-push hook with hard-ban enforcement
# Run this script to install the enhanced pre-push hook

echo "🔧 Setting up pre-push hook with hard-ban enforcement..."

# Create the pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

# --- Config ----------------------------------------------------
# If your post-push docs script exists, set to 1 to enable that step
GEN_DOCS_AFTER_PUSH=${GEN_DOCS_AFTER_PUSH:-1}

# --- Detect default branch ------------------------------------
default_ref="$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || echo origin/main)"
default_branch="${default_ref#origin/}"
current_branch="$(git rev-parse --abbrev-ref HEAD)"

# --- Block pushing default branch ------------------------------
if [[ "$current_branch" == "$default_branch" ]]; then
  echo "✖ Abort: pushing directly to '$default_branch' is blocked. Create a feature branch and open a PR."
  exit 1
fi

# --- Hard-ban enforcement: block forbidden directives -----------
echo "▶ Checking for hard-banned directives..."

# Block eslint-disable / ts-ignore / TODO / console.* in src
if git diff --cached -U0 | grep -E "^\+.*(eslint-disable|@ts-ignore|@ts-nocheck|TODO:|FIXME:)" -n; then
  echo "❌ Hard-banned directive found in staged changes. Fix before pushing."
  echo "   Forbidden: eslint-disable, @ts-ignore, @ts-nocheck, TODO:, FIXME:"
  exit 1
fi

if git diff --cached -U0 -- 'src/**' ':!tests/**' ':!**/__tests__/**' | grep -E "^\+.*console\.(log|debug|info|warn|error)\(" -n; then
  echo "❌ console.* added in src (non-test). Remove or guard."
  echo "   Allowed only in test files or with proper guards."
  exit 1
fi

echo "✅ No hard-banned directives found."

# --- Pick package runner ---------------------------------------
run() {
  if command -v pnpm >/dev/null 2>&1 && [[ -f pnpm-lock.yaml ]]; then pnpm "$@"
  elif command -v yarn >/dev/null 2>&1 && [[ -f yarn.lock ]]; then yarn "$@"
  else npm run "$@"
  fi
}

# --- Ensure Playwright deps if e2e script exists ---------------
have_script() {
  node -e "try{const p=require('./package.json');process.exit(p.scripts && p.scripts['$1']?0:1)}catch(e){process.exit(1)}"
}

# --- Run quality gates (best-effort order; stop on fail) -------
echo "▶ Running lint..."
if have_script lint; then run lint; else echo "ℹ No 'lint' script"; fi

echo "▶ Running typecheck..."
if have_script typecheck; then run typecheck; else echo "ℹ No 'typecheck' script"; fi

echo "▶ Running unit tests..."
if have_script "test:unit"; then run test:unit; elif have_script test; then run test; else echo "ℹ No 'test:unit' or 'test' script"; fi

echo "▶ Running e2e tests..."
if have_script "test:e2e"; then
  if command -v npx >/dev/null 2>&1; then npx playwright install --with-deps >/dev/null 2>&1 || true; fi
  run test:e2e
else
  echo "ℹ No 'test:e2e' script"
fi

# --- Optional: generate & push docs (local-only) ---------------
# If you have the generator at .git/tools/generate-docs.mjs, you can
# keep this ON to commit+push docs as a follow-up commit automatically.
if [[ "${GEN_DOCS_AFTER_PUSH}" == "1" && -f ".git/tools/generate-docs.mjs" ]]; then
  # Avoid recursion on the inner push
  if [[ "${SKIP_DOCS:-}" != "1" ]]; then
    echo "▶ Generating post-push docs…"
    node .git/tools/generate-docs.mjs || true
    git add docs/PR-* docs/PUSH-* docs/INDEX.md 2>/dev/null || true
    if ! git diff --cached --quiet; then
      git commit -m "docs: add post-push deep-dive (${current_branch})"
      # inner push with hook disabled
      SKIP_DOCS=1 git push --no-verify "${1:-origin}" "HEAD:${current_branch}"
    fi
  fi
fi

# --- Allow the original push to continue -----------------------
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-push

echo "✅ Pre-push hook installed successfully!"
echo ""
echo "🔒 Hard-banned directives:"
echo "   • eslint-disable (except with justification + ticket)"
echo "   • @ts-ignore, @ts-nocheck"
echo "   • TODO:, FIXME:"
echo "   • console.* in src files (allowed in tests)"
echo ""
echo "🧪 Test the hook:"
echo "   echo '// eslint-disable-next-line' > test.js && git add test.js && git push"
echo "   (Should fail with hard-ban error)"
echo ""
echo "📖 The hook will run before every push and block commits with forbidden directives."
