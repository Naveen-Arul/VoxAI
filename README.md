# VoxAI - Intelligent Voice Assistant 🎙️✨

A modern, full-stack AI-powered chat application with voice interaction capabilities, web search integration, PDF analysis, and real-time streaming responses.

## 🌟 Features

### 💬 Smart Chat Modes
- **Smart Chat** - AI-powered conversations with GPT-style markdown rendering
- **Voice Chat** - Real-time voice interaction with speech-to-text and text-to-speech
- **Web Search** - AI responses enhanced with live web search results
- **PDF Chat** - Upload and query PDF documents with AI assistance

### 🎨 Modern UI/UX
- Beautiful dark theme with cyan-purple gradient design
- ChatGPT-style markdown rendering with syntax highlighting
- Real-time streaming responses with progressive rendering
- Auto-scroll functionality for seamless chat experience
- Responsive design for desktop and mobile

### 🔐 User Features
- JWT-based authentication
- User profiles with customizable settings
- Chat history persistence in MongoDB
- Auto-generated chat titles using AI
- Search and manage conversations

### ⚡ Technical Highlights
- **Real-time Streaming**: Progressive AI response rendering
- **Markdown Support**: Full GitHub Flavored Markdown with code highlighting
- **Emoji Integration**: Joyful responses with meaningful emojis 😊
- **Auto-scroll**: Smooth scrolling that pauses on user interaction
- **Optimistic Updates**: Instant UI feedback for better UX

---

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **Framework**: FastAPI with async/await support
- **Database**: MongoDB Atlas for chat history and user data
- **AI Engine**: Groq API (llama-3.1-8b-instant model)
- **Authentication**: JWT tokens with bcrypt password hashing
- **APIs**: RESTful endpoints + Server-Sent Events for streaming

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and HMR
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks with local state
- **Markdown**: react-markdown + remark-gfm + rehype-highlight
- **Routing**: React Router DOM with animated transitions

---

## 📁 Project Structure

