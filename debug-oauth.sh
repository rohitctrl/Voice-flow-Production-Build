#!/bin/bash

echo "🔍 Debugging OAuth Configuration..."
echo ""

# Current production URL
PROD_URL="https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app"

echo "📍 Production URL: $PROD_URL"
echo ""

# Test NextAuth endpoints
echo "🧪 Testing NextAuth endpoints..."

echo "1. Testing /api/auth/providers:"
curl -s "$PROD_URL/api/auth/providers" | head -c 200
echo -e "\n"

echo "2. Testing /api/auth/session:"
curl -s "$PROD_URL/api/auth/session" | head -c 200
echo -e "\n"

echo "3. Testing /api/auth/csrf:"
curl -s "$PROD_URL/api/auth/csrf" | head -c 200
echo -e "\n"

echo "🔧 OAuth Configuration Check:"
echo ""
echo "Google OAuth URLs to verify in Google Cloud Console:"
echo "  - Authorized JavaScript origins: $PROD_URL"
echo "  - Authorized redirect URIs: $PROD_URL/api/auth/callback/google"
echo ""
echo "GitHub OAuth URLs to verify in GitHub Developer Settings:"
echo "  - Homepage URL: $PROD_URL"  
echo "  - Authorization callback URL: $PROD_URL/api/auth/callback/github"
echo ""

# Check if we can access the sign-in page
echo "4. Testing sign-in page:"
curl -I -s "$PROD_URL/auth/signin" | grep -E "(HTTP|Location|Set-Cookie)"
echo ""

echo "✅ Debug completed. Check the responses above for any errors."
