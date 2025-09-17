# Voiceflow - Complete AI-Powered Transcription Platform

A full-featured transcription application with authentication, subscription billing, project management, and comprehensive audio processing capabilities powered by AssemblyAI.

## 🚀 Key Features

### Core Transcription Features
- **Real-time Voice Recording** - Browser-based audio recording with live waveform visualization
- **AssemblyAI Integration** - Industry-leading transcription accuracy (99%+) with speaker diarization
- **Multiple Upload Methods** - Drag-and-drop file upload and direct audio recording
- **Format Support** - Support for various audio formats with intelligent preprocessing

### User Management & Authentication
- **OAuth Authentication** - Google and GitHub OAuth integration via NextAuth.js
- **Secure Session Management** - JWT-based authentication with automatic session handling
- **User Profiles** - Complete user management with profile customization
- **Protected Routes** - Comprehensive route protection and access control

### Project & Content Management
- **Project Organization** - Group transcriptions into organized projects
- **Advanced Search & Filtering** - Powerful search capabilities across all transcriptions
- **Export Functionality** - Multiple export formats (TXT, SRT, DOCX, PDF)
- **Bulk Operations** - Mass export and management of transcriptions

### Subscription & Billing
- **Tiered Subscription Plans** - Free, Pro, and Enterprise tiers with usage limits
- **Razorpay Integration** - Complete payment processing for Indian market
- **Usage Tracking** - Real-time monitoring of transcription hours and file limits
- **Automatic Billing** - Seamless subscription management and renewals

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# AI Transcription Service
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Payment Processing (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Database Setup

1. **Create Supabase Project:**
   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Copy the project URL and anon key

2. **Execute Database Schema:**
   - Run the SQL commands from `lib/subscription-schema.sql` in your Supabase SQL Editor
   - This creates tables for users, subscriptions, payments, and usage tracking

3. **Enable Row Level Security:**
   - RLS policies are automatically created with the schema
   - Ensures user data isolation and security

### 4. Authentication Setup

1. **Configure OAuth Providers:**
   - **Google:** Create OAuth app in [Google Cloud Console](https://console.cloud.google.com/)
   - **GitHub:** Create OAuth app in [GitHub Developer Settings](https://github.com/settings/developers)
   - Add redirect URLs: `http://localhost:3000/api/auth/callback/[provider]`

2. **NextAuth Configuration:**
   - Generate a secret key: `openssl rand -base64 32`
   - Update `lib/auth.ts` with your provider configurations

### 5. Payment Integration (Optional)

1. **Razorpay Setup:**
   - Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Complete KYC verification
   - Generate API keys and webhook secret
   - Configure webhook endpoint: `https://yourdomain.com/api/payments/webhook`

### 6. Run the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 🏗 Application Architecture

### Frontend Pages
- **Landing Page** (`/`) - Marketing site with interactive demo
- **Dashboard** (`/app`) - Main user dashboard with transcription overview
- **Upload** (`/app/upload`) - File upload and audio recording interface
- **Transcriptions** (`/app/transcriptions`) - Transcription management and search
- **Projects** (`/app/projects`) - Project organization and management
- **Settings** (`/app/settings`) - User preferences and account settings
- **Authentication** (`/auth/signin`) - OAuth login interface

### API Endpoints

#### Authentication & User Management
- `GET|POST /api/auth/[...nextauth]` - NextAuth.js authentication handlers
- Session management and OAuth provider callbacks

#### Transcription Services  
- `POST /api/transcribe` - Main AssemblyAI transcription processing
- `POST /api/demo-transcribe` - Demo transcription for landing page
- `POST /api/upload` - File upload handling with validation

#### Payment & Subscription Management
- `GET /api/payments/plans` - Retrieve available subscription plans
- `POST /api/payments/create-order` - Create Razorpay payment order
- `POST /api/payments/verify` - Verify payment completion
- `GET|POST /api/payments/create-subscription` - Subscription management
- `POST /api/payments/webhook` - Razorpay webhook handler for events

### Database Schema (Supabase)

#### Core Tables
- **profiles** - User profiles and metadata
- **transcriptions** - Audio transcription records
- **projects** - Project organization structure
- **subscription_plans** - Available subscription tiers
- **user_subscriptions** - User subscription records
- **payment_history** - Payment transaction log
- **usage_tracking** - Monthly usage statistics
- **webhook_events** - Payment webhook event log

## 📁 Project Structure

```
├── app/
│   ├── api/                        # API route handlers
│   │   ├── auth/[...nextauth]/     # NextAuth.js authentication
│   │   ├── transcribe/             # AssemblyAI integration
│   │   ├── upload/                 # File upload handling
│   │   ├── demo-transcribe/        # Demo transcription
│   │   └── payments/               # Razorpay payment processing
│   ├── app/                        # Protected application pages
│   │   ├── (dashboard)/            # Dashboard layout group
│   │   ├── upload/                 # Upload interface
│   │   ├── transcriptions/         # Transcription management
│   │   ├── projects/               # Project organization
│   │   └── settings/               # User settings
│   ├── auth/                       # Authentication pages
│   ├── globals.css                 # Global styles & Tailwind
│   ├── layout.tsx                  # Root layout with providers
│   └── page.tsx                    # Landing page
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── interactive-demo.tsx    # Landing page demo
│   │   ├── radial-orbital-timeline.tsx  # Animated timeline
│   │   └── user-testimonials-flow.tsx   # Testimonial carousel
│   └── payments/                   # Payment-related components
│       ├── subscription-plans.tsx  # Plan selection interface
│       └── razorpay-checkout.tsx   # Payment processing
├── lib/                            # Core application logic
│   ├── auth.ts                     # NextAuth.js configuration
│   ├── supabase.ts                 # Database client setup
│   ├── supabase-server.ts          # Server-side database
│   ├── supabase-admin.ts           # Admin database operations
│   ├── transcription.ts            # AssemblyAI integration
│   ├── storage.ts                  # File storage management
│   ├── subscription.ts             # Subscription utilities
│   ├── razorpay.ts                 # Payment processing
│   ├── export.ts                   # Export functionality
│   └── utils.ts                    # Utility functions
├── testsprite_tests/               # Automated test suite
└── test-results/                   # Test execution results
```

## 🌐 Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 18** - Component-based UI library
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation and motion graphics

### Authentication & Security
- **NextAuth.js** - Complete authentication solution
- **OAuth Providers** - Google and GitHub integration
- **JWT Tokens** - Secure session management
- **Row Level Security** - Database-level access control

### Database & Storage
- **Supabase** - PostgreSQL database with real-time features
- **Prisma Adapter** - Database ORM integration
- **File Storage** - Secure audio file management
- **Real-time Subscriptions** - Live data updates

### AI & Processing
- **AssemblyAI** - State-of-the-art speech recognition
- **Speaker Diarization** - Multiple speaker identification
- **Audio Processing** - Format conversion and optimization
- **Intelligent Transcription** - Context-aware text processing

### Payment & Billing
- **Razorpay** - Complete payment processing for Indian market
- **Subscription Management** - Recurring billing automation
- **Webhook Processing** - Real-time payment event handling
- **Usage Tracking** - Consumption monitoring and limits

### Testing & Quality Assurance
- **Playwright** - End-to-end browser testing
- **TestSprite** - AI-powered test generation and execution
- **Multi-browser Testing** - Chrome, Firefox, Safari, Edge support
- **Device Testing** - Mobile and desktop responsive testing
- **Automated CI/CD** - Continuous integration workflows

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Comprehensive icon set

## 🧪 Testing & Quality Assurance

### Test Coverage
- **215 Total Tests** across multiple scenarios
- **69% Pass Rate** for implemented features
- **Cross-browser Compatibility** - Chrome, Firefox, Safari, Edge
- **Mobile Responsiveness** - iOS Safari, Android Chrome
- **Accessibility Testing** - Screen reader and keyboard navigation

### Test Categories
1. **Authentication Flow Tests** - OAuth login, session management, logout
2. **Upload & Recording Tests** - File upload, audio recording, format validation
3. **Transcription Processing** - AI accuracy, speaker diarization, error handling
4. **User Interface Tests** - Navigation, responsiveness, interactive elements
5. **Payment Flow Tests** - Subscription creation, payment processing, webhooks
6. **Data Management Tests** - Search, filtering, export functionality

### Automated Testing Pipeline
- **TestSprite Integration** - AI-generated test scenarios
- **Continuous Testing** - Automated test execution on code changes
- **Visual Regression Testing** - UI consistency validation
- **Performance Testing** - Load time and user experience metrics

## 🚀 Production Features

### Performance Optimizations
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Optimized landing page performance
- **Image Optimization** - Automatic WebP conversion and lazy loading
- **Code Splitting** - Dynamic imports for faster loading
- **CDN Integration** - Global content delivery

### Security Features
- **HTTPS Enforcement** - End-to-end encryption
- **CSRF Protection** - Cross-site request forgery prevention
- **Input Validation** - Server and client-side data validation
- **Rate Limiting** - API abuse prevention
- **Audit Logging** - Comprehensive security event tracking

### Monitoring & Analytics
- **Error Tracking** - Real-time error reporting and alerting
- **Performance Monitoring** - Application performance insights
- **Usage Analytics** - User behavior and feature adoption
- **Payment Analytics** - Revenue and conversion tracking
- **System Health** - Infrastructure monitoring and alerts

## 💼 Subscription Plans

### Free Tier
- **5 hours** of transcription per month
- **25MB** maximum file size
- **3 projects** limit
- Basic export formats (TXT, SRT)
- Community support

### Pro Tier - ₹29/month
- **Unlimited** transcription hours
- **500MB** maximum file size  
- **Unlimited** projects
- All export formats (TXT, SRT, DOCX, PDF)
- Speaker diarization
- Priority support

### Enterprise Tier - ₹99/month
- Everything in Pro
- **1000MB** maximum file size
- API access for integrations
- Advanced analytics
- Custom export formats
- Dedicated support

## 🔧 Development & Deployment

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd voiceflow-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys and configuration

# Run database migrations
# Execute SQL from lib/subscription-schema.sql in Supabase

# Start development server
npm run dev
```

### Production Deployment

#### Vercel (Recommended)
```bash
# Build optimization
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Configure custom domain and SSL
```

#### Docker Deployment
```bash
# Build Docker image
docker build -t voiceflow-v2 .

# Run with environment variables
docker run -p 3000:3000 --env-file .env.local voiceflow-v2
```

### Environment Variables Checklist
- [ ] Database URLs and keys (Supabase)
- [ ] Authentication secrets (NextAuth.js)
- [ ] OAuth provider credentials
- [ ] AssemblyAI API key
- [ ] Razorpay payment keys
- [ ] Production domain configuration

## 📊 Usage Analytics & Monitoring

### Key Metrics Tracked
- **Monthly Active Users** - Unique authenticated users per month
- **Transcription Hours** - Total processing time across all users
- **Subscription Conversions** - Free-to-paid upgrade rate
- **Average Revenue Per User** - Monthly revenue metrics
- **File Processing Stats** - Success rates and error analytics

### Error Monitoring
- Real-time error tracking with stack traces
- Performance bottleneck identification
- User experience monitoring
- API rate limiting and usage patterns

## 🔒 Security & Compliance

### Data Protection
- **Encryption** - All data encrypted at rest and in transit
- **Access Controls** - Role-based permissions and RLS
- **Audit Logging** - Complete activity tracking
- **GDPR Compliance** - Data privacy and user rights
- **Secure Authentication** - OAuth 2.0 and JWT standards

### Payment Security
- **PCI DSS Compliance** - Through Razorpay integration
- **Secure Webhooks** - Cryptographic signature verification
- **Fraud Prevention** - Transaction monitoring and validation
- **Data Minimization** - Only essential payment data stored

## 🆘 Troubleshooting

### Common Issues

#### Authentication Problems
- Verify OAuth app configurations
- Check NEXTAUTH_URL matches deployed domain
- Ensure callback URLs are properly configured

#### Payment Integration Issues
- Confirm Razorpay webhook URL is accessible
- Validate webhook signature verification
- Check test vs. production API keys

#### Transcription Failures
- Verify AssemblyAI API key is valid
- Check file format compatibility
- Monitor API rate limits and quotas

#### Database Connection Issues
- Confirm Supabase URL and keys
- Verify RLS policies are active
- Check database schema deployment

## 🔗 Documentation & Resources

### Official Documentation
- [AssemblyAI API](https://www.assemblyai.com/docs/) - Voice transcription service
- [NextAuth.js](https://next-auth.js.org/) - Authentication solution
- [Supabase](https://supabase.com/docs) - Database and backend services
- [Razorpay](https://razorpay.com/docs/) - Payment processing
- [Next.js](https://nextjs.org/docs) - React framework
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first styling
- [Framer Motion](https://www.framer.com/motion/) - Animation library

### Additional Resources
- [Playwright Testing](https://playwright.dev/) - End-to-end testing
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vercel](https://vercel.com/docs) - Deployment platform

### Support & Community
- **Technical Issues** - Create GitHub issues for bug reports
- **Feature Requests** - Submit enhancement proposals
- **Security Concerns** - Report via private disclosure

---

## 🎉 Recent Updates (Version 2.0)

### Major Features Added
✅ **Complete Authentication System** - OAuth with Google/GitHub  
✅ **Subscription & Billing** - Razorpay integration with tiered plans  
✅ **Project Management** - Organize transcriptions into projects  
✅ **Advanced Search & Export** - Multiple formats with bulk operations  
✅ **Comprehensive Testing** - 215+ automated tests across browsers  
✅ **Production Security** - RLS, encryption, audit logging  
✅ **Mobile Responsiveness** - Full mobile app experience  
✅ **Real-time Features** - Live updates and processing status  

### Technical Improvements
- Upgraded to Next.js 15 with App Router
- Full TypeScript implementation
- Comprehensive error handling and monitoring
- Optimized performance and SEO
- Enhanced UI/UX with modern design patterns

---

**Built with ❤️ for the future of voice technology. Ready for production deployment!**

*Voiceflow V2 - Transforming audio into actionable insights with enterprise-grade security and scalability.*
