# Portfolio Backend API

A backend API for the portfolio built with **Express.js** and **MongoDB**, optimized for deployment on **Vercel**.

## 🚀 Features

- **Express.js**: Fast and flexible framework
- **MongoDB Atlas**: Cloud-based database
- **Mongoose**: ODM for MongoDB
- **Security**: Helmet, CORS, Rate Limiting, Api key
- **Performance**: Compression, Caching
- **Vercel Ready**: Optimized for deployment

## 📁 Project Structure

```
portfolio-backend/
├── index.js              # Entry point
├── package.json          # Dependencies & scripts
├── vercel.json           # Vercel settings
├── .env.example          # Example environment variables
├── .vercelignore         # Files to ignore during deployment
├── routes/               # API routes
│   ├── blogRoutes.js     # Blog routes
│   ├── projectRoutes.js  # Projects routes
│   ├── serviceRoutes.js  # Services routes
│   └── teamRoutes.js     # Team routes
├── models/               # Database models
└── public/              # Static files
    └── images/          # Images
```

## 🛠️ Installation & Local Development

### 1. Clone the repository
```bash
git clone <repository-url>
cd portfolio-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root:
```bash
cp .env.example .env
```

Update values in `.env`:
```env
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### General
- `GET /` - Basic API info
- `GET /api/health` - Server and database health check

### Blogs
- `GET /api/blogs` - Get all blog posts
- `GET /api/blogs/:id` - Get a specific post
- `POST /api/blogs` - Create a new blog post
- `PUT /api/blogs/:id` - Update a blog post
- `DELETE /api/blogs/:id` - Delete a blog post

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get a specific service
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Team
- `GET /api/teams` - Get all team members
- `GET /api/teams/:id` - Get a specific member
- `POST /api/teams` - Add a new member
- `PUT /api/teams/:id` - Update a member
- `DELETE /api/teams/:id` - Delete a member

## 🚀 Deployment on Vercel

### Method 1: Using Vercel CLI

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

### Method 2: GitHub Integration

1. Push code to GitHub  
2. Connect the repository to Vercel  
3. Add environment variables in Vercel settings  
4. Automatic deployment on every push

### Required Environment Variables on Vercel

```env
MONGODB_ATLAS_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## 🔧 Advanced Configuration

### Performance Optimization
- **Compression**: Compress responses
- **Caching**: Image caching
- **Rate Limiting**: Throttle excessive requests
- **Connection Pooling**: Efficient DB connections

### Security
- **Helmet**: Secure HTTP headers
- **CORS**: Cross-origin control
- **Input Validation**: Sanitize incoming data
- **Error Handling**: Centralized error responses

## 📊 Monitoring & Diagnostics

### Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### Expected response:
```json
{
  "status": "OK",
  "message": "Server is running on Vercel",
  "database": {
    "status": "connected",
    "test": "responsive"
  },
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```


- Open an issue on the repository
- Review Vercel’s documentation
- Check Vercel functions logs

## 📄 License

**ISC License**
