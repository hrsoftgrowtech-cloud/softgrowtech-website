# SoftGrowTech — Final Implementation Package

This package contains the SoftGrowTech public website, student registration/login/dashboard, public document verification, selection assessment/payment journey, and protected Management Console.

## 1. Supabase migration

Run **SUPABASE-MIGRATION-FINAL.sql** in the existing SoftGrowTech Supabase project after the earlier base setup.

The migration adds/fixes:
- website-registration public verification through `sgt_profiles` without changing legacy confirmation verification
- admin RLS so Management Console edits actually save to the database
- founder/team-admin access management
- founder-only activity/audit log
- permission-controlled admin writes
- editable services/domains/payment settings/program schedule
- payment status synchronization to student profiles
- editable student/admin notes
- authenticator-app 2FA support for the Founder account

Do not put a Supabase service-role key in the website. The package uses only the publishable key in browser code.

## 2. Founder account

The existing Founder/management account is expected to be:
- `info.softgrowtech@gmail.com`

Its Supabase Auth user must have `raw_user_meta_data.role = admin` (or `founder`). The package treats that account as Founder-level access.

After the first successful login, open **Settings → Founder Security** and set up Authenticator 2FA. Once a verified TOTP factor exists, the Management Console login requires the authenticator code after the password.

## 3. Team members

Create the team member's Supabase Auth account first. Then, while logged in as Founder, open **Team & Access** and grant Management Console access with the required permissions.

Removing access deactivates the team member without deleting their Auth account. The Founder can see login/logout and management changes in the private Activity Log.

## 4. Student journey

Registration is free and creates the permanent Student ID. The student can log in with Student ID or registered Gmail.

Selection journey:
1. Start Selection Assessment
2. Enrollment Fee & payment details
3. Payment receipt/transaction submission
4. Payment under verification
5. Continue the website-native assessment
6. Review answers
7. Final submission
8. Admin reviews payment + assessment
9. Selected → program/offer letter flow
10. Not Selected before batch start → re-assessment with the same Student ID
11. Not Selected after batch start → refund/new registration flow

Task submissions remain Google Forms/Google Drive to avoid filling Supabase Storage with project files.

## 5. Public Document Verification

New website registrations are verified from the registration database using:
- Student ID
- Last 4 digits of registered phone

New records show only essential public information: Student ID, name, masked Gmail, domain, batch start/end, offer letter status, certificate status and internship status.

Legacy verification records continue through the existing legacy/orientation flow, including their historical confirmation information. Public verification has no document-download button.

## 6. Admin → Website synchronization

Changes saved in the Management Console are database-backed. Services and domains are rendered dynamically on the public website; payment settings are used by the enrollment page; student status/payment/document changes are reflected on the Student Dashboard.

## 7. Deployment

Upload the contents of this package to the existing hosting. No build command is required for the static website.
