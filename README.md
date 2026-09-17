# SoftGrowTech — Final Implementation Package

This package contains the updated public website, student portal and protected Management Console.

## Included improvements

- Home page now explains business value and links to the dedicated Services page instead of duplicating service cards.
- Student login accepts either registered Gmail or Student ID with the same password.
- First-login password change remains mandatory for temporary passwords; successful change redirects to Login after 5 seconds.
- Forgot Password uses one button: **Send Reset Link** → **Resend Reset Link**, with a 60-second cooldown. The cooldown survives refresh.
- Password-reset completion shows success and redirects to Student Login after 3 seconds.
- Offer Letter is available immediately after selection, independent of payment status.
- Certificate is available only when **Selected + Payment Verified + Program Status Completed**.
- Offer Letter and Certificate PDFs are generated in the browser and are not stored in Supabase Storage.
- Stable document IDs are generated from the Student ID when a database ID is not already present.
- Project/task access requires **Selected + Payment Verified**, unless Founder/Admin manually enables the project-access override.
- Project-access override does not change Offer Letter or Certificate eligibility.
- Re-assessment and refund flow is represented in the student dashboard with manual refund status controls for management.
- Student notifications have an unread count, notification panel, mark-as-read behavior and database-backed read records.
- Admin sidebar icons are section-specific.
- Team permission editing uses grouped checkboxes with existing permissions pre-selected.
- Activity Log is Founder/Super Admin only. Team Admins cannot view it.
- Audit records track login/logout and administrative changes already produced by the Management Console.
- Selection confirmation email support is included as a server-side Supabase Edge Function. No email API secret is present in browser code.

## Database update

Run `FINAL-DATABASE-IMPLEMENTATION.sql` once in the Supabase SQL Editor. It contains no passwords, API keys or personal account data.

The migration adds the fields/tables needed for project-access override, refund state, notification read state, selection-email idempotency and Founder-only audit visibility.

## Selection email Edge Function

The folder `supabase/functions/sgt-send-selection-email/` contains the server-side email function.

Set these as Supabase Edge Function secrets/environment variables; **do not put their values in this ZIP or frontend JavaScript**:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`

The service-role key and Brevo API key belong only on the server-side function. Supabase's publishable key may appear in browser code when database RLS is correctly configured.

## Registration email

`REGISTRATION-WELCOME-EMAIL-TEMPLATE.html` remains the Supabase Auth confirmation-email template. Keep SMTP credentials in Supabase/Brevo configuration, not in website code.

## Deployment

1. Run the database delta migration.
2. Deploy the optional Edge Function and configure its secrets.
3. Upload the website files to the existing static hosting.
4. Keep the existing Supabase custom SMTP configuration unchanged.

No build command is required for the static website.
