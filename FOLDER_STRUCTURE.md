# Folder Structure - Job Portal Platform

```
/app/
├── backend/
│   ├── .env                    # Environment variables
│   ├── requirements.txt        # Python dependencies
│   ├── server.py               # Main FastAPI application
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py             # User models
│   │   ├── job.py              # Job models
│   │   ├── application.py      # Application models
│   │   ├── subscription.py     # Subscription models
│   │   └── payment.py          # Payment models
│   │
│   ├── routes/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication routes
│   │   ├── learners.py         # Learner endpoints
│   │   ├── employers.py        # Employer endpoints
│   │   ├── jobs.py             # Job endpoints
│   │   ├── admin.py            # Admin endpoints
│   │   └── payments.py         # Payment endpoints
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py     # JWT, password hashing
│   │   ├── email_service.py    # Gmail SMTP service
│   │   ├── resume_parser.py    # Resume parsing logic
│   │   ├── payment_service.py  # Razorpay integration
│   │   └── profile_service.py  # Profile completion calc
│   │
│   ├── middleware/             # Custom middleware
│   │   ├── __init__.py
│   │   └── auth_middleware.py  # JWT verification
│   │
│   ├── utils/                  # Helper functions
│   │   ├── __init__.py
│   │   ├── db.py               # Database connection
│   │   ├── validators.py       # Custom validators
│   │   └── helpers.py          # Utility functions
│   │
│   └── uploads/                # Uploaded files (resumes)
│       └── resumes/
│
├── frontend/
│   ├── .env                    # Environment variables
│   ├── package.json            # Node dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── postcss.config.js       # PostCSS configuration
│   │
│   ├── public/                 # Static assets
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── index.js            # Entry point
│       ├── App.js              # Main component
│       ├── App.css             # Global styles
│       ├── index.css           # Tailwind imports
│       │
│       ├── components/         # Reusable components
│       │   ├── ui/             # Shadcn UI components
│       │   │   ├── button.jsx
│       │   │   ├── input.jsx
│       │   │   ├── card.jsx
│       │   │   ├── dialog.jsx
│       │   │   ├── select.jsx
│       │   │   ├── badge.jsx
│       │   │   ├── progress.jsx
│       │   │   └── ... (other UI components)
│       │   │
│       │   ├── Layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── Sidebar.jsx
│       │   │
│       │   ├── Auth/
│       │   │   ├── LoginForm.jsx
│       │   │   ├── RegisterForm.jsx
│       │   │   └── RoleSelector.jsx
│       │   │
│       │   ├── Jobs/
│       │   │   ├── JobCard.jsx
│       │   │   ├── JobList.jsx
│       │   │   ├── JobFilters.jsx
│       │   │   ├── JobDetails.jsx
│       │   │   └── ApplyJobModal.jsx
│       │   │
│       │   ├── Profile/
│       │   │   ├── ProfileCard.jsx
│       │   │   ├── ProfileCompletion.jsx
│       │   │   ├── ResumeUpload.jsx
│       │   │   ├── SkillsInput.jsx
│       │   │   ├── EducationForm.jsx
│       │   │   └── ExperienceForm.jsx
│       │   │
│       │   ├── Applications/
│       │   │   ├── ApplicationCard.jsx
│       │   │   ├── ApplicationList.jsx
│       │   │   └── StatusBadge.jsx
│       │   │
│       │   ├── Employer/
│       │   │   ├── JobPostForm.jsx
│       │   │   ├── ApplicantCard.jsx
│       │   │   ├── ApplicantList.jsx
│       │   │   └── SubscriptionCard.jsx
│       │   │
│       │   ├── Admin/
│       │   │   ├── UserTable.jsx
│       │   │   ├── JobTable.jsx
│       │   │   ├── AnalyticsCard.jsx
│       │   │   └── StatsOverview.jsx
│       │   │
│       │   └── Payment/
│       │       ├── RazorpayButton.jsx
│       │       └── SubscriptionPlans.jsx
│       │
│       ├── pages/              # Page components
│       │   ├── Landing.jsx     # Public landing page
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   │
│       │   ├── Learner/
│       │   │   ├── LearnerDashboard.jsx
│       │   │   ├── LearnerProfile.jsx
│       │   │   ├── JobBrowse.jsx
│       │   │   ├── JobDetails.jsx
│       │   │   └── MyApplications.jsx
│       │   │
│       │   ├── Employer/
│       │   │   ├── EmployerDashboard.jsx
│       │   │   ├── PostJob.jsx
│       │   │   ├── MyJobs.jsx
│       │   │   ├── Applicants.jsx
│       │   │   ├── Subscription.jsx
│       │   │   └── Analytics.jsx
│       │   │
│       │   └── Admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── UserManagement.jsx
│       │       ├── JobModeration.jsx
│       │       └── PlatformAnalytics.jsx
│       │
│       ├── context/            # React Context
│       │   ├── AuthContext.jsx # Auth state management
│       │   └── ThemeContext.jsx # Theme management
│       │
│       ├── hooks/              # Custom hooks
│       │   ├── useAuth.js
│       │   ├── useJobs.js
│       │   ├── useApplications.js
│       │   └── use-toast.js
│       │
│       ├── utils/              # Helper functions
│       │   ├── api.js          # Axios instance
│       │   ├── constants.js    # App constants
│       │   └── helpers.js      # Utility functions
│       │
│       └── lib/                # Third-party configs
│           └── utils.js        # cn() for Tailwind
│
├── tests/                      # Test files
│   ├── backend/
│   └── frontend/
│
├── scripts/                    # Utility scripts
│   └── seed_data.py            # Database seeding
│
├── ARCHITECTURE.md             # System architecture (this doc)
├── DATABASE_SCHEMA.md          # Database design
├── API_ENDPOINTS.md            # API documentation
├── FOLDER_STRUCTURE.md         # This file
├── IMPLEMENTATION_ROADMAP.md   # Development plan
├── design_guidelines.json      # UI/UX design specs
└── README.md                   # Project overview
```

