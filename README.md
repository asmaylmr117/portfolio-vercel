# Portfolio Backend API
A modern backend API for the portfolio built with Express.js and MongoDB, optimized for deployment on Vercel with advanced security and performance features.

## 🚀 Features
- **Express.js**: Fast and flexible Node.js framework
- **MongoDB Atlas**: Cloud-based database with connection pooling
- **Mongoose**: ODM for MongoDB with advanced configurations
- **Security**: Helmet, CORS, Rate Limiting, API Key Authentication
- **Performance**: Compression, Caching, Connection Pooling
- **Vercel Ready**: Fully optimized for serverless deployment
- **Debug Tools**: Built-in debugging endpoints for development

## 📁 Project Structure
```
portfolio-backend/
├── server.js             # Main server file (updated)
├── package.json          # Dependencies & scripts
├── vercel.json           # Vercel deployment settings
├── .env.example          # Example environment variables
├── .vercelignore         # Files to ignore during deployment
├── routes/               # API routes
│   ├── blogRoutes.js     # Blog CRUD operations
│   ├── projectRoutes.js  # Projects CRUD operations
│   ├── serviceRoutes.js  # Services CRUD operations
│   ├── teamRoutes.js     # Team members CRUD operations
│   └── contactRoutes.js  # Contact form handling
├── models/               # Mongoose database models
│   ├── Blog.js           # Blog post model
│   ├── Project.js        # Project model
│   ├── Service.js        # Service model
│   ├── Team.js           # Team member model
│   └── Contact.js        # Contact form model
├── middleware/           # Custom middleware
│   └── auth.js           # API key authentication
├── config/               # Configuration files
│   └── database.js       # MongoDB connection config
└── public/              # Static files
    └── images/          # Static images with CORS headers
```

## 🛠️ Installation & Local Development
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the root:
   ```bash
   cp .env.example .env
   ```
   Update values in `.env`:
   ```env
   MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
   API_SECRET=your-secure-api-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 🔐 API Authentication
The API uses API Key Authentication for security:

### Frontend Requests (Auto-allowed)
- Requests from `https://software-company-mu.vercel.app` are automatically allowed
- No API key required for frontend integration

### External Requests (API Key Required)
- All requests from Postman, curl, or other sources require API key
- Add header: `X-API-Key: your-api-secret-here`

### Contact Form Exception
- `POST` requests to `/api/contact` from frontend don't require API key
- Other HTTP methods (`GET`, `PUT`, `DELETE`) require authentication

## 📡 API Endpoints
### General Endpoints
- `GET /` - API information and available endpoints
- `GET /api/health` - Server and database health check
- `GET /api/test` - Simple test endpoint (no auth required)
- `GET /api/debug-key` - Debug API key authentication (dev only)

### Blog Management
- `GET /api/blogs` - Get all blog posts
- `GET /api/blogs/:id` - Get specific blog post
- `POST /api/blogs` - Create new blog post
- `PUT /api/blogs/:id` - Update blog post
- `DELETE /api/blogs/:id` - Delete blog post

### Project Management
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Service Management
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get specific service
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Team Management
- `GET /api/teams` - Get all team members
- `GET /api/teams/:id` - Get specific team member
- `POST /api/teams` - Add new team member
- `PUT /api/teams/:id` - Update team member
- `DELETE /api/teams/:id` - Remove team member

### Contact Management
- `GET /api/contact` - Get all contact submissions (requires API key)
- `POST /api/contact` - Submit contact form (no API key for frontend)
- `PUT /api/contact/:id` - Update contact status (requires API key)
- `DELETE /api/contact/:id` - Delete contact submission (requires API key)

## 🚀 Deployment on Vercel
### Method 1: GitHub Integration (Recommended)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to Vercel Dashboard
   - Import your GitHub repository
   - Configure project settings

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add required variables (see below)

4. **Deploy**
   - Automatic deployment on every push
   - Manual redeploy available in dashboard

### Method 2: Vercel CLI
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

