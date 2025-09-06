# Google OAuth Troubleshooting Checklist

## Error: "Error 401: invalid_client"

### Common Causes:
1. **Wrong Project**: You might be looking at the wrong Google Cloud project
2. **Missing URLs**: The redirect URI isn't added to the OAuth client
3. **Typos**: Small differences in URLs (trailing slash, http vs https)
4. **Client Not Published**: OAuth client might be in testing mode

### Step-by-Step Fix:

#### 1. Verify Project & Client
- Go to: https://console.cloud.google.com/apis/credentials
- **Make sure project dropdown shows the correct project**
- Look for Client ID: `882215036175-t6rtkpb0lthmf7urb8rkrukatplkllml.apps.googleusercontent.com`

#### 2. Edit OAuth Client
Click the pencil icon next to your OAuth client and verify:

**Authorized JavaScript origins:**
```
https://voiceflow-v2.vercel.app
```
(NO trailing slash!)

**Authorized redirect URIs:**
```
https://voiceflow-v2.vercel.app/api/auth/callback/google
```
(Exact match required!)

#### 3. OAuth Consent Screen
- Go to "OAuth consent screen" in the left menu
- Make sure status is "Published" or add test users
- If in testing mode, add your email `iamrohitrk160@gmail.com` as a test user

#### 4. Enable Required APIs
Make sure these APIs are enabled:
- Google+ API (if available)
- Google Identity API
- People API (optional but recommended)

#### 5. Common Mistakes to Avoid:
- ❌ Don't add trailing slash to origins: `https://voiceflow-v2.vercel.app/`
- ❌ Don't use different protocols (http vs https)  
- ❌ Don't forget the `/api/auth/callback/google` part in redirect URI
- ❌ Don't use the auto-generated Vercel URLs

#### 6. If Still Not Working:
Try creating a new OAuth client:
1. Click "Create Credentials" → "OAuth 2.0 Client IDs"
2. Choose "Web application"
3. Add the exact URLs above
4. Copy the new Client ID and Secret
5. Update your Vercel environment variables
