# Database Setup Instructions

## Issue
Your Supabase database is missing the subscription-related tables that your app expects.

## Solution
You need to run the subscription schema SQL in your Supabase database.

### Steps:

1. **Go to your Supabase Dashboard**
   - https://supabase.com/dashboard/projects

2. **Open SQL Editor**
   - Click on your project
   - Go to "SQL Editor" in the left sidebar

3. **Run the Subscription Schema**
   - Copy the contents of `lib/subscription-schema.sql`
   - Paste it into a new SQL query
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these new tables:
     - `subscription_plans`
     - `user_subscriptions` 
     - `payment_history`
     - `usage_tracking`
     - `webhook_events`

### Alternative: Quick Fix
The current code now works without these tables by defaulting to 'free' tier.
But for full functionality, you'll need the subscription tables.

## Current Status
✅ Upload should work now (defaults to free tier)
🔄 Set up subscription tables for full functionality
