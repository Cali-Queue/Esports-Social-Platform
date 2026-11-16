#JSON endpoints for the logged-in user's own profile. used by the first-time setup flow.
#same session + CSRF rules as auth_views.py: POST/PATCH need the X-CSRFToken header.

import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import Schools, Team

#fields the setup flow is allowed to change, so a request can't edit things like handle or role
EDITABLE_FIELDS = {'real_name', 'bio', 'school_id', 'grad_year', 'team_id', 'game', 'interests'}
MIN_GRAD_YEAR = 2000
MAX_GRAD_YEAR = 2100
MAX_INTERESTS = 20


#the profile info sent back to the frontend
def _profile_json(user):
    profile = user.profile
    return {
        'real_name': user.real_name,
        'gamertag': profile.gamertag,
        'handle': profile.handle,
        'bio': profile.bio,
        'school': {'id': user.school.id, 'name': user.school.school} if user.school else None,
        'grad_year': profile.grad_year,
        'team': {'id': profile.team.id, 'name': profile.team.name} if profile.team else None,
        'game': profile.game,
        'interests': profile.interests,
    }


#turns "", None, 5 or "5" into an int or None. raises ValueError for anything else
def _optional_int(value):
    if value is None or value == '':
        return None
    if isinstance(value, bool):  # True/False are ints in python, don't accept them
        raise ValueError
    return int(str(value).strip())


#GET   /api/profile/me/ - returns the logged-in user's profile
#PATCH /api/profile/me/ - body: any of { real_name, bio, school_id, grad_year, team_id, game, interests }
#  only the fields sent are changed. 200 with the updated profile, 400 with { errors: { field: message } }
@require_http_methods(['GET', 'PATCH'])
def my_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Log in to edit your profile.'}, status=401)

    user = request.user
    if not hasattr(user, 'profile'):
        # every account made through signup has one, so this only hits old test users
        return JsonResponse({'detail': 'This account has no profile.'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'profile': _profile_json(user)})

    try:
        data = json.loads(request.body or b'{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        data = None
    if not isinstance(data, dict):
        return JsonResponse({'detail': 'Request body must be a JSON object.'}, status=400)

    unknown = set(data) - EDITABLE_FIELDS
    if unknown:
        return JsonResponse({'detail': f'These fields can\'t be changed here: {", ".join(sorted(unknown))}.'}, status=400)

    profile = user.profile
    errors = {}

    # real name: can't be blanked out, fits User.real_name
    if 'real_name' in data:
        name = data['real_name'].strip() if isinstance(data['real_name'], str) else ''
        if not name:
            errors['real_name'] = 'Enter your real name.'
        elif len(name) > 200:
            errors['real_name'] = 'Name must be 200 characters or fewer.'
        else:
            user.real_name = name

    # bio: optional, fits UserProfile.bio
    if 'bio' in data:
        bio = data['bio'].strip() if isinstance(data['bio'], str) else ''
        if len(bio) > 500:
            errors['bio'] = 'Bio must be 500 characters or fewer.'
        else:
            profile.bio = bio

    # school: an id from the Schools table, or null to clear it
    if 'school_id' in data:
        try:
            school_id = _optional_int(data['school_id'])
            user.school = Schools.objects.get(id=school_id) if school_id is not None else None
        except (ValueError, Schools.DoesNotExist):
            errors['school_id'] = 'Pick a school from the list.'

    # grad year: optional whole number in a sane range
    if 'grad_year' in data:
        try:
            year = _optional_int(data['grad_year'])
            if year is not None and not MIN_GRAD_YEAR <= year <= MAX_GRAD_YEAR:
                raise ValueError
            profile.grad_year = year
        except ValueError:
            errors['grad_year'] = 'Pick a valid graduation year.'

    # team: an id from the Team table, or null for no team
    if 'team_id' in data:
        try:
            team_id = _optional_int(data['team_id'])
            profile.team = Team.objects.get(id=team_id) if team_id is not None else None
        except (ValueError, Team.DoesNotExist):
            errors['team_id'] = 'Pick a team from the list.'

    # game: optional, fits UserProfile.game
    if 'game' in data:
        game = data['game'].strip() if isinstance(data['game'], str) else ''
        if len(game) > 50:
            errors['game'] = 'Game must be 50 characters or fewer.'
        else:
            profile.game = game

    # interests: a list of short strings. blanks are dropped
    if 'interests' in data:
        raw = data['interests']
        if not isinstance(raw, list) or not all(isinstance(i, str) for i in raw):
            errors['interests'] = 'Interests must be a list of text.'
        else:
            interests = [i.strip() for i in raw if i.strip()]
            if len(interests) > MAX_INTERESTS:
                errors['interests'] = f'Add up to {MAX_INTERESTS} interests.'
            elif any(len(i) > 50 for i in interests):
                errors['interests'] = 'Each interest must be 50 characters or fewer.'
            else:
                profile.interests = interests

    # nothing is saved unless every field sent was valid
    if errors:
        return JsonResponse({'errors': errors}, status=400)

    user.save()
    profile.save()
    return JsonResponse({'profile': _profile_json(user)})
