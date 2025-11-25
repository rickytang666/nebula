#!/bin/bash

# Exit on error
set -e

echo "Deploying Backend to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Prompt for Project ID if not set
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
else
    PROJECT_ID=$GOOGLE_CLOUD_PROJECT
fi

if [ -z "$PROJECT_ID" ]; then
    echo "Error: Project ID is required."
    exit 1
fi

SERVICE_NAME="backend-api"
REGION="us-central1" # You can change this default

echo "Deploying service '$SERVICE_NAME' to project '$PROJECT_ID' in region '$REGION'..."

# Deploy using source
gcloud run deploy $SERVICE_NAME \
    --source . \
    --project $PROJECT_ID \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "SUPABASE_URL=PLACEHOLDER_URL,SUPABASE_ANON_KEY=PLACEHOLDER_KEY"

echo ""
echo "Deployment complete!"
echo "NOTE: You need to update the environment variables in the Cloud Run console or via command line with your actual secrets."
echo "You can do this by running:"
echo "gcloud run services update $SERVICE_NAME --update-env-vars SUPABASE_URL=...,SUPABASE_ANON_KEY=... --project $PROJECT_ID --region $REGION"
