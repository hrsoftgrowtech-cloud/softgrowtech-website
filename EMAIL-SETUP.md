# SoftGrowTech Email Setup

The website uses Supabase Auth for registration and password-reset emails. SMTP credentials are not stored in the website.

## Registration welcome email
Use a SoftGrowTech-branded Supabase Auth confirmation template. The registration code sends these metadata fields:

- `{{ .Data.full_name }}` — student name
- `{{ .Data.domain }}` — selected domain
- `{{ .Data.student_id }}` — generated Student ID
- `{{ .Data.temp_password }}` — temporary password

A ready professional template is included in `REGISTRATION-WELCOME-EMAIL-TEMPLATE.txt`.

The Login page link should appear near the top of the email:
`https://softgrowtech.in/student-login.html`

## Password reset email
Use a SoftGrowTech-branded recovery template with `{{ .ConfirmationURL }}` and keep the redirect target as:
`https://softgrowtech.in/reset-password.html?mode=new`

## SMTP
Configure your custom SMTP provider in Supabase Auth and verify the sending domain with the provider. Keep SMTP credentials out of website files.
