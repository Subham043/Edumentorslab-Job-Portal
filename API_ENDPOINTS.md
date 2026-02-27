# API Endpoints Documentation

Base URL: `/api`

All endpoints require `Content-Type: application/json` header.
Protected endpoints require `Authorization: Bearer <token>` header.

---

## Authentication

### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "learner|employer|admin",
  "full_name": "John Doe",
  "organization_name": "ABC University" // for employers only
}
```

**Response (200):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "learner"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login
Login with credentials

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "learner"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/reset-password
Request password reset (sends email)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

## Learner Endpoints

### GET /api/learners/profile
🔒 Protected (learner role)

Get current learner's profile

**Response (200):**
```json
{
  "id": "uuid",
  "email": "learner@example.com",
  "learner_profile": {
    "full_name": "John Doe",
    "phone": "+91-9876543210",
    "location": "Mumbai, India",
    "bio": "Passionate developer...",
    "resume_url": "https://...",
    "skills": ["React", "Python", "MongoDB"],
    "education": [...],
    "experience": [...],
    "profile_completion": 85
  }
}
```

### PUT /api/learners/profile
🔒 Protected (learner role)

Update learner profile

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+91-9876543210",
  "location": "Mumbai",
  "bio": "...",
  "skills": ["React", "Python"],
  "education": [...],
  "experience": [...]
}
```

### POST /api/learners/upload-resume
🔒 Protected (learner role)

Upload and parse resume

**Request Body:** `multipart/form-data`
- `file`: PDF or DOCX file

**Response (200):**
```json
{
  "message": "Resume uploaded successfully",
  "resume_url": "https://...",
  "parsed_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "skills": ["React", "Python"],
    "education": [...],
    "experience": [...]
  }
}
```

### GET /api/learners/applications
🔒 Protected (learner role)

Get learner's job applications

**Query Params:**
- `status`: filter by status (optional)
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

**Response (200):**
```json
{
  "applications": [
    {
      "id": "uuid",
      "job": {
        "id": "uuid",
        "title": "Frontend Developer",
        "employer_name": "ABC University"
      },
      "status": "applied",
      "applied_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "total_pages": 1
}
```

---

## Jobs Endpoints

### GET /api/jobs
Get job listings (public)

**Query Params:**
- `search`: search term (optional)
- `location`: filter by location (optional)
- `job_type`: filter by type (optional)
- `skills`: comma-separated skills (optional)
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

