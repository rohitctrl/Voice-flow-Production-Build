# Voiceflow - AI-Powered Voice Transcription Landing Page

A beautiful, interactive landing page showcasing voice-to-text transcription capabilities with real AssemblyAI integration.

## 🚀 Features

- **Interactive Voice Demo** - Real voice recording with live waveform visualization
- **AssemblyAI Integration** - Industry-leading transcription accuracy (99%+)
- **Responsive Design** - Works perfectly on all devices
- **Animated Sections** - Smooth Framer Motion animations
- **Complete Landing Page** - Hero, demo, benefits, use cases, comparisons, and more

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AssemblyAI (Optional but Recommended)

To enable real AI transcription, you'll need an AssemblyAI API key:

1. **Get your free API key:**
   - Visit [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard/)
   - Sign up for a free account
   - Copy your API key from the dashboard

2. **Add API key to environment:**
   - Open `.env.local` in the root directory
   - Replace `your_api_key_here` with your actual API key:
   ```
   ASSEMBLYAI_API_KEY=your_actual_api_key_here
   ```

### 3. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the landing page.

## 🎤 Voice Demo Features

- **Real Voice Recording** - Uses browser MediaRecorder API
- **Live Audio Visualization** - Interactive waveform with mouse responsiveness  
- **AI Transcription** - Powered by AssemblyAI (with fallback to demo mode)
- **Error Handling** - Graceful degradation if API key is missing
- **Mobile Support** - Works on mobile devices with microphone access

## 📁 Project Structure

```
├── app/
│   ├── api/transcribe/route.ts    # AssemblyAI integration
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page
├── components/ui/
│   ├── sonic-waveform.tsx         # Hero section with animated background
│   ├── interactive-demo.tsx       # Voice recording demo
│   ├── benefits-section.tsx       # Benefits showcase
│   ├── use-cases-section.tsx      # Use cases and industries
│   ├── how-it-works-section.tsx   # 3-step process
│   ├── comparison-section.tsx     # Competitor comparisons
│   ├── features-section.tsx       # Interactive feature cards
│   └── evervault-card.tsx         # Animated card component
└── lib/
    └── utils.ts                   # Utility functions
```

## 🌐 Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **AssemblyAI** - Voice transcription
- **Lucide React** - Icons

## 🎨 Design Features

- **Glassmorphism UI** - Modern glass-like effects
- **Animated Waveforms** - Real-time audio visualization
- **Interactive Elements** - Hover effects and micro-interactions
- **Professional Typography** - Beautiful gradient text effects
- **Conversion-Optimized** - Strategic CTAs and social proof

## 📝 Notes

- Without an AssemblyAI API key, the demo will use mock transcription data
- The demo works best with clear audio and minimal background noise
- All voice data is processed securely and not stored permanently
- The landing page follows modern conversion optimization best practices

## 🔗 Links

- [AssemblyAI Documentation](https://www.assemblyai.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Built with ❤️ using modern web technologies. Ready for production deployment!