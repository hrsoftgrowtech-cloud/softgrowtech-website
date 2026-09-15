# SoftGrowTech — Final Website Package

This package keeps the existing SoftGrowTech visual language and adds the final student portal, selection assessment, enrollment/payment flow, client enquiry flow and private admin console.

## Main pages
- `index.html` — homepage, programs, services and existing content
- `student-register.html` — native student registration
- `student-login.html` — student login
- `reset-password.html` — email reset link + new password
- `portal.html` — student dashboard
- `assessment.html` — website-native 10-question selection assessment
- `enrollment.html` — payment/enrollment verification
- `contact.html` — client enquiries + student support
- `admin-login.html` / `admin.html` — protected management console
- Existing verification/policy/domain pages remain included

## Supabase setup
1. Run `supabase-final-setup.sql` in the Supabase SQL Editor.
2. Create the first admin in Supabase Auth.
3. Set that Auth user's metadata to `{"role":"admin"}` (or use the SQL comment in the setup file).
4. Configure Auth email settings/SMTP and the password reset redirect URL for your production domain.
5. Configure payment QR image URLs/details in `sgt_settings` through the admin/database layer as required.
6. Add domain-specific assessment questions to `sgt_assessment_questions` (10 primary + optional reassessment set per domain).
7. Add/edit task rows in `sgt_tasks` with the exact Google Drive project/submission links and dates.

## Security
- Student data is protected by Supabase RLS.
- Payment receipts use a private Storage bucket.
- Admin access requires Supabase Auth + admin role; the URL being private is not the security boundary.
- Do not put service-role keys, SMTP passwords or payment secrets in frontend code.

## Existing verification
The existing verification flow and its Supabase publishable configuration are preserved in `script.js`.

## Deployment
Static files can be deployed to the existing hosting/Vercel setup. No build command is required.
