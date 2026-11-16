# Esports-Social-Platform
A networking platform connecting collegiate esports players, teams, and recruiters spanning California.

# Project Overview

# Planned Features

# Team

# Developement

# Project Status

### Email verification (ESP-49)

Run migrations with `python manage.py migrate`. Development uses Django's console
email backend: verification messages appear only in the Django terminal. Open the
link and click **Verify email**. Links expire after 24 hours and are single-use;
a successful resend replaces the previous link. Resends require a logged-in
session and allow one accepted send per minute. If delivery fails, the account
and restricted session remain available for retry, and an older link stays valid.
Unverified users can log in and use auth endpoints but cannot enter setup/main
pages or access non-auth APIs through their session. Verification does not log in
the browser opening the email; log in afterward if needed.

Production: set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`,
`EMAIL_HOST`, `EMAIL_PORT` (default 587), `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`,
`EMAIL_USE_TLS=true`, and a verified `DEFAULT_FROM_EMAIL`. Set
`EMAIL_VERIFICATION_ORIGIN` to the trusted HTTPS frontend origin; links never use
the incoming Host header. Keep SMTP credentials in deployment secrets. Configure
provider SPF/DKIM/DMARC and test delivery. Standard Django production hardening
(secret key, DEBUG, hosts, HTTPS cookies and CSRF origins) is also required.
Delivery is synchronous with a 10-second SMTP timeout; production should apply
edge rate limits to signup/login/verification in addition to resend's database
cooldown. Resend never accepts a target email and exposes no account lookup;
the pre-existing signup duplicate-email validation still reveals registrations.
