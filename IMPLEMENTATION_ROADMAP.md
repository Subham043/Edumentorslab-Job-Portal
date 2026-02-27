# Implementation Roadmap - Job Portal Platform

## Development Phases

---

## Phase 1: Foundation & Authentication (MVP Core)

### Backend Tasks
1. **Setup & Configuration**
   - Install dependencies: `razorpay`, `PyPDF2`, `python-docx`, `pymongo`
   - Configure environment variables (MongoDB, SMTP, Razorpay)
   - Set up project structure (models, routes, services)

2. **Database Models**
   - Create Pydantic models for: User, Job, Application, Subscription, Payment
   - Define database utility functions
   - Create indexes for performance

3. **Authentication System**
   - Implement password hashing with bcrypt
   - Create JWT token generation and verification
   - Build auth middleware for protected routes
   - Create role-based access control (RBAC)

4. **Auth Routes**
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/reset-password` - Password reset (email)

### Frontend Tasks
1. **Setup & Configuration**
   - Update Tailwind config with design guidelines
   - Import Google Fonts (Outfit, Manrope)
   - Configure axios with base URL and interceptors

2. **Auth Context & Utils**
   - Create AuthContext for global auth state
   - Implement token storage in localStorage
   - Create protected route wrapper component

3. **Landing Page**
   - Hero section with design guidelines
   - Feature highlights
   - Call-to-action buttons (Sign Up, Browse Jobs)

4. **Auth Pages**
   - Login page with role-based redirect
   - Register page with role selection (Learner/Employer)
   - Password reset flow

### Testing
- User registration for all roles
- Login and JWT token verification
- Protected route access control

---

## Phase 2: Learner Features

### Backend Tasks
1. **Profile Management**
   - `GET /api/learners/profile` - Get profile
   - `PUT /api/learners/profile` - Update profile
   - Profile completion percentage calculation

2. **Resume Upload & Parsing**
   - Create resume parser service (PyPDF2, python-docx)
   - `POST /api/learners/upload-resume` - Upload and parse
   - Extract: name, email, phone, skills, education, experience
   - Store resume file in `/backend/uploads/resumes/`

3. **Job Application**
   - `POST /api/jobs/{job_id}/apply` - Apply to job
   - `GET /api/learners/applications` - Get applications
   - Prevent duplicate applications
   - Send email notification on application

### Frontend Tasks
1. **Learner Dashboard**
   - Profile completion progress bar
   - Quick stats (applications, views)
   - Recommended jobs section

2. **Profile Page**
   - Profile form with all fields
   - Resume upload component with drag-and-drop
   - Auto-fill from parsed resume
   - Skills input with tags
   - Education and experience forms (dynamic add/remove)
   - Profile completion indicator

3. **My Applications Page**
   - Application list with filters (status)
   - Application cards with job details
   - Status badges (applied, viewed, shortlisted, rejected, selected)

### Testing
- Resume upload and parsing accuracy
- Profile completion percentage calculation
- Job application flow end-to-end

---

## Phase 3: Job Browsing & Search

### Backend Tasks
1. **Job Endpoints**
   - `GET /api/jobs` - List jobs with filters
   - `GET /api/jobs/{job_id}` - Get job details
   - Implement search (text search on title, description, skills)
   - Implement filters (location, job_type, salary, skills)
   - Pagination support

2. **Job Views Tracking**
   - Increment `views_count` on job detail view

### Frontend Tasks
1. **Job Browse Page**
   - Job list with infinite scroll/pagination
   - Search bar with debounce
   - Filter sidebar (location, type, salary, skills)
   - Job cards with hover effects

2. **Job Details Page**
   - Full job description
   - Employer information
   - Apply button (opens modal)
   - Related jobs section

3. **Apply Modal**
   - Cover letter text area
   - Resume preview
   - Submit application

### Testing
- Job search functionality
- Filters working correctly
- Application submission from job details

---

## Phase 4: Employer Features

### Backend Tasks
1. **Job Management**
   - `POST /api/employers/jobs` - Create job posting
   - `PUT /api/employers/jobs/{job_id}` - Update job
   - `DELETE /api/employers/jobs/{job_id}` - Delete job
   - `GET /api/employers/jobs` - Get employer's jobs

2. **Applicant Management**
   - `GET /api/employers/jobs/{job_id}/applicants` - Get applicants (requires subscription)
   - `PUT /api/employers/applications/{application_id}/status` - Update status
   - Send email on status change

3. **Analytics**
   - `GET /api/employers/analytics` - Get employer metrics
   - Calculate: total jobs, applicants, views, conversion rate

### Frontend Tasks
1. **Employer Dashboard**
   - Stats cards (active jobs, total applicants, views)
   - Recent applications
   - Quick actions (post job, view subscription)

2. **Post Job Page**
   - Job form with validation
   - Rich text editor for description
   - Skills multi-select
   - Salary range inputs

3. **My Jobs Page**
   - Job list with stats (applicants, views)
   - Edit/delete actions
   - Quick view applicants button

4. **Applicants Page**
   - Applicant cards with profile summary
   - Resume download link
   - Status update dropdown
   - Filter by status
   - Subscription gate (show upgrade prompt if not subscribed)

5. **Analytics Page**
   - Charts for job performance
   - Applicant funnel visualization
   - Conversion metrics

### Testing
- Job posting and editing
- Applicant viewing (with/without subscription)
- Status updates and email notifications
- Analytics calculations

---

## Phase 5: Subscription & Payments

### Backend Tasks
1. **Razorpay Integration**
   - Install `razorpay` library
   - Configure Razorpay client with test keys
   - `POST /api/payments/create-order` - Create Razorpay order
   - `POST /api/payments/verify` - Verify payment signature
   - `POST /api/payments/webhook` - Handle Razorpay webhooks

2. **Subscription Management**
   - Create subscription on successful payment
   - Update user's subscription status
   - Calculate subscription end date (30 days for monthly)
   - Send confirmation email

3. **Subscription Middleware**
   - Check subscription status for applicant viewing
   - Return 403 if subscription expired/inactive

### Frontend Tasks
1. **Subscription Plans Page**
   - Plan cards (Free, Basic ₹99, Premium ₹199)
   - Feature comparison table
   - "Choose Plan" buttons

2. **Razorpay Integration**
   - Install `react-razorpay` (or use Razorpay script)
   - Implement payment button
   - Handle payment success/failure
   - Redirect to dashboard on success

3. **Subscription Status Display**
   - Show current plan in employer dashboard
   - Display expiry date
   - "Upgrade" or "Renew" buttons

### Testing
- Razorpay order creation
- Payment flow with test cards
- Signature verification
- Subscription activation
- Access control based on subscription

---

## Phase 6: Admin Panel

### Backend Tasks
1. **User Management**
   - `GET /api/admin/users` - List all users
   - `PUT /api/admin/users/{user_id}/status` - Block/unblock user
   - `DELETE /api/admin/users/{user_id}` - Delete user

2. **Job Moderation**
   - `GET /api/admin/jobs/pending` - Jobs pending approval
   - `PUT /api/admin/jobs/{job_id}/approve` - Approve/reject job

3. **Analytics**
   - `GET /api/admin/analytics` - Platform-wide metrics
   - Calculate: total users, jobs, applications, revenue

### Frontend Tasks
1. **Admin Dashboard**
   - Stats overview (users, jobs, applications, revenue)
   - Charts for growth metrics
   - Recent activity feed

2. **User Management Page**
   - User table with filters (role, status)
   - Block/unblock actions
   - Search functionality

3. **Job Moderation Page**
   - Pending jobs list
   - Approve/reject buttons
   - Rejection reason input

4. **Platform Analytics Page**
   - Revenue charts
   - User growth graphs
   - Job posting trends
   - Subscription metrics

### Testing
- User blocking/unblocking
- Job approval/rejection
- Analytics accuracy

---

## Phase 7: Email Notifications

### Backend Tasks
1. **Email Service**
   - Create email service using Gmail SMTP
   - Email templates for:
     - Welcome email (registration)
     - Application confirmation
     - Status update notification
     - Job match alert
     - Subscription confirmation
   - Send emails asynchronously (background tasks)

2. **Notification Triggers**
   - On registration: welcome email
   - On application: confirmation to learner
   - On status change: update to learner
   - On new job (matching skills): alert to learner
   - On subscription: confirmation to employer

3. **Notification Logging**
   - Store notification records in `notifications` collection
   - Track sent/failed status

### Frontend Tasks
1. **Email Preferences (Optional)**
   - Settings page for notification preferences
   - Toggle email notifications on/off

### Testing
- Email delivery for all triggers
- Email template rendering
- Background task execution

---

## Phase 8: Polish & Optimization

### Backend Tasks
1. **Performance Optimization**
   - Add database indexes
   - Implement pagination for all list endpoints
   - Add response caching where appropriate

2. **Security Enhancements**
   - Rate limiting on auth endpoints
   - Input sanitization
   - CORS configuration

3. **Error Handling**
   - Comprehensive error messages
   - Logging for debugging

### Frontend Tasks
1. **UI/UX Polish**
   - Loading states for all async operations
   - Error states with user-friendly messages
   - Empty states for lists
   - Skeleton loaders

2. **Responsive Design**
   - Mobile optimization for all pages
   - Touch-friendly interactions

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

4. **Performance**
   - Image optimization
   - Code splitting
   - Lazy loading

### Testing
- Full end-to-end testing with testing agent
- Performance testing
- Mobile responsiveness
- Cross-browser compatibility

---

## Phase 9: Testing & Deployment

### Testing
1. **Automated Testing**
   - Use testing agent for comprehensive testing
   - Backend API testing (all endpoints)
   - Frontend flow testing (user journeys)
   - Integration testing (payment, email)

2. **Manual Testing**
   - User acceptance testing
   - Edge case testing
   - Security testing

### Deployment
1. **Pre-deployment**
   - Environment variable verification
   - Database backup
   - SSL certificate setup

2. **Deployment**
   - Already running in Kubernetes
   - Supervisor managing frontend and backend
   - MongoDB running locally

3. **Post-deployment**
   - Smoke testing
   - Monitoring setup
   - Documentation update

---

## Current MVP Scope (First Implementation)

**Priority Features:**
1. ✅ Authentication (all roles)
2. ✅ Learner profile with resume upload
3. ✅ Job posting by employers
4. ✅ Job browsing and search
5. ✅ Job application flow
6. ✅ Basic employer dashboard with applicant viewing
7. ✅ Subscription system with Razorpay
8. ✅ Email notifications
9. ✅ Admin user management
10. ✅ Basic analytics

**Deferred for Future:**
- Advanced search (Elasticsearch)
- Real-time notifications (WebSockets)
- Chat between employer and learner
- Video interviews
- Job recommendations (ML-based)
- Resume builder
- Salary insights
- Company reviews

---

## Development Timeline Estimate

| Phase | Focus Area | Estimated Effort |
|-------|-----------|------------------|
| 1 | Foundation & Auth | 2-3 days |
| 2 | Learner Features | 2-3 days |
| 3 | Job Browsing | 1-2 days |
| 4 | Employer Features | 2-3 days |
| 5 | Payments | 1-2 days |
| 6 | Admin Panel | 1-2 days |
| 7 | Email Notifications | 1 day |
| 8 | Polish & Optimization | 1-2 days |
| 9 | Testing & Deployment | 1-2 days |
| **Total** | **MVP Complete** | **12-20 days** |

*Note: Timeline is for reference only. Actual implementation will focus on delivering working code without time constraints.*

---

## Success Metrics

**Technical:**
- All API endpoints functional
- <2s page load time
- 99%+ uptime
- Zero critical security vulnerabilities

**Functional:**
- Users can register and login
- Learners can create profiles and apply to jobs
- Employers can post jobs and view applicants
- Payments processed successfully
- Emails delivered reliably
- Admin can manage platform

**User Experience:**
- Intuitive navigation
- Mobile-responsive design
- Fast and smooth interactions
- Clear error messages
