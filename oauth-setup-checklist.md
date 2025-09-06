# OAuth Configuration Checklist

## Current Production URL
`https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app`

## ✅ Google OAuth Setup
**Console**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

1. **Client ID**: `882215036175-t6rtkpb0lthmf7urb8rkrukatplkllml.apps.googleusercontent.com`
2. **Update Authorized JavaScript Origins**:
   - ✅ Add: `https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app`
3. **Update Authorized Redirect URIs**:
   - ✅ Add: `https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app/api/auth/callback/google`

## ✅ GitHub OAuth Setup
**Console**: [GitHub Developer Settings](https://github.com/settings/developers)

1. **Client ID**: `Ov23libT7WKcvhf3CeIJ`
2. **Update Homepage URL**:
   - ✅ Set to: `https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app`
3. **Update Authorization Callback URL**:
   - ✅ Set to: `https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app/api/auth/callback/github`

## ✅ Vercel Environment Variables
All environment variables have been added to Vercel production:
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ GITHUB_ID
- ✅ GITHUB_SECRET

## Testing Steps
1. Go to your production app: https://voiceflow-h73pduyki-rohitctrls-projects.vercel.app
2. Click "Sign In"
3. Try signing in with Google
4. Try signing in with GitHub

## Troubleshooting
If you still can't sign in after updating the OAuth configurations:

1. **Clear browser cache and cookies**
2. **Try incognito/private mode**
3. **Check browser console for errors**
4. **Verify the OAuth configurations were saved correctly**

## Important Notes
- Changes to OAuth providers can take a few minutes to propagate
- Make sure to save all changes in both Google Cloud Console and GitHub
- Keep localhost configurations for local development