```
VOX-AI/
├── BACKEND/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── config/
│   │   ├── database.py        # MongoDB connection
│   │   ├── settings.py        # Environment configuration
│   │   └── logging_config.py  # Logging setup
│   ├── models/
│   │   ├── user.py            # User models
│   │   ├── chat.py            # Chat & Message models
│   │   └── document.py        # PDF document models
│   ├── routes/
│   │   ├── auth_routes.py     # Authentication endpoints
│   │   ├── chat_routes.py     # Chat endpoints + streaming
│   │   ├── text_routes.py     # Text chat endpoints
│   │   └── voice_routes.py    # Voice chat WebSocket
│   ├── services/
│   │   ├── llm_service.py     # Groq AI integration
│   │   ├── chat_service.py    # Chat history management
│   │   ├── db_service.py      # Database operations
│   │   ├── stt_service.py     # Speech-to-text
│   │   ├── tts_service.py     # Text-to-speech
│   │   ├── pdf_service.py     # PDF processing
│   │   └── web_search_service.py  # Web search integration
│   └── utils/
│       ├── auth.py            # JWT utilities
│       └── audio_utils.py     # Audio processing
│
├── FRONTEND/
│   ├── src/
│   │   ├── main.tsx           # App entry point
│   │   ├── App.tsx            # Root component
│   │   ├── index.css          # Global styles + markdown CSS
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx       # Message bubble with markdown
│   │   │   ├── ChatInput.tsx         # Message input field
│   │   │   ├── ChatSidebar.tsx       # Conversation history
│   │   │   ├── ChatModeSelector.tsx  # Mode switcher
│   │   │   ├── VoiceControl.tsx      # Voice recording button
│   │   │   ├── PdfUploader.tsx       # PDF upload component
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Main chat interface
│   │   │   ├── Auth.tsx             # Login/Signup
│   │   │   └── Analytics.tsx        # User analytics
│   │   ├── hooks/
│   │   │   ├── useAutoScroll.ts     # Auto-scroll logic
│   │   │   ├── useTextToSpeech.ts   # TTS hook
│   │   │   └── useSpeechRecognition.ts  # STT hook
│   │   └── lib/
│   │       ├── api.ts               # API client
│   │       └── utils.ts             # Utility functions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm/bun
- **MongoDB Atlas** account (or local MongoDB)
- **Groq API Key** ([Get it here](https://console.groq.com))

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd BACKEND
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file**
   ```env
   # MongoDB
   MONGODB_URL=your_mongodb_connection_string
   DATABASE_NAME=voxai_db

   # Groq API
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.1-8b-instant

   # JWT Secret
   JWT_SECRET_KEY=your_secret_key_minimum_32_characters
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080

   # CORS
   CORS_ORIGINS=http://localhost:8080,http://localhost:5173
   ```

5. **Run the backend**
   ```bash
   python main.py
   ```

   Backend will start at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd FRONTEND
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Create `.env` file**
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

   Frontend will start at `http://localhost:8080`

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URL` | MongoDB connection string | ✅ |
| `DATABASE_NAME` | Database name | ✅ |
| `GROQ_API_KEY` | Groq API key for LLM | ✅ |
| `GROQ_MODEL` | AI model name | ✅ |
| `JWT_SECRET_KEY` | Secret for JWT signing | ✅ |
| `JWT_ALGORITHM` | JWT algorithm (HS256) | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | ✅ |
| `CORS_ORIGINS` | Allowed CORS origins | ✅ |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile

### Chat
- `POST /api/v1/chat/start` - Start new chat
- `POST /api/v1/chat/{id}/message` - Send message (non-streaming)
- `POST /api/v1/chat/{id}/stream` - Send message with streaming response
- `GET /api/v1/chat/list` - Get all user chats
- `GET /api/v1/chat/{id}/messages` - Get chat messages
- `DELETE /api/v1/chat/{id}` - Delete chat

### Voice Chat
- `WS /api/v1/voice-chat` - WebSocket for voice interaction

---

## 🎨 UI Features

### Markdown Rendering
- **Headings**: H1-H6 with primary color styling
- **Code Blocks**: Syntax highlighting with GitHub Dark theme
- **Inline Code**: Accent-colored code snippets
- **Lists**: Bulleted and numbered lists
- **Tables**: Striped rows with borders
- **Blockquotes**: Left-border accent style
- **Links**: Hover effects with primary color
- **Emojis**: Full emoji support 🎉

### Chat Modes
1. **Smart Chat** (🧠) - General AI conversations
2. **Voice Chat** (🎙️) - Speech-enabled interaction
3. **Web Search** (🌐) - AI + live web results
4. **PDF Chat** (📄) - Query uploaded documents

---

## 🛠️ Tech Stack

### Backend
- FastAPI
- Motor (async MongoDB)
- Groq API
- PyJWT
- bcrypt
- uvicorn
- pydantic

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router DOM
- react-markdown
- remark-gfm
- rehype-highlight
- Framer Motion

---

## 🔒 Security Features

- JWT-based authentication with HTTP-only tokens
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- Environment variable management
- Secure API key handling

---

## 🚧 Development

### Running Tests
```bash
# Backend
cd BACKEND
python test_backend.py

# Frontend (if tests are configured)
cd FRONTEND
npm test
```

### Building for Production

**Backend:**
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**
```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📝 Key Features Implementation

### 1. Streaming Responses
- Server-Sent Events (SSE) for progressive rendering
- `max_tokens: 4096` for full-length responses
- Real-time chunk collection in frontend
- Smooth auto-scroll during streaming

### 2. Auto-Scroll Behavior
- Detects user scroll position
- Pauses auto-scroll when user scrolls up
- Resumes when near bottom (150px threshold)
- Smooth scrolling animation

### 3. Chat History
- Auto-generated chat titles using AI
- MongoDB persistence with timestamps
- Chat mode badges (Smart, Voice, Web, PDF)
- Search and filter conversations

### 4. Markdown Rendering
- Full GFM (GitHub Flavored Markdown) support
- Syntax highlighting for 180+ languages
- Custom CSS for dark theme
- Emoji preservation in responses

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) - Fast AI inference
- [MongoDB](https://www.mongodb.com) - Database solution
- [FastAPI](https://fastapi.tiangolo.com) - Modern Python API framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Highlight.js](https://highlightjs.org) - Syntax highlighting

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, React, and AI**
