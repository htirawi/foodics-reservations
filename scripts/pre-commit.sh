#!/bin/bash

# Pre-commit hook to ensure tests pass before commits
# This script runs essential checks before allowing commits

set -e

echo "🔍 Running pre-commit checks..."

# 1. Lint check
echo "📝 Running ESLint..."
npm run lint

# 2. Type check
echo "🔧 Running TypeScript check..."
npm run typecheck

# 3. Unit tests
echo "🧪 Running unit tests..."
npm run test:unit

# 4. Quick E2E smoke test (Chromium only for speed)
echo "🎭 Running E2E smoke test..."
npm run test:e2e:smoke

echo "✅ All pre-commit checks passed!"
echo "🚀 Ready to commit!"
