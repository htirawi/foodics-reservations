# Pre-Push Hook - Hard-Ban Enforcement

## Overview

The pre-push hook enforces strict code quality standards by blocking commits that contain hard-banned directives. This ensures compliance with the engineering doctrine even when Cursor isn't used.

## Setup

Run the setup script to install the enhanced pre-push hook:

```bash
./scripts/setup-pre-push-hook.sh
```

## Hard-Banned Directives

The hook blocks the following patterns in staged changes:

### 🚫 Forbidden Everywhere
- `eslint-disable` - ESLint rule disabling (except with justification + ticket)
- `@ts-ignore` - TypeScript error suppression
- `@ts-nocheck` - TypeScript checking bypass
- `TODO:` - TODO comments (use issues instead)
- `FIXME:` - FIXME comments (use issues instead)

### 🚫 Forbidden in Source Code (src/**)
- `console.log()` - Console logging
- `console.debug()` - Console debugging
- `console.info()` - Console info
- `console.warn()` - Console warnings
- `console.error()` - Console errors

**Note:** `console.*` is **allowed** in test files (`tests/**`, `**/__tests__/**`)

## How It Works

1. **Pre-Push Check**: Runs before every `git push`
2. **Staged Diff Analysis**: Scans only staged changes (what you're about to push)
3. **Pattern Matching**: Uses regex to find forbidden directives
4. **Early Exit**: Blocks push immediately if violations found
5. **Clear Messages**: Shows exactly what was found and where

## Example Output

### ❌ Blocked Push (Forbidden Directive Found)
```bash
▶ Checking for hard-banned directives...
7:+// eslint-disable-next-line vue/require-default-prop
❌ Hard-banned directive found in staged changes. Fix before pushing.
   Forbidden: eslint-disable, @ts-ignore, @ts-nocheck, TODO:, FIXME:
```

### ❌ Blocked Push (Console in Source)
```bash
▶ Checking for hard-banned directives...
7:+console.log("test");
❌ console.* added in src (non-test). Remove or guard.
   Allowed only in test files or with proper guards.
```

### ✅ Successful Check
```bash
▶ Checking for hard-banned directives...
✅ No hard-banned directives found.
▶ Running lint...
...
```

## Testing the Hook

### Test Forbidden Directives
```bash
# Create a file with forbidden directive
echo '// eslint-disable-next-line' > test.js
git add test.js
git push  # Should fail with hard-ban error

# Clean up
git reset HEAD test.js
rm test.js
```

### Test Console in Source
```bash
# Create console statement in src
echo 'console.log("test");' > src/test.js
git add src/test.js
git push  # Should fail

# Clean up
git reset HEAD src/test.js
rm src/test.js
```

### Test Console in Tests (Allowed)
```bash
# Create console statement in tests (should pass)
echo 'console.log("test");' > tests/test.js
git add tests/test.js
git push  # Should pass hard-ban check
```

## Integration with Existing Hook

The hard-ban checks are integrated into the existing pre-push hook that also:
- Blocks pushing to default branch
- Runs lint, typecheck, unit tests, e2e tests
- Generates post-push documentation (if configured)

## Bypassing the Hook (Emergency Only)

In extreme emergencies, you can bypass the hook:

```bash
git push --no-verify
```

**⚠️ Warning**: Only use `--no-verify` in true emergencies. The hook exists to maintain code quality.

## Configuration

The hook can be customized by editing `.git/hooks/pre-push`:

- **Disable docs generation**: Set `GEN_DOCS_AFTER_PUSH=0`
- **Skip specific checks**: Modify the grep patterns
- **Add new forbidden patterns**: Extend the regex patterns

## Team Setup

For team consistency, add the setup script to your onboarding documentation:

```bash
# In your project README or onboarding docs
git clone <repo>
cd <repo>
./scripts/setup-pre-push-hook.sh
```

## Troubleshooting

### Hook Not Running
```bash
# Check if hook is executable
ls -la .git/hooks/pre-push
# Should show: -rwxr-xr-x

# Make executable if needed
chmod +x .git/hooks/pre-push
```

### False Positives
If the hook incorrectly flags legitimate code:
1. Check if the pattern is truly forbidden
2. Consider if the code should be refactored
3. For legitimate exceptions, use proper guards or move to test files

### Performance
The hook is designed to be fast:
- Only scans staged changes (not entire repo)
- Uses efficient grep patterns
- Exits early on first violation found

## Compliance with Engineering Doctrine

This hook enforces the strict rule:
> "ESLint strict; no `eslint-disable` except with a one-line justification + follow-up ticket"

By preventing these patterns from entering the codebase, it ensures:
- ✅ No technical debt accumulation
- ✅ Consistent code quality
- ✅ Proper error handling
- ✅ Clean commit history
