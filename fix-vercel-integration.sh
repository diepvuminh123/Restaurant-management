#!/bin/bash
# Script to fix Vercel GitHub integration

echo "🔧 Fixing Vercel GitHub Integration"
echo "=================================="

echo "Step 1: Go to Vercel Dashboard"
echo "URL: https://vercel.com/dashboard"
echo ""

echo "Step 2: Select CORRECT project: restaurant-management-test"
echo "NOT the old 'restaurant-management' project!"
echo ""

echo "Step 3: Connect GitHub to correct project"
echo "- Go to Settings → Git"
echo "- Click 'Connect Git Repository'"
echo "- Select: diepvuminh123/Restaurant-management"
echo "- Set Root Directory: frontend"
echo "- Click Connect"
echo ""

echo "Step 4: Disconnect old project (optional)"
echo "- Go to old 'restaurant-management' project"
echo "- Settings → Git → Disconnect"
echo ""

echo "✅ After this, GitHub will show correct deployment status!"

# Alternative: Use vercel CLI to switch projects
echo ""
echo "🚀 Current project info:"
echo "Working project: restaurant-management-test"
echo "URL: https://restaurant-management-test-38otlmzcb-diepvuminh123s-projects.vercel.app"