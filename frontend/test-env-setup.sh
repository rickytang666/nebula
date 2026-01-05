#!/bin/bash

# Test script to verify environment variables in a preview build
# This creates a test build to verify env vars work before going to production

echo "🧪 Testing Environment Variables with Preview Build"
echo "===================================================="
echo ""
echo "This will create a preview build to test if env vars are properly configured."
echo "Preview builds are faster and won't affect your production TestFlight."
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo "📦 Building preview version..."
eas build --platform ios --profile preview --non-interactive

echo ""
echo "✅ Build submitted!"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for build to complete (check: eas build:list)"
echo "   2. Download and install on your device"
echo "   3. Launch the app - it should NOT crash"
echo "   4. Check console logs to verify env vars are loaded"
echo "   5. If successful, build production: eas build --platform ios --profile production"
echo ""
