# SoftGrowTech — Final Updated Website

This package is the revised static website + student portal + management console. The existing visual language is preserved while the requested navigation, payment/assessment journey, student dashboard, business services and admin workflow are improved.

## Important Supabase note
You already ran the earlier base SQL setup. **Do not run that old setup again.**

Run only:
- `SUPABASE-MIGRATION-FINAL.sql`

This migration updates admin authorization, keeps the generated Student ID available in Auth metadata for future custom email templates, adds editable payment-method configuration, program schedule settings, service settings, registration WhatsApp setting, task-form settings, and seeds the supplied domain project instruction links.

## Admin login
1. Create/use the separate Supabase Auth user `info.softgrowtech@gmail.com`.
2. Give that Auth user the `role=admin` metadata using the SQL approach already discussed.
3. Open `admin-login.html`.
4. After login, the protected management console is `management-console-x7.html`.

The management console is noindex/nofollow, but authentication + RLS remain the real security boundary.

## Student flow
- `student-login.html` → Student Login
- `internships.html` → program/domain selection
- `student-register.html` → registration with country, study year and gender
- `registration-success.html` → registration confirmation
- `portal.html` → student dashboard; dashboard has Logout only
- `assessment.html` → assessment introduction → payment → assessment → final review → under review
- `enrollment.html` → individual payment methods and complete details
- `reset-password.html` → Gmail reset link; create-new-password appears only through the reset-link flow

## Task submissions
Task 1, Task 2 and Final Project submissions intentionally use **Google Forms** so large student project files do not fill Supabase Storage. Add the three Google Form URLs from the Admin Panel under `Tasks & Submission Forms`.

## Email
The frontend is prepared for the custom registration/reset email flow, but the sender identity and Auth email templates must be configured in Supabase/your SMTP provider. Do not put SMTP credentials in the website files.

## Deployment
Deploy the static files to the existing hosting. No build command is required.
