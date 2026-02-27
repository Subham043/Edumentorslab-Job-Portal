# Database Schema - Job Portal Platform

## MongoDB Collections

---

## 1. users

Stores all user accounts (learners, employers, admins)

```javascript
{
  id: String (UUID),
  email: String (unique, indexed),
  password_hash: String,
  role: String (enum: 'learner', 'employer', 'admin'),
  status: String (enum: 'active', 'blocked', 'pending_verification'),
  created_at: DateTime,
  updated_at: DateTime,
  
  // Learner-specific fields
  learner_profile: {
    full_name: String,
    phone: String,
    location: String,
    bio: String,
    resume_url: String,
    skills: [String],
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
        description: String
      }
    ],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String
      }
    ],
    profile_completion: Number (0-100),
    visibility: String (enum: 'public', 'private')
  },
  
  // Employer-specific fields
  employer_profile: {
    organization_name: String,
    organization_type: String,
    contact_person: String,
    phone: String,
    location: String,
    website: String,
    description: String,
    logo_url: String,
    verified: Boolean,
    subscription_status: String (enum: 'none', 'active', 'expired'),
    subscription_plan: String (enum: 'free', 'basic', 'premium'),
    subscription_end_date: DateTime
  },
  
  // Admin-specific fields (minimal)
  admin_profile: {
    full_name: String
  }
}
```

**Indexes:**
- `email` (unique)
- `role`
- `employer_profile.subscription_status`

---

## 2. jobs

Stores job postings created by employers

```javascript
{
  id: String (UUID),
  employer_id: String (ref: users.id),
  employer_name: String,
  
  title: String,
  description: String,
  location: String,
  job_type: String (enum: 'full-time', 'part-time', 'internship', 'contract'),
  salary_min: Number,
  salary_max: Number,
  currency: String (default: 'INR'),
  
  required_skills: [String],
  required_education: String,
  experience_required: String,
  
  status: String (enum: 'draft', 'active', 'closed', 'pending_approval'),
  
  applicants_count: Number (default: 0),
  views_count: Number (default: 0),
  
  created_at: DateTime,
  updated_at: DateTime,
  expires_at: DateTime
}
```

**Indexes:**
- `employer_id`
- `status`
- `created_at` (descending)
- Text index on `title, description, required_skills`

---

## 3. applications

Stores job applications submitted by learners

```javascript
{
  id: String (UUID),
  job_id: String (ref: jobs.id),
  learner_id: String (ref: users.id),
  employer_id: String (ref: users.id),
  
  learner_name: String,
  learner_email: String,
  learner_phone: String,
  resume_url: String,
  cover_letter: String,
  
  status: String (enum: 'applied', 'viewed', 'shortlisted', 'rejected', 'selected'),
  
  applied_at: DateTime,
  updated_at: DateTime,
  
  notes: String (employer's private notes)
}
```

**Indexes:**
- `job_id`
- `learner_id`
- `employer_id`
- `status`
- `applied_at` (descending)

**Compound Indexes:**
- `{learner_id: 1, job_id: 1}` (unique - prevent duplicate applications)

---

## 4. subscriptions

Stores employer subscription records

```javascript
{
  id: String (UUID),
  employer_id: String (ref: users.id),
  
  plan: String (enum: 'free', 'basic', 'premium'),
  status: String (enum: 'active', 'expired', 'cancelled'),
  
  amount: Number,
  currency: String (default: 'INR'),
  
  start_date: DateTime,
  end_date: DateTime,
  
  auto_renew: Boolean (default: false),
  
  created_at: DateTime,
  updated_at: DateTime
}
```

**Indexes:**
- `employer_id`
- `status`
- `end_date`

---

## 5. payments

Stores payment transactions

```javascript
{
  id: String (UUID),
  employer_id: String (ref: users.id),
  subscription_id: String (ref: subscriptions.id),
  
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  
  amount: Number,
  currency: String (default: 'INR'),
  status: String (enum: 'created', 'pending', 'success', 'failed'),
  
  payment_method: String,
  
  created_at: DateTime,
  updated_at: DateTime
}
```

**Indexes:**
- `employer_id`
- `razorpay_order_id` (unique)
- `razorpay_payment_id`
- `status`

---

## 6. notifications

Stores email notification logs

```javascript
{
  id: String (UUID),
  user_id: String (ref: users.id),
  
  type: String (enum: 'job_match', 'status_update', 'subscription', 'interview'),
  
  subject: String,
  body: String,
  
  email_to: String,
  
  status: String (enum: 'sent', 'failed', 'pending'),
  
  sent_at: DateTime,
  created_at: DateTime
}
```

**Indexes:**
- `user_id`
- `status`
- `created_at` (descending)

---

## Data Relationships

```
users (employer)
  ├── jobs (1:many)
  │     └── applications (1:many)
  │           └── users (learner)
  ├── subscriptions (1:many)
  │     └── payments (1:many)
  └── notifications (1:many)

users (learner)
  ├── applications (1:many)
  │     └── jobs (many:1)
  └── notifications (1:many)
```

---

## Collection Size Estimates (100k users)

- **users**: ~100,000 documents (~100 MB)
- **jobs**: ~50,000 documents (~50 MB)
- **applications**: ~500,000 documents (~300 MB)
- **subscriptions**: ~10,000 documents (~5 MB)
- **payments**: ~15,000 documents (~10 MB)
- **notifications**: ~1,000,000 documents (~500 MB)

**Total Estimated**: ~1 GB at 100k users scale

---

## MongoDB Best Practices Applied

1. **Denormalization**: Employer name stored in jobs collection for faster queries
2. **Embedded Documents**: Education and experience embedded in user profile
3. **Indexes**: Strategic indexes on frequently queried fields
4. **Exclusion**: `_id` field excluded from API responses (using projection)
5. **UUID**: String UUIDs used instead of ObjectId for cleaner API responses
6. **Timestamps**: ISO format strings for MongoDB compatibility
