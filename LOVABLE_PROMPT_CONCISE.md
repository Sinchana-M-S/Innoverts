# Lovable Prompt - Educational Platform

Build a fully functional MERN stack educational platform with the following specifications:

## Tech Stack
- Frontend: React SPA, Tailwind CSS, JSX, shadcn/ui
- Backend: Node.js, Express.js
- Database: MongoDB
- Real-time: WebSocket, WebRTC

## Design Theme
- Black and white primary theme with selective color accents
- Professional, modern, eye-catching design
- 3D particle animations (react-particles or three.js)
- Smooth transitions and interactive elements
- Fully responsive

## Layout Structure
- Single Page Application with React Router
- Navbar: Logo (left), Navigation tabs (center), Login/Logout + Profile (right)
- Always visible navbar across all pages

## Homepage
- Hero section with 3D particle background
- Course grid in card format showing: thumbnail, title, instructor, description, price (credits), enroll button
- Clicking course without login → opens login modal
- Smooth card hover animations
- Search/filter functionality

## Student Dashboard

### Navbar Tabs:
1. **My Courses** - Enrolled courses list
2. **Credits Earned** - Total credits + transaction history
3. **Course Completed** - List with credits earned + downloadable certificates
4. **Documents** - Upload textbooks/notes with AI summarizer
5. **Summarizer** - AI summarization of documents/videos/courses
6. **Peer Communication** - Peer-to-peer chat tab
7. **AI Assessments** - Quizzes and assignments for enrolled courses
8. **Profile** - Unified profile (student + instructor credits)
9. **Logout**

### Floating Chat Icon (Bottom Right)
- Always visible circular icon
- Opens multilingual chatbot on click
- Features: timestamp-based explanations, document upload, multilingual support, chat history
- Smooth slide-in animation

### Course Video Player Features:
- **Multilingual real-time translation**: Subtitles, speech-to-text, language selector
- **Board text translation**: OCR for text on board, real-time translation, text highlighting
- Standard video controls (play/pause, seek, volume, speed, fullscreen)

### Credits System:
- Initial credits on first login
- Earn: completing courses, assessments, discussions
- Spend: purchase courses, premium features
- Display in navbar + detailed history

### AI Assessments:
- Quiz: Multiple choice, True/False, Fill blanks, AI-generated questions
- Assignments: File upload, AI grading, feedback
- Progress tracking with visual indicators

### Course Feedback:
- Rating (1-5 stars) + written review after completion

## Instructor Dashboard

### Navbar Tabs:
1. **Upload Course** - Form: title, description, category, thumbnail, videos, price (credits), objectives
2. **Live Classes** - Schedule with date/time, WebRTC video conferencing, chat, screen sharing, recording
3. **Credits Earned** - Earnings from course uploads
4. **Profile** - Instructor profile
5. **Logout**

## Unified Profile System
- Single profile for student + instructor roles
- Unified credits: Total with breakdown (earned as student vs instructor)
- Role switching toggle
- Profile info: name, email, picture, bio, settings

## Authentication
- Login modal: Email/password, role selection (Student/Instructor/Both)
- Registration: Role selection, email verification, initial credits for students
- JWT-based, persistent sessions

## Real-time Features
- **Multilingual Chatbot**: OpenAI integration, context-aware, timestamp support, document analysis, multilingual
- **Peer-to-Peer Chat**: Real-time messaging, course-specific rooms, file sharing, online status

## AI Features
- **Document Summarizer**: Upload documents/videos → key points, chapter breakdown, visual cards, PDF export
- **Translation**: Video subtitles, board OCR+translation, chat interface (5-10 languages)
- **Assessment Generation**: AI quiz generation, auto grading, personalized feedback

## Database Models Needed
- User (email, password, role, credits, creditsHistory, enrolledCourses, createdCourses)
- Course (title, description, instructorId, thumbnail, videos, price, category, enrolledStudents, ratings)
- Video (courseId, videoUrl, subtitles, boardTextData)
- Assessment (courseId, type, questions, submissions)
- Chat (courseId, participants, messages)

## Key API Endpoints
- Auth: /api/auth/register, /login, /logout, /profile
- Courses: GET /api/courses, POST /api/courses, POST /api/courses/:id/enroll
- Videos: GET /api/videos/:courseId, POST /api/videos/upload, POST /api/videos/translate
- Credits: GET /api/credits/balance, GET /api/credits/history
- Assessments: GET /api/assessments/:courseId, POST /api/assessments/:id/submit
- Documents: POST /api/documents/upload, POST /api/documents/summarize
- Chat: WebSocket /ws/chat/:courseId
- Live Classes: POST /api/live-classes/schedule, POST /api/live-classes/:id/join

## Components to Build
- Navbar, HomePage, StudentDashboard, InstructorDashboard, CoursePlayer, ChatBot, CreditsDisplay, ProfileModal, LoginModal, CourseCard, DocumentUploader, AssessmentInterface, PeerChat, LiveClassRoom

## shadcn/ui Components
Use: Button, Card, Dialog, Input, Select, Tabs, Avatar, Badge, Progress, Toast, Dropdown Menu, Form

## Animations
- 3D particles on homepage
- Button hover effects, card lift animations
- Smooth page transitions, loading skeletons
- Progress indicators, success/error animations

## Security & Performance
- Input validation, XSS/CSRF protection
- Secure file uploads, rate limiting
- JWT expiration, password hashing
- Lazy loading, code splitting, caching
- Image/video optimization

## Implementation Priority
1. Core: Auth, Homepage, Basic dashboards, Course upload, Credits
2. Advanced: Video translation, Chatbot, Documents, Peer chat, AI assessments
3. Polish: 3D animations, UI improvements, optimization

Make it hackathon-winning with impressive features, professional design, and smooth UX! 🚀

