# Educational Platform - Complete Development Prompt for Lovable

## Project Overview
Build a fully functional, professional educational platform using MERN stack (MongoDB, Express.js, React, Node.js) with advanced features for both students and instructors. The platform should have a modern, animated UI with black and white theme, selective color accents, and interactive 3D elements.

## Tech Stack Requirements
- **Frontend**: React (Single Page Application), Tailwind CSS, JSX, shadcn/ui components
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Additional**: WebSocket for real-time features, WebRTC for live classes, AI integration for translations and chatbot

---

## UI/UX Design Requirements

### Theme & Visual Design
- **Primary Theme**: Black and white with selective color accents
- **Style**: Professional, modern, eye-catching
- **Animations**: 
  - 3D particle effects in background
  - Smooth transitions and hover effects
  - Interactive elements throughout
- **Responsive**: Fully responsive design for all screen sizes

### Layout Structure
- **Single Page Application (SPA)** with React Router
- **Navbar**: Always visible, contains:
  - Logo (left side)
  - Navigation tabs (center)
  - Login/Logout button (right)
  - Profile icon/dropdown (right)
- **Main Content Area**: Dynamic based on route

---

## Homepage Design

### Layout
- Hero section with animated 3D particles background
- Course grid display in card format
- Each course card should show:
  - Course thumbnail/image
  - Course title
  - Instructor name
  - Course description (truncated)
  - Price (in credits)
  - "View Details" or "Enroll" button
  - Rating/reviews (if available)

### Interactions
- Clicking on course card without login → Opens login modal/popup
- Clicking with login → Navigate to course details page
- Smooth card hover animations
- Filter/search functionality for courses

---

## Student Dashboard Features

### Navigation Tabs (in Navbar)
1. **My Courses** - List of enrolled courses
2. **Credits Earned** - Display total credits, transaction history
3. **Course Completed** - List with:
   - Course name
   - Credits earned
   - Downloadable certificates
4. **Documents** - Upload and manage:
   - Textbooks
   - Notes
   - Other learning materials
5. **Summarizer** - AI-powered summarization of:
   - Uploaded documents
   - Course videos
   - Course content
6. **Peer Communication** - Peer-to-peer chat tab
7. **AI Assessments** - Quizzes and assignments for enrolled courses
8. **Profile** - User profile management
9. **Logout** - Sign out button

### Floating Chat Icon
- **Circular icon** always visible on the page (bottom right corner)
- Opens multilingual chatbot when clicked
- Features:
  - Real-time explanation based on video timestamps
  - Document upload capability within chat
  - Multilingual support
  - Chat history
  - Smooth slide-in animation

### Course Video Player Features
- **Multilingual Real-time Translation**:
  - Subtitles in multiple languages
  - Real-time speech-to-text conversion
  - Language selector dropdown
- **Board Text Translation**:
  - OCR (Optical Character Recognition) for text on board
  - Real-time translation of detected text
  - Highlight detected text areas
- **Video Controls**:
  - Play/pause, seek, volume
  - Speed control
  - Fullscreen
  - Timestamp bookmarking

### Credits System
- **Initial Credits**: New students receive starting credits on first login
- **Earn Credits**: 
  - Completing courses
  - Completing assessments
  - Participating in discussions
- **Spend Credits**: 
  - Purchase courses
  - Access premium features
- **Display**: 
  - Total credits prominently in navbar
  - Transaction history in "Credits Earned" tab

### AI Assessments
- **Quiz System**:
  - Multiple choice questions
  - True/False questions
  - Fill in the blanks
  - AI-generated questions based on course content
- **Assignments**:
  - File upload capability
  - AI-powered grading
  - Feedback and scores
- **Progress Tracking**: Visual progress indicators

### Course Feedback
- After course completion, prompt for feedback:
  - Rating (1-5 stars)
  - Written review
  - Specific feedback categories
  - Submit button

---

## Instructor Dashboard Features

### Navigation Tabs (in Navbar)
1. **Upload Course** - Course creation interface
2. **Live Classes** - Schedule and conduct live sessions
3. **Credits Earned** - Display earnings from course uploads
4. **Profile** - Instructor profile management
5. **Logout** - Sign out button

### Upload Course Interface
- **Form Fields**:
  - Course title
  - Description
  - Category/tags
  - Thumbnail/image upload
  - Video upload (multiple videos)
  - Course price (in credits)
  - Learning objectives
  - Prerequisites
- **Video Processing**:
  - Upload progress indicator
  - Video preview
  - Edit video metadata
- **Credits Calculation**: Automatic credit calculation based on course content/quality

### Live Classes
- **Schedule Interface**:
  - Date and time picker
  - Class title and description
  - Meeting link generation
  - Participant management
- **Live Session**:
  - WebRTC integration for video/audio
  - Screen sharing
  - Chat functionality
  - Recording capability
  - Whiteboard feature

---

## Unified Profile System

### Key Feature
- **Single Profile** for both student and instructor roles
- **Unified Credits Display**:
  - Total credits from both roles
  - Breakdown: "Earned as Student" and "Earned as Instructor"
  - Combined transaction history
- **Role Switching**: Toggle between student and instructor dashboards
- **Profile Information**:
  - Name, email, profile picture
  - Bio/description
  - Skills/interests
  - Account settings

---

## Authentication & Authorization

### Login/Registration
- **Login Modal**: 
  - Email/username and password
  - "Login as Student" and "Login as Instructor" options
  - "Forgot Password" link
  - Social login options (optional)
- **Registration**:
  - Role selection (Student, Instructor, or Both)
  - Email verification
  - Initial credits assignment for students

### Session Management
- JWT-based authentication
- Persistent login
- Secure logout

---

## Real-time Features

### Multilingual Chatbot
- **Integration**: OpenAI API or similar
- **Features**:
  - Context-aware responses
  - Video timestamp integration
  - Document analysis
  - Multilingual support (translate questions/answers)
  - Chat history persistence

### Peer-to-Peer Communication
- **Features**:
  - Real-time messaging
  - Course-specific chat rooms
  - File sharing
  - Online status indicators
  - Notification system

---

## AI & ML Features

### Document Summarizer
- **Input**: Uploaded documents, course videos, course content
- **Output**: 
  - Key points summary
  - Chapter-wise breakdown
  - Visual summary cards
  - Export as PDF/text

### Translation Services
- **Video Subtitles**: Real-time generation and translation
- **Board Text**: OCR + translation
- **Chat Interface**: Multilingual support
- **Supported Languages**: At least 5-10 major languages

### Assessment Generation
- AI-powered quiz generation from course content
- Automatic assignment grading
- Personalized feedback

---

## Database Schema Requirements

### User Model
```
- _id
- email
- password (hashed)
- name
- role (student/instructor/both)
- profilePicture
- credits (total)
- creditsHistory (array)
- enrolledCourses (array)
- createdCourses (array)
- createdAt
- updatedAt
```

### Course Model
```
- _id
- title
- description
- instructorId
- thumbnail
- videos (array)
- price (credits)
- category
- enrolledStudents (array)
- ratings (array)
- createdAt
- updatedAt
```

### Video Model
```
- _id
- courseId
- title
- videoUrl
- duration
- subtitles (multilingual)
- boardTextData (OCR results)
- createdAt
```

### Assessment Model
```
- _id
- courseId
- type (quiz/assignment)
- questions (array)
- dueDate
- submissions (array)
- createdAt
```

### Chat Model
```
- _id
- courseId
- participants (array)
- messages (array)
- createdAt
- updatedAt
```

---

## API Endpoints Required

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/profile

### Courses
- GET /api/courses (all courses)
- GET /api/courses/:id
- POST /api/courses (instructor only)
- PUT /api/courses/:id
- DELETE /api/courses/:id
- POST /api/courses/:id/enroll

### Videos
- GET /api/videos/:courseId
- POST /api/videos/upload
- GET /api/videos/:id/subtitles
- POST /api/videos/translate

