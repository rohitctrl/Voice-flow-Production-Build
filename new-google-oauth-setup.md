# Create New Google OAuth Client - Step by Step

## Step 1: Create New OAuth Client

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials

2. **Click "Create Credentials"**
   - Choose "OAuth 2.0 Client IDs"

3. **Select Application Type**
   - Choose "Web application"

4. **Configure the Client**
   - **Name**: `Voiceflow V2 Production`
   - **Authorized JavaScript origins**:
     ```
     https://voiceflow-v2.vercel.app
     http://localhost:3000
     http://localhost:3001
     ```
   - **Authorized redirect URIs**:
     ```
     https://voiceflow-v2.vercel.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     http://localhost:3001/api/auth/callback/google
     ```

5. **Click "Create"**
   - Copy the **Client ID** and **Client Secret**

## Step 2: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - https://console.cloud.google.com/apis/credentials/consent

2. **Fill Required Fields**
   - **App name**: `Voiceflow V2`
   - **User support email**: `iamrohitrk160@gmail.com`
   - **Developer contact**: `iamrohitrk160@gmail.com`

3. **Add Scopes** (if needed)
   - Add `email` and `profile` scopes

4. **Publish the App**
   - Click "Publish App" at the bottom
   - Or add `iamrohitrk160@gmail.com` as test user

## Step 3: Update Environment Variables
After creating the new client, update these values in Vercel.