### Required Environment Variables on Vercel
Critical: Add these in Vercel Dashboard → Settings → Environment Variables
```env
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
API_SECRET=your-secure-api-key-here
NODE_ENV=production
```
**Important**: After adding environment variables, you MUST redeploy the application!

## 🔧 Advanced Configuration
### Security Features
- **Helmet**: Security headers with CSP
- **CORS**: Restricted to frontend origin
- **Rate Limiting**: 200 requests/15min in production
- **API Key Auth**: Dual-layer authentication system
- **Input Validation**: JSON payload size limits (10MB)

### Performance Optimizations
- **Compression**: Gzip compression for all responses
- **Connection Pooling**: MongoDB connection caching
- **Static File Caching**: 1-year cache for images
- **Graceful Shutdown**: Proper cleanup on termination

### MongoDB Configuration
```javascript
{
  dbName: 'portfolio',
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 3,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true
}
```

## 📊 Monitoring & Diagnostics
### Health Check Endpoint
```bash
curl https://portfolio-vercel-bi43.vercel.app/api/health
```
Expected Response:
```json
{
  "status": "OK",
  "message": "Server is running on Vercel",
  "database": {
    "status": "connected",
    "test": "responsive",
    "host": "cluster0-shard-00-00.mongodb.net",
    "name": "portfolio"
  },
  "environment": "production",
  "timestamp": "2025-08-23T09:46:35.218Z"
}
```

### Debug API Key (Development)
```bash
curl -H "X-API-Key: your-api-key" https://portfolio-vercel-bi43.vercel.app/api/debug-key
```

### Common API Testing with Postman
**Headers Required:**
- `Content-Type: application/json`
- `X-API-Key: your-api-secret-here`

**Example GET Request:**
```
GET https://portfolio-vercel-bi43.vercel.app/api/blogs
```

**Example POST Request:**
```
POST https://portfolio-vercel-bi43.vercel.app/api/blogs
```
Body:
```json
{
  "title": "New Blog Post",
  "content": "Blog content here",
  "author": "Author Name"
}
```

## 🐛 Troubleshooting
### Common Issues
1. **"Invalid API key" Error**
   - Ensure `API_SECRET` is set in Vercel environment variables
   - Redeploy after adding environment variables
   - Check API key spelling and spaces

2. **Database Connection Issues**
   - Verify `MONGODB_ATLAS_URI` is correct
   - Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)
   - Ensure database user has proper permissions

3. **CORS Errors**
   - Verify frontend URL in CORS configuration
   - Check if `Origin` header is sent correctly

4. **Rate Limiting**
   - Current limit: 200 requests per 15 minutes
   - Use API key for higher limits
   - Check rate limit headers in response

### Debug Steps
1. **Check Health Endpoint**
   ```bash
   curl https://portfolio-vercel-bi43.vercel.app/api/health
   ```

2. **Test API Key**
   ```bash
   curl -H "X-API-Key: your-key" https://portfolio-vercel-bi43.vercel.app/api/debug-key
   ```

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Functions → View Logs
   - Look for error messages and debugging info

4. **Verify Environment Variables**
   - Settings → Environment Variables
   - Ensure all required variables are set
   - Redeploy after changes

## 🔄 Recent Updates (August 2025)
- ✅ Enhanced API Key Authentication: Dual-layer security system
- ✅ Debug Endpoints: Advanced troubleshooting tools
- ✅ Contact Form Integration: Special handling for frontend submissions
- ✅ Improved Error Handling: Detailed error responses
- ✅ Performance Optimizations: Connection pooling and caching
- ✅ Security Enhancements: Rate limiting and input validation
- ✅ Vercel Optimization: Perfect serverless deployment

## 📞 Support
For issues and questions:
- Check Vercel Functions logs for errors
- Use `/api/debug-key` endpoint for authentication issues
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from all IPs

## 📄 License
ISC License - See LICENSE file for details.

Portfolio Backend API - Built with ❤️ for modern web development
