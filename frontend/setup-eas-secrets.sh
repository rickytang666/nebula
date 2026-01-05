#!/bin/bash

# This script helps you set up EAS secrets for production builds
# It will read from your .env file and create the necessary secrets

echo "🔐 Setting up EAS Secrets for Nebula"
echo "======================================"
echo ""

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "📝 Creating secrets from .env file..."
echo ""

# Create secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "$EXPO_PUBLIC_SUPABASE_URL" --type string --force
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "$EXPO_PUBLIC_SUPABASE_ANON_KEY" --type string --force
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "$EXPO_PUBLIC_API_URL" --type string --force

# Optional: Dev API URL for preview builds
if [ ! -z "$EXPO_PUBLIC_DEV_API_URL" ]; then
    eas secret:create --scope project --name EXPO_PUBLIC_DEV_API_URL --value "$EXPO_PUBLIC_DEV_API_URL" --type string --force
fi

echo ""
echo "✅ Secrets created successfully!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: eas build --platform ios --profile production"
echo "   2. Wait for build to complete"
echo "   3. Test on TestFlight"
echo ""
