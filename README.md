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
backend prints links locally and must not be used in production. Reset requests use Django's default cache to allow one attempt per normalized
address per 60 seconds and ten attempts per source IP per fixed 60-second window.
Known, unknown, inactive and unusable-password accounts share the limits and
same HTTP 200 response, including suppressed requests and delivery failures.
Cache keys contain keyed hashes rather than raw emails/IPs. Limits run before
account lookup. A 300ms minimum response time covers ordinary lookup/delivery
latency; slow synchronous SMTP can still reveal timing differences. Production
should queue delivery and retain edge rate limits; the floor occupies a worker
and is not a complete timing or denial-of-service defense.

The default local-memory cache is process-local: multi-worker deployments MUST
configure a shared Django cache with atomic `add` (for example Redis or Memcached).
Cache eviction/restarts reset limits; cache outages may fail requests. Fixed IP
windows allow boundary bursts and shared IPs share capacity. `REMOTE_ADDR` is the
source; configure trusted proxy handling at deployment, never trust arbitrary
forwarded headers. Shared cache and proxy configuration require deployment testing.
SQLite does not support row locks;
a conditional hash update ensures only one successful reset can consume a token.


### Final Sprint 3 audit deployment and policy requirements

Logout accepts any authenticated session, including unverified accounts, while
retaining CSRF-protected POST session invalidation and existing redirects.
Browser follow selections are keyed by authenticated user ID; legacy shared
`cq-following` selections are deliberately ignored because ownership is unknown.
These selections remain a browser-only prototype, not server-authorized records.

Discovery API policy is unchanged: anonymous discovery access remains public;
unverified authenticated sessions remain restricted. Any access-policy change
requires explicit team approval.

The temporary college domain allowlist is unchanged. An approved California
college list is still required from the team before replacing it.

Production configuration must supply a unique secret key, disable DEBUG, set
ALLOWED_HOSTS and trusted HTTPS CSRF origins, enable secure session/CSRF cookies,
and configure HTTPS/proxy settings, SMTP secrets and shared cache infrastructure.
Record credentials in deployment secret storage only; no production secrets or
credentials are changed by this audit fix.