---

## Key Directory Purposes

### Backend

**models/**: Pydantic models for request/response validation and MongoDB documents

**routes/**: FastAPI route handlers organized by domain (auth, learners, employers, jobs, admin, payments)

**services/**: Business logic layer - email sending, resume parsing, payment processing, profile calculations

**middleware/**: Custom middleware for JWT verification and role-based access control

**utils/**: Helper functions, database connection, validators

**uploads/**: Local storage for uploaded resume files (production: use S3/MinIO)

### Frontend

**components/ui/**: Shadcn UI primitive components (Button, Input, Card, etc.)

**components/**: Feature-specific components organized by domain
- Auth: Login/Register forms
- Jobs: Job cards, filters, details
- Profile: Resume upload, skills, education, experience
- Applications: Application tracking
- Employer: Job posting, applicant management
- Admin: User management, analytics
- Payment: Razorpay integration

**pages/**: Full page components for each route
- Public: Landing, Login, Register
- Learner: Dashboard, Profile, Job Browse, Applications
- Employer: Dashboard, Post Job, My Jobs, Applicants, Subscription
- Admin: Dashboard, User Management, Job Moderation, Analytics

**context/**: React Context for global state (auth, theme)

**hooks/**: Custom React hooks for API calls and state management

**utils/**: Axios configuration, constants, helper functions

---

## File Naming Conventions

### Backend (Python)
- **Files**: snake_case (e.g., `auth_service.py`)
- **Classes**: PascalCase (e.g., `class UserModel`)
- **Functions**: snake_case (e.g., `def get_user()`)

### Frontend (React)
- **Components**: PascalCase (e.g., `JobCard.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Utils**: camelCase (e.g., `api.js`)
- **Pages**: PascalCase (e.g., `LearnerDashboard.jsx`)

---

## Module Organization

Each feature is self-contained with its own:
- **Backend**: route + service + model
- **Frontend**: page + components + hooks

Example for "Job Application" feature:
```
Backend:
- models/application.py
- routes/jobs.py (apply endpoint)
- services/email_service.py (notification)

Frontend:
- pages/Learner/MyApplications.jsx
- components/Applications/ApplicationList.jsx
- components/Applications/ApplicationCard.jsx
- hooks/useApplications.js
```

This structure supports:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Testability**: Isolated components and services
- **Team Collaboration**: Parallel development by feature
