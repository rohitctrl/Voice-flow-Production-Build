# OAuth Configuration Quick Reference

## Your Custom URL
`https://voiceflow-v2.vercel.app`

## Google Cloud Console Settings
**Console**: https://console.cloud.google.com/apis/credentials
**Client ID**: 882215036175-t6rtkpb0lthmf7urb8rkrukatplkllml.apps.googleusercontent.com

### Authorized JavaScript Origins:
- `https://voiceflow-v2.vercel.app`
- `http://localhost:3000` (for local development)
- `http://localhost:3001` (for local development)

### Authorized Redirect URIs:
- `https://voiceflow-v2.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google` (for local development)
- `http://localhost:3001/api/auth/callback/google` (for local development)

## GitHub Developer Settings
**Console**: https://github.com/settings/developers
**Client ID**: Ov23libT7WKcvhf3CeIJ

### Settings:
- **Homepage URL**: `https://voiceflow-v2.vercel.app`
- **Authorization callback URL**: `https://voiceflow-v2.vercel.app/api/auth/callback/github`

## Test URLs After Configuration:
- **Your App**: https://voiceflow-v2.vercel.app
- **Sign In Page**: https://voiceflow-v2.vercel.app/auth/signin
- **API Providers Test**: https://voiceflow-v2.vercel.app/api/auth/providers
