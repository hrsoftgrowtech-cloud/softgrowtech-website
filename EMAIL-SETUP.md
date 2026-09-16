# SoftGrowTech Email Setup (after deployment)

The website code does not contain SMTP credentials. Configure email in Supabase Auth separately.

## Registration confirmation email
Use a SoftGrowTech-branded Auth email template instead of the default Supabase wording. The signup trigger now stores the generated Student ID in Auth user metadata, so the template can use:

`{{ .Data.student_id }}`

Useful template fields include `{{ .Data.full_name }}`, `{{ .Data.domain }}`, and `{{ .ConfirmationURL }}`.

Suggested sender:

SoftGrowTech <no-reply@softgrowtech.in>

## Password reset email
Use a SoftGrowTech-branded recovery template with:

`{{ .ConfirmationURL }}`

The reset link should return to:

`https://softgrowtech.in/reset-password.html?mode=new`

## SMTP
Configure a custom SMTP provider in Supabase Auth. Verify the sending domain with the provider and publish its SPF/DKIM DNS records. Keep SMTP credentials out of the website files.

Note: the website intentionally does not store a student's temporary password in the database or Auth metadata. If you want the temporary password inside the registration email, implement that through a secure server-side/Edge Function flow rather than storing passwords in plain text.
