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

### Password reset (ESP-51)

The forgot-password form sends a CSRF-protected request through the Next API
proxy. Registered and unknown addresses receive the same success response,
including on delivery failure. Reset links carry a purpose-specific Django token
in the URL fragment (removed from browser history when the page opens). Links
expire after one hour; resetting the password invalidates all outstanding reset
links and existing Django sessions on their next request. Reset does not log in
or verify the user, and unverified accounts retain their restrictions.

The existing email backend and SMTP settings above also deliver reset mail.
Set `PASSWORD_RESET_ORIGIN` to the trusted HTTPS frontend origin (defaults to
`EMAIL_VERIFICATION_ORIGIN`). Production still needs SMTP credentials, a verified
sender, SPF/DKIM/DMARC, delivery monitoring and real inbox testing. The console
backend prints links locally and must not be used in production. Requests send
synchronously, so response timing can reveal delivery work despite identical
responses; production should queue mail and apply per-IP/per-address rate limits
to prevent timing probes and email flooding. No reset-specific throttling or
background worker is included in this change. SQLite does not support row locks;
a conditional hash update ensures only one successful reset can consume a token.
