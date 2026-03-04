# E1 Job Portal - MVP Documentation

## Overview

E1 Job Portal is a modern, full-featured job board platform connecting learners (students/job seekers) with employers (schools/universities). Built with React, FastAPI, and MongoDB.

## Features Implemented

### Authentication
- ✅ Multi-role registration (Learner, Employer, Admin)
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Email welcome notifications

### Learner Features
- ✅ Profile management with completion tracking
- ✅ Resume upload and parsing (PDF/DOCX)
- ✅ Job browsing with search and filters
- ✅ Job application system
- ✅ Application tracking
- ✅ Email notifications for status updates

### Employer Features
- ✅ Job posting and management
- ✅ Applicant viewing (subscription-gated)
- ✅ Application status management
- ✅ Analytics dashboard
- ✅ Subscription system with Razorpay

### Admin Features
- ✅ Platform analytics
- ✅ User management
- ✅ Job moderation (basic structure)

### Payment Integration
- ✅ Razorpay integration for subscriptions
- ✅ Payment verification
- ✅ Subscription activation

### Email Notifications
- ✅ Gmail SMTP integration
- ✅ Welcome emails
- ✅ Application confirmations
- ✅ Status update emails
- ✅ Subscription confirmations

## API Endpoints

All endpoints are prefixed with `/api`. See `/app/API_ENDPOINTS.md` for complete documentation.

## Environment Variables Configured

Backend and frontend are configured with MongoDB, JWT, Razorpay, and Gmail SMTP.

## Test Credentials

- **Razorpay Test**: Key ID and Secret already configured
- **SMTP**: Gmail credentials configured
- **Test Card**: 4111 1111 1111 1111 (any future date, any CVV)

## Architecture

See `/app/ARCHITECTURE.md`, `/app/DATABASE_SCHEMA.md`, and `/app/IMPLEMENTATION_ROADMAP.md` for detailed documentation.
