# AI Mock Interview Platform
Mock Interview AI

An AI-powered platform that lets students and job seekers practice real interviews — technical, HR, and behavioural — in a realistic, voice-based environment, and get instant, personalized feedback on how they did.

Why I built this

A lot of students feel nervous before interviews, especially when they don't have access to professional career coaching or a friend willing to play "interviewer" for an hour. I wanted to build something that could act like a real interviewer — ask proper questions, actually listen to the answer, and give honest, specific feedback — so anyone could practice as many times as they needed, whenever they wanted, without feeling judged.

This started as a university project for my Enterprise Application Development course, but I kept extending it past the original scope because I genuinely wanted to use it myself before my own interviews.

What it actually does


Asks real interview questions — technical, HR, and behavioural, based on company, role, and round.
Resume-based interviews — upload your resume (.docx or .txt) and the AI generates questions tailored specifically to your own experience and skills, instead of generic ones.
Voice or text answers — speak your answer out loud (using your browser's speech recognition) or type it, whichever you're more comfortable with.
Instant AI feedback — every answer gets scored on clarity, relevance, and confidence, with specific strengths and a concrete suggestion for what to improve.
Progress tracking — a dashboard shows your score history over time, your best score, and how many companies/roles you've practiced for.
Quit anytime — if you need to stop halfway through a session, you can exit cleanly instead of being stuck mid-interview.
Password recovery — forgot your password? Reset it through a secure emailed link instead of being locked out.


How it's built

LayerWhat I usedFrontendNext.js (App Router), React, Tailwind CSSBackendNext.js API routes (Node.js)DatabaseMongoDB with MongooseAuthenticationJWT + bcrypt password hashingAI question generation & evaluationGoogle Gemini APIVoiceElevenLabs (text-to-speech) + browser Speech RecognitionAvatarD-IDChartsRechartsIconslucide-reactEmail (password reset)Nodemailer via Gmail SMTP

Getting it running locally


Clone the repo


   git clone https://github.com/<your-username>/mock-interview-ai.git
   cd mock-interview-ai


Install dependencies


   npm install


Set up your environment variables — create a .env.local file in the root folder:


   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

   EMAIL_USER=your_gmail_address
   EMAIL_APP_PASSWORD=your_gmail_app_password
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Add your own keys for whichever AI/voice services you're using:
   # Gemini, ElevenLabs, D-ID, etc.

Never commit this file — it's already covered by .gitignore.


Run the dev server


   npm run dev


Open http://localhost:3000 in your browser.


A few honest notes


This is a student project, built and iterated on over a few months — it's not a polished commercial product, and there's more I want to add (better resume parsing, more question categories, proper analytics).
The free-tier MongoDB Atlas cluster and Gmail SMTP work fine for development and small-scale use, but would need upgrading for real production traffic.
Legacy .doc resume files (the old pre-2007 Word format) aren't supported — only .docx and .txt.


What's next


Support for more resume formats (PDF parsing)
More interview categories beyond HR/Technical/Behavioural
A proper analytics page comparing performance across companies and roles
Deployment to a custom domain



Built by Safia Mirbahar as part of an Enterprise Application Development project.