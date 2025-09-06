#!/bin/bash

# This script adds all environment variables to Vercel
# Make sure to update the NEXTAUTH_URL after deployment
#
# USAGE: Set the following environment variables before running this script:
# export GOOGLE_CLIENT_ID="your_google_client_id"
# export GOOGLE_CLIENT_SECRET="your_google_client_secret"
# export GITHUB_ID="your_github_id"
# export GITHUB_SECRET="your_github_secret"
# export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
# export NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
# export SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
# export ASSEMBLYAI_API_KEY="your_assemblyai_key"

echo "Adding environment variables to Vercel..."

# OAuth Providers
vercel env add GOOGLE_CLIENT_ID production <<< "$GOOGLE_CLIENT_ID"
vercel env add GOOGLE_CLIENT_SECRET production <<< "$GOOGLE_CLIENT_SECRET"
vercel env add GITHUB_ID production <<< "$GITHUB_ID"
vercel env add GITHUB_SECRET production <<< "$GITHUB_SECRET"

# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"

# AssemblyAI
vercel env add ASSEMBLYAI_API_KEY production <<< "$ASSEMBLYAI_API_KEY"

echo "Environment variables added successfully!"
echo ""
echo "IMPORTANT: After deployment, you need to:"
echo "1. Get your production URL from Vercel"
echo "2. Update NEXTAUTH_URL to your production URL using:"
echo "   vercel env rm NEXTAUTH_URL production"
echo "   vercel env add NEXTAUTH_URL production"
echo "   Then enter: https://your-app.vercel.app"