**Response (200):**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Frontend Developer",
      "employer_name": "ABC University",
      "location": "Mumbai",
      "job_type": "full-time",
      "salary_min": 500000,
      "salary_max": 800000,
      "required_skills": ["React", "JavaScript"],
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "total_pages": 8
}
```

### GET /api/jobs/{job_id}
Get single job details

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Frontend Developer",
  "description": "We are looking for...",
  "employer_name": "ABC University",
  "location": "Mumbai",
  "job_type": "full-time",
  "salary_min": 500000,
  "salary_max": 800000,
  "required_skills": ["React", "JavaScript"],
  "required_education": "Bachelor's Degree",
  "experience_required": "2-3 years",
  "applicants_count": 45,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### POST /api/jobs/{job_id}/apply
🔒 Protected (learner role)

Apply to a job

**Request Body:**
```json
{
  "cover_letter": "I am excited to apply..."
}
```

**Response (200):**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "id": "uuid",
    "job_id": "uuid",
    "status": "applied",
    "applied_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## Employer Endpoints

### GET /api/employers/profile
🔒 Protected (employer role)

Get employer profile

**Response (200):**
```json
{
  "id": "uuid",
  "email": "employer@example.com",
  "employer_profile": {
    "organization_name": "ABC University",
    "organization_type": "University",
    "contact_person": "Jane Smith",
    "phone": "+91-9876543210",
    "location": "Delhi, India",
    "website": "https://abc.edu",
    "subscription_status": "active",
    "subscription_plan": "premium",
    "subscription_end_date": "2025-12-31T23:59:59Z"
  }
}
```

### POST /api/employers/jobs
🔒 Protected (employer role)

Create a new job posting

**Request Body:**
```json
{
  "title": "Frontend Developer",
  "description": "We are looking for...",
  "location": "Mumbai",
  "job_type": "full-time",
  "salary_min": 500000,
  "salary_max": 800000,
  "required_skills": ["React", "JavaScript"],
  "required_education": "Bachelor's Degree",
  "experience_required": "2-3 years"
}
```

**Response (201):**
```json
{
  "message": "Job posted successfully",
  "job": {
    "id": "uuid",
    "title": "Frontend Developer",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### GET /api/employers/jobs
🔒 Protected (employer role)

Get employer's job postings

**Response (200):**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Frontend Developer",
      "status": "active",
      "applicants_count": 45,
      "views_count": 320,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 12
}
```

### GET /api/employers/jobs/{job_id}/applicants
🔒 Protected (employer role with active subscription)

Get applicants for a job

**Response (200):**
```json
{
  "applicants": [
    {
      "id": "uuid",
      "learner_name": "John Doe",
      "learner_email": "john@example.com",
      "learner_phone": "+91-9876543210",
      "resume_url": "https://...",
      "cover_letter": "...",
      "status": "applied",
      "applied_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 45
}
```

### PUT /api/employers/applications/{application_id}/status
🔒 Protected (employer role)

Update application status

**Request Body:**
```json
{
  "status": "shortlisted|rejected|selected",
  "notes": "Good candidate..."
}
```

### GET /api/employers/analytics
🔒 Protected (employer role)

Get employer analytics

**Response (200):**
```json
{
  "total_jobs": 12,
  "total_applicants": 450,
  "total_views": 5000,
  "conversion_rate": 9.0,
  "jobs_by_status": {
    "active": 8,
    "closed": 4
  }
}
```

---

## Subscription & Payment Endpoints

### POST /api/payments/create-order
🔒 Protected (employer role)

Create Razorpay order for subscription

**Request Body:**
```json
{
  "plan": "basic|premium",
  "amount": 9900,
  "currency": "INR"
}
```

**Response (200):**
```json
{
  "order_id": "order_razorpay_id",
  "amount": 9900,
  "currency": "INR",
  "key_id": "rzp_test_xxx"
}
```

### POST /api/payments/verify
🔒 Protected (employer role)

Verify payment and activate subscription

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "plan": "basic|premium"
}
```

**Response (200):**
```json
{
  "message": "Payment verified and subscription activated",
  "subscription": {
    "id": "uuid",
    "plan": "premium",
    "status": "active",
    "end_date": "2026-01-15T10:30:00Z"
  }
}
```

---

## Admin Endpoints

### GET /api/admin/users
🔒 Protected (admin role)

Get all users

**Query Params:**
- `role`: filter by role (optional)
- `status`: filter by status (optional)
- `page`: page number (default: 1)
- `limit`: items per page (default: 50)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "learner",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1500,
  "page": 1,
  "total_pages": 30
}
```

### PUT /api/admin/users/{user_id}/status
🔒 Protected (admin role)

Update user status (block/unblock)

**Request Body:**
```json
{
  "status": "active|blocked"
}
```

### GET /api/admin/analytics
🔒 Protected (admin role)

Get platform analytics

**Response (200):**
```json
{
  "total_users": 10000,
  "total_learners": 8500,
  "total_employers": 1499,
  "total_admins": 1,
  "total_jobs": 5000,
  "total_applications": 45000,
  "total_revenue": 1500000,
  "active_subscriptions": 800
}
```

### GET /api/admin/jobs/pending
🔒 Protected (admin role)

Get jobs pending approval

**Response (200):**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Frontend Developer",
      "employer_name": "ABC University",
      "status": "pending_approval",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 25
}
```

### PUT /api/admin/jobs/{job_id}/approve
🔒 Protected (admin role)

Approve or reject job posting

**Request Body:**
```json
{
  "action": "approve|reject",
  "reason": "Reason for rejection (if rejected)"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error
