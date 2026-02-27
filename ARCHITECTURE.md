# Job Portal Platform - System Architecture

## 1. System Overview

**E1 Job Portal** is a modern, scalable job board platform connecting learners (students/job seekers) with employers (schools/universities). The platform supports three distinct user roles with role-based access control.

### 1.1 User Roles
- **Learners**: Students and job seekers who browse and apply for jobs
- **Employers**: Schools/Universities who post jobs and manage applicants
- **Admin**: Platform administrators with full system access

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **UI Library**: Shadcn/UI (Radix UI primitives)
- **Styling**: TailwindCSS
- **State Management**: React Hooks + Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Notifications**: Sonner (toast notifications)

### Backend
- **Framework**: FastAPI (Python)
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: Bcrypt
- **Database Driver**: Motor (async MongoDB driver)
- **Validation**: Pydantic v2
- **File Upload**: Python Multipart

### Database
- **Primary Database**: MongoDB
- **Collections**: users, jobs, applications, subscriptions, payments, notifications

### Third-Party Integrations
- **Payment Gateway**: Razorpay (test mode)
- **Email Service**: Gmail SMTP
- **Resume Parsing**: PyPDF2, python-docx

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    (React + TailwindCSS)                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Learner    │  │   Employer   │  │      Admin      │  │
│  │  Dashboard   │  │  Dashboard   │  │    Dashboard    │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Shared Components & Layouts                │   │
│  │   (Navigation, Auth Forms, Job Cards, etc.)        │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │ JWT Authentication
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                            │
│                   (FastAPI + Python)                        │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │              API Routes (/api/*)                   │   │
│  │                                                    │   │
│  │  /auth/*     - Authentication & Authorization      │   │
│  │  /learners/* - Learner profile & applications      │   │
│  │  /employers/*- Employer jobs & applicants          │   │
│  │  /jobs/*     - Job listings & search               │   │
│  │  /admin/*    - Admin management                    │   │
│  │  /payments/* - Razorpay integration                │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Middleware & Services                    │   │
│  │  • JWT Verification                                │   │
│  │  • Role-Based Access Control (RBAC)               │   │
│  │  • Resume Parser Service                          │   │
│  │  • Email Service (SMTP)                           │   │
│  │  • Payment Service (Razorpay)                     │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│                                                             │
│  Collections:                                               │
│  • users (learners, employers, admins)                      │
│  • jobs                                                     │
│  • applications                                             │
│  • subscriptions                                            │
│  • payments                                                 │
│  • notifications                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Razorpay   │  │ Gmail SMTP   │                        │
│  │   Payments   │  │    Email     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

See `DATABASE_SCHEMA.md` for detailed collection structures.

---

## 5. Authentication Flow

### Registration Flow
```
1. User submits registration form (email, password, role)
2. Backend validates data
3. Password is hashed using bcrypt
4. User document created in MongoDB
5. Verification email sent (optional)
6. JWT token generated and returned
7. Frontend stores token in localStorage
```

### Login Flow
```
1. User submits credentials (email, password)
2. Backend verifies email exists
3. Password verified using bcrypt
4. JWT token generated with user_id, email, role
5. Token returned to frontend
6. Frontend stores token and redirects based on role
```

### Protected Route Access
```
1. Frontend sends request with Authorization: Bearer <token>
2. Backend middleware extracts and verifies JWT
3. User role checked against route permissions
4. Request proceeds if authorized, else 403 Forbidden
```

---

## 6. Key Features Implementation

### 6.1 Resume Parsing
- **Libraries**: PyPDF2 (PDF), python-docx (DOCX)
- **Process**:
  1. User uploads resume file
  2. Backend extracts text from file
  3. Parser extracts: name, email, phone, skills, education, experience
  4. Parsed data auto-fills profile fields
  5. User reviews and confirms/edits data

### 6.2 Profile Completion Percentage
- **Formula**: (filled_fields / total_fields) × 100
- **Tracked Fields**:
  - Basic: name, email, phone, location (4)
  - Education: degree, institution, year (3)
  - Experience: company, role, duration (3)
  - Skills: at least 3 skills (1)
  - Resume: uploaded (1)
  - **Total**: 12 fields
- **Display**: Progress bar on profile page

### 6.3 Subscription System
- **Plans**: Free (limited), Basic ($99/mo), Premium ($199/mo)
- **Payment Flow**:
  1. Employer selects plan
  2. Razorpay payment modal opens
  3. Payment processed
  4. Webhook verifies payment
  5. Subscription activated in database
  6. Email confirmation sent

### 6.4 Email Notifications
- **Triggers**:
  - New job matches learner profile
  - Application status change
  - Subscription purchase confirmation
  - Interview invite
- **Service**: Gmail SMTP (provided credentials)

### 6.5 Job Search & Filtering
- **Search Fields**: title, description, skills
- **Filters**: location, salary range, employer, job type
- **MongoDB Queries**: Text search with indexes

---

## 7. API Architecture

See `API_ENDPOINTS.md` for complete API documentation.

---

## 8. Security Measures

### 8.1 Authentication & Authorization
- JWT tokens with 7-day expiration
- Password hashing with bcrypt (cost factor: 12)
- Role-based access control (RBAC)
- Protected routes require valid JWT

### 8.2 Data Protection
- CORS configuration for allowed origins
- Environment variables for sensitive data
- MongoDB ObjectId exclusion in responses
- Input validation using Pydantic

### 8.3 Payment Security
- Razorpay signature verification
- Webhook endpoint protection
- No card data stored locally

---

## 9. Scalability Considerations

### 9.1 Database Optimization
- Indexes on frequently queried fields:
  - users.email (unique)
  - jobs.employer_id
  - applications.learner_id
  - applications.job_id
- Pagination for large result sets

### 9.2 Performance
- Async MongoDB driver (Motor)
- Lazy loading for job listings
- Debounced search inputs
- Optimized image loading

### 9.3 Future Enhancements
- Redis caching for hot data
- Elasticsearch for advanced search
- CDN for static assets
- Load balancing for multiple instances

---

## 10. Deployment Architecture

### Current Setup
- **Environment**: Kubernetes cluster
- **Backend**: Supervisor-managed (port 8001)
- **Frontend**: Supervisor-managed (port 3000)
- **Database**: MongoDB (local)
- **Ingress**: 
  - `/api/*` → Backend (8001)
  - `/*` → Frontend (3000)

### Production Recommendations
- **Hosting**: AWS/DigitalOcean
- **Container**: Docker + Kubernetes
- **Database**: MongoDB Atlas (managed)
- **File Storage**: AWS S3 / MinIO
- **Monitoring**: Prometheus + Grafana
- **Logs**: ELK Stack

---

## 11. Folder Structure

See `FOLDER_STRUCTURE.md` for complete directory layout.
