# Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sarvasva
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas and update MONGODB_URI in .env
```

### 4. Run the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## First Steps

1. **Register an Account**
   - Go to http://localhost:5173
   - Click "Login" → "Register"
   - Choose role: Student, Instructor, or Both
   - Students get 100 initial credits

2. **As a Student:**
   - Browse courses on homepage
   - Enroll in courses (spends credits)
   - Watch videos with multilingual support
   - Upload documents and get AI summaries
   - Take assessments and earn credits
   - Chat with peers
   - Complete courses to get certificates

3. **As an Instructor:**
   - Upload courses with videos
   - Set course prices
   - Schedule live classes
   - Earn credits from enrollments

## Features to Test

### Student Features
- ✅ Course enrollment
- ✅ Video player with subtitles
- ✅ Floating chatbot (bottom right)
- ✅ Document upload and summarization
- ✅ Peer-to-peer chat
- ✅ AI assessments
- ✅ Credits system

### Instructor Features
- ✅ Course creation
- ✅ Live class scheduling
- ✅ Credits earnings tracking

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For MongoDB Atlas, ensure IP is whitelisted

### Port Already in Use
- Change PORT in .env
- Or kill the process using the port

### Module Not Found
- Delete node_modules and package-lock.json
- Run `npm install` again

## Production Deployment

1. Build frontend:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Deploy backend to cloud service
4. Deploy frontend to static hosting
5. Configure CORS and MongoDB Atlas

## Notes

- Some AI features are simulated (chatbot, summarizer) - integrate with OpenAI API for production
- Video URLs should be publicly accessible or use a video hosting service
- File uploads are stored in `server/uploads/` - configure cloud storage for production

Enjoy building! 🚀

