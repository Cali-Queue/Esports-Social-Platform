from django.http import JsonResponse


class VerifiedAccountMiddleware:
    """Restricted sessions may only use auth endpoints until verified."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (request.path.startswith('/api/') and not request.path.startswith('/api/auth/')
                and request.user.is_authenticated and not request.user.isEmailVerified):
            return JsonResponse({'detail': 'Verify your email to continue.'}, status=403)
        return self.get_response(request)
