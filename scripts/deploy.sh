#!/bin/bash
# Katz Kourse — Safe Deploy
# Usage: ./scripts/deploy.sh "commit message"

set -e
cd "$(dirname "$0")/.."

MSG="${1:-Update}"

echo ""
echo "🐱 Katz Kourse Safe Deploy"
echo "────────────────────────────"

# 1. Pre-deploy checks
echo "Running pre-deploy checks..."
node scripts/pre-deploy-check.js
if [ $? -ne 0 ]; then
  echo "❌ Pre-deploy checks failed. Fix issues before deploying."
  exit 1
fi

# 2. Git commit and push
echo ""
echo "Committing: $MSG"
git add .
git commit -m "$MSG"
git push

echo ""
echo "🚀 Deployed! Check Vercel for build status."
echo "   Health check: https://your-app.vercel.app/api/health"
echo ""
