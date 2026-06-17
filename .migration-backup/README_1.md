# Roman Academy - Student-Teacher Portal

A modern, production-ready dashboard for managing students, teachers, and academic progress at Roman Academy.

## 🎯 Overview

Roman Academy Portal is a full-stack Next.js application designed for educational institutions to manage:

- **Student Management**: Track student information, progress, and grades
- **Teacher Dashboard**: Manage classes, upload marks, and monitor student performance
- **Real-time Notifications**: Instant updates for important academic events
- **Secure Authentication**: Role-based access control with JWT tokens
- **Mobile Responsive**: Fully functional on all device sizes

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15.3.3, React 19, TypeScript
- **Styling**: Tailwind CSS with animations
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma 6.9.0
- **Authentication**: JWT with bcryptjs
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

### Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                  # API routes (auth, students, teachers)
│   ├── (auth)/               # Authentication pages
│   ├── student/              # Student portal pages
│   ├── teacher/              # Teacher dashboard pages
│   └── layout.tsx            # Root layout with providers
├── components/               # Reusable UI components
│   ├── footer.tsx           # Global footer with contact info
│   ├── theme-provider.tsx   # Dark/light mode provider
│   └── ui/                  # shadcn-style components
├── lib/                     # Utility functions
│   ├── auth.ts             # Authentication logic
│   └── db.ts               # Database utilities
├── prisma/                 # Database schema
│   ├── schema.prisma       # Data models
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (production) or SQLite (development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/GRammynotes/Roman-Academy.git
cd Roman-Academy
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL and JWT secret:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/roman_academy"
JWT_SECRET="your-super-secret-key-change-this"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Setup database**

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

5. **Start development server**

```bash
npm run dev
```

Visit http://localhost:3000 in your browser.

## 📊 Features

### Student Portal

- View grades and performance metrics
- Track attendance records
- Receive course notifications
- Upload assignments
- View syllabus and course materials
- Real-time progress tracking with charts

### Teacher Dashboard

- Manage student list and profiles
- Upload marks in bulk
- Track class attendance
- Monitor student performance
- Generate performance reports
- Send notifications to students

### Admin Features

- User management
- Course and batch management
- Analytics and reporting
- System settings

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CSRF Protection**: CSRF tokens on all state-changing operations
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Zod schema validation
- **HttpOnly Cookies**: Secure cookie handling
- **Role-Based Access**: Different permissions for students/teachers

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop full-featured experience
- Dark mode support
- Accessibility compliant (WCAG 2.1)

## 🗄️ Database

### PostgreSQL (Production)

**Recommended for 100+ students**

- Reliable and scalable
- Advanced query capabilities
- Better concurrent user handling
- Built-in data integrity
- Ideal for team collaboration

**Connection String:**

```
postgresql://user:password@host:5432/roman_academy
```

### SQLite (Development)

- File-based database
- No setup required
- Good for prototyping
- Suitable for small deployments

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Student Management

- `GET /api/student/profile` - Get student profile
- `GET /api/student/grades` - Get grades
- `POST /api/student/attendance` - Mark attendance

### Teacher Management

- `GET /api/teacher/students` - List all students
- `GET /api/teacher/students/[id]` - Student details
- `POST /api/teacher/upload-marks` - Upload marks
- `POST /api/teacher/attendance` - Mark attendance

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Demo Accounts

### Student Account

- **Username**: kunal.datkhile.11.2026
- **Password**: student@123
- **Role**: Student

### Teacher Account

- **Username**: teacher@romanacademy.com
- **Password**: teacher@123
- **Role**: Teacher

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Deploy directly from GitHub:**

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project" → Select your repository
4. Set environment variables
5. Deploy

### Railway

1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Other Platforms

- Azure App Service
- AWS EC2 or Elastic Beanstalk
- DigitalOcean
- Render
- Fly.io

## 📊 Database Schema

### Key Tables

- **users** - Student and teacher accounts
- **students** - Student information and metadata
- **teachers** - Teacher profiles and subjects
- **courses** - Course information
- **grades** - Student grades and marks
- **attendance** - Attendance records
- **notifications** - System notifications

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## 📈 Performance

- **Lighthouse Score**: 90+ (desktop)
- **Page Load Time**: < 3 seconds
- **Database Queries**: Optimized with indexes
- **Image Optimization**: WebP format with lazy loading
- **Code Splitting**: Automatic by Next.js

## 🐛 Known Issues

Currently tracking in [GitHub Issues](https://github.com/GRammynotes/Roman-Academy/issues)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Contact

### Academy Details

**Roman Academy - Main Branch**

- Address: A/2, Room 501/502, Sector-20, Turbhe, Navi Mumbai - 400703
- Near: Turbhe Railway Station

**Roman Academy - Branch 2**

- Address: A1, 64/B, Sector-21, Turbhe, Navi Mumbai
- Near: ICL School & Mayuresh Hospital

### Key Contacts

| Name           | Role                   | Phone          | Email                        |
| -------------- | ---------------------- | -------------- | ---------------------------- |
| Nava Dada      | Director               | +91 8097724133 | -                            |
| Abhi Dada      | Head of Academics      | +91 9096985169 | -                            |
| Kunal Datkhile | Admissions & Technical | +91 9172765002 | Datkhilekunalvijay@gmail.com |

### Working Hours

- **Monday - Saturday**: 9:00 AM - 8:00 PM
- **Sunday**: 10:00 AM - 7:00 PM

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

## 🎓 About Roman Academy

Roman Academy is a leading coaching institute in Navi Mumbai specializing in comprehensive student development with a focus on:

- Core academics
- Competitive exam preparation
- Personal growth and mentoring
- Technology-enabled learning

---

**Repository**: [GRammynotes/Roman-Academy](https://github.com/GRammynotes/Roman-Academy)  
**Status**: Production Ready  
**Last Updated**: June 2026