### Credits
- GET /api/credits/balance
- GET /api/credits/history
- POST /api/credits/transfer

### Assessments
- GET /api/assessments/:courseId
- POST /api/assessments
- POST /api/assessments/:id/submit
- GET /api/assessments/:id/results

### Documents
- POST /api/documents/upload
- GET /api/documents
- POST /api/documents/summarize
- DELETE /api/documents/:id

### Chat
- GET /api/chat/:courseId
- POST /api/chat/message
- WebSocket: /ws/chat/:courseId

### Live Classes
- POST /api/live-classes/schedule
- GET /api/live-classes
- POST /api/live-classes/:id/join

---

## Component Structure

### Main Components
1. **Navbar** - Navigation with logo, tabs, auth buttons
2. **HomePage** - Course grid with cards
3. **StudentDashboard** - Main student interface
4. **InstructorDashboard** - Main instructor interface
5. **CoursePlayer** - Video player with translation features
6. **ChatBot** - Floating chat interface
7. **CreditsDisplay** - Credits widget in navbar
8. **ProfileModal** - Unified profile component
9. **LoginModal** - Authentication modal
10. **CourseCard** - Reusable course card component
11. **DocumentUploader** - File upload component
12. **AssessmentInterface** - Quiz/assignment component
13. **PeerChat** - Peer-to-peer messaging
14. **LiveClassRoom** - WebRTC video conferencing

### shadcn/ui Components to Use
- Button
- Card
- Dialog/Modal
- Input
- Select
- Tabs
- Avatar
- Badge
- Progress
- Toast/Notification
- Dropdown Menu
- Form components

---

## Animation & Interactive Elements

### 3D Particles Background
- Use libraries like `react-particles` or `three.js`
- Animated particle system on homepage
- Subtle particle effects on other pages
- Performance optimized

### Micro-interactions
- Button hover effects
- Card lift animations
- Smooth page transitions
- Loading skeletons
- Progress indicators
- Success/error animations

---

## Performance Optimization

- Lazy loading for routes
- Image optimization
- Video streaming optimization
- Code splitting
- Caching strategies
- Database indexing

---

## Security Considerations

- Input validation and sanitization
- XSS protection
- CSRF tokens
- Secure file uploads
- Rate limiting
- JWT token expiration
- Password hashing (bcrypt)

---

## Additional Features to Consider

1. **Search Functionality**: Global search for courses, users, content
2. **Notifications**: Real-time notifications for messages, assignments, etc.
3. **Progress Tracking**: Visual progress bars for courses
4. **Certificates**: PDF certificate generation
5. **Analytics Dashboard**: For instructors to see course performance
6. **Mobile App Ready**: Responsive design that works on mobile

---

## Implementation Priority

### Phase 1 (Core Features)
1. Authentication system
2. Homepage with course cards
3. Basic student dashboard
4. Basic instructor dashboard
5. Course upload functionality
6. Credits system (basic)

### Phase 2 (Advanced Features)
1. Video player with translation
2. Chatbot integration
3. Document upload and summarizer
4. Peer-to-peer chat
5. AI assessments

### Phase 3 (Polish)
1. 3D animations
2. Advanced UI/UX improvements
3. Performance optimization
4. Testing and bug fixes

---

## Success Criteria

The platform should:
- ✅ Be fully functional with all listed features
- ✅ Have a professional, modern UI
- ✅ Be responsive across all devices
- ✅ Have smooth animations and interactions
- ✅ Support multilingual features
- ✅ Handle real-time communication
- ✅ Be secure and performant
- ✅ Win a hackathon! 🏆

---

## Final Notes

- Focus on creating an **eye-catching, professional design** that stands out
- Ensure **smooth user experience** with intuitive navigation
- Make it **hackathon-ready** with impressive features and polish
- Use **modern best practices** for code organization and structure
- Implement **error handling** and **loading states** throughout
- Add **helpful tooltips** and **user guidance** where needed

**Good luck with your hackathon! Build something amazing! 🚀**

