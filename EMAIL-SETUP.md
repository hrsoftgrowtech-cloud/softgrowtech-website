# SoftGrowTech Email Setup

The website uses Supabase Auth for registration and password-reset emails. SMTP credentials are not stored in the website.

## Important registration-email fix

The ZIP now includes `SUPABASE-REGISTRATION-EMAIL-FIX.sql`. Run that SQL **once** in Supabase SQL Editor. It makes the generated Student ID available in Auth metadata before the confirmation email is rendered, while keeping the existing registration flow and Student ID sequence.

Then update the **Supabase Auth → Email Templates → Confirm signup** template with the professional content from `REGISTRATION-WELCOME-EMAIL-TEMPLATE.html`.

The template uses:

- `{{ .Data.full_name }}` — student name
- `{{ .Data.domain }}` — selected domain
- `{{ .Data.student_id }}` — generated Student ID
- `{{ .Data.temp_password }}` — temporary password
- `{{ .ConfirmationURL }}` — the email-confirmation link

Keep the confirmation link in the email. The confirmation link should remain the main account-verification action.

The Student Login link is:
`https://softgrowtech.in/student-login.html`

## Password reset email

Use the SoftGrowTech-branded recovery template with `{{ .ConfirmationURL }}` and keep the redirect target as:
`https://softgrowtech.in/reset-password.html?mode=new`

## SMTP

Keep your custom SMTP/Brevo configuration in Supabase. Do not put SMTP or Brevo API secrets in website JavaScript.
