# School Examination Management System

A comprehensive Node.js backend system for managing school examinations, built with Express.js, TypeScript, MySQL, and Sequelize ORM.

## Features

### 🔐 Authentication & Authorization
- JWT token-based authentication
- Role-based access control (Admin, Teacher, Student)
- Password hashing with bcryptjs
- Token refresh mechanism
- Session management

### 📚 Core Modules
- **User Management**: Admin, Teacher, and Student profiles
- **Class Management**: Class creation and student assignment
- **Subject Management**: Subject creation and teacher assignment
- **Exam Management**: Create, schedule, and manage exams
- **Submission System**: Student exam submissions with auto-grading
- **Results & Analytics**: Comprehensive reporting and analytics

### 🚀 Advanced Features
- **Auto-grading**: Automatic grading for multiple_choice questions
- **CSV Import**: Bulk question import via CSV files
- **File Upload**: Secure file handling with Multer
- **Violation Tracking**: Exam security monitoring
- **Performance Analytics**: Detailed performance reports
- **Pagination**: Efficient data handling for large datasets

### 🛡️ Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration
- Helmet security headers

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs
- **Documentation**: Comprehensive API docs

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd school-exam-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_exam_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

4. **Database Setup**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE school_exam_db;"

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login user with email and password
```json
{
  "email": "admin@school.com",
  "password": "password123"
}
```

#### POST /api/auth/register
Create new user (Admin only)
```json
{
  "email": "teacher@school.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "teacher"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication)

### Student Management

#### GET /api/students
Get all students with pagination and filters
```
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term
- classId: Filter by class
```

#### POST /api/students
Create new student (Admin only)
```json
{
  "userId": "uuid",
  "studentId": "STU001",
  "classId": "class-uuid",
  "dateOfBirth": "2005-06-15",
  "parentContact": "+1234567890"
}
```

### Exam Management

#### POST /api/exams
Create new exam
```json
{
  "title": "Mathematics Final Exam",
  "description": "Final examination for Grade 10 Mathematics",
  "examType": "regular",
  "subjectId": "subject-uuid",
  "classId": "class-uuid",
  "teacherId": "teacher-uuid",
  "duration": 120,
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T11:00:00Z"
}
```

#### POST /api/exams/:id/questions
Add questions to exam
```json
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correct_answer": 1,
      "points": 2
    },
    {
      "type": "theory",
      "question": "Explain the Pythagorean theorem",
      "points": 10
    }
  ]
}
```

#### POST /api/exams/:id/questions/import-csv
Import questions from CSV file
- Upload CSV file with questions
- Supported format: type, question, option1, option2, option3, option4, correct_answer, points

### Submission Management

#### POST /api/submissions
Submit exam answers
```json
{
  "examId": "exam-uuid",
  "studentId": "student-uuid",
  "answers": {
    "question-id-1": {
      "answer": 1,
      "timeSpent": 30
    },
    "question-id-2": {
      "answer": "The Pythagorean theorem states...",
      "timeSpent": 180
    }
  }
}
```

#### POST /api/submissions/:id/grade
Grade submission (Teachers only)
```json
{
  "score": 85,
  "feedback": "Good work on most questions. Review algebra concepts."
}
```

### Results & Analytics

#### GET /api/results/student/:studentId
Get results for specific student

#### GET /api/analytics/dashboard/:role
Get dashboard statistics based on user role

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `role` (ENUM: 'admin', 'teacher', 'student')
- `avatar` (String, Optional)

### Exams Table
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (Text)
- `examType` (ENUM: 'entrance', 'regular')
- `subjectId` (UUID, Foreign Key)
- `classId` (UUID, Foreign Key)
- `teacherId` (UUID, Foreign Key)
- `duration` (Integer, minutes)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `questions` (JSON Array)
- `totalPoints` (Integer)
- `status` (ENUM: 'draft', 'published', 'active', 'completed')

### Exam Submissions Table
- `id` (UUID, Primary Key)
- `examId` (UUID, Foreign Key)
- `studentId` (UUID, Foreign Key)
- `answers` (JSON Object)
- `score` (Integer)
- `submittedAt` (DateTime)
- `gradedAt` (DateTime)
- `status` (ENUM: 'submitted', 'graded')

## CSV Import Format

For importing questions via CSV, use this format:

```csv
type,question,option1,option2,option3,option4,correct_answer,points,explanation
multiple_choice,"What is 2 + 2?","2","4","6","8","B",2,"Basic arithmetic"
theory,"Explain photosynthesis","","","","","Photosynthesis is the process...",10,"Biology concept"
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Different permissions for different user types
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for Express apps

## Error Handling

The system includes comprehensive error handling:
- Custom error classes
- Global error handler middleware
- Validation error responses
- Database constraint error handling
- Proper HTTP status codes

## Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.