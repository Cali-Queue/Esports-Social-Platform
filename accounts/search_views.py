#JSON endpoint for the navbar search. mounted at /api/search/ in config/urls.py
#GET /api/search/?q=jake -> {"query": "jake", "players": [...], "teams": [...]}
#The only matching rule is a case-insensitive "contains" (jake, JAKE and Jake all return the same results).

import re

from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import Team, UserProfile

MAX_QUERY_LENGTH = 40
#letters, numbers and spaces only. must match src/lib/search-query.mjs
ALLOWED_QUERY = re.compile(r'[A-Za-z0-9 ]*')


#trims the query and checks it. returns the cleaned text or raises ValueError with a message for the user
def clean_search_query(raw):
    query = (raw or '').strip()
    if len(query) > MAX_QUERY_LENGTH:
        raise ValueError(f'Search must be {MAX_QUERY_LENGTH} characters or fewer.')
    if not ALLOWED_QUERY.fullmatch(query):
        raise ValueError('Search can only contain letters, numbers, and spaces.')
    return query


def _player_json(profile):
    user = profile.user
    return {
        'id': profile.id,
        'handle': profile.handle,
        'gamertag': profile.gamertag,
        'real_name': user.real_name if profile.show_real_name else None,  # respect the privacy setting
        'school': user.school.school if user.school else None,
        'game': profile.game,
        'role': profile.role,
        'looking_for_team': profile.looking_for_team,
        'avatar': profile.avatar,
    }


@require_GET
def search(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Log in to search.'}, status=401)

    try:
        query = clean_search_query(request.GET.get('q', ''))
    except ValueError as error:
        return JsonResponse({'detail': str(error)}, status=400)

    #an empty search returns nothing instead of every student and team
    if not query:
        return JsonResponse({'query': '', 'players': [], 'teams': []})

    profiles = (
        UserProfile.objects.select_related('user__school')
        .filter(user__is_active=True)
        .filter(
            Q(gamertag__icontains=query)
            | Q(handle__icontains=query)
            #hidden real names can't be searched, otherwise the search would leak them
            | Q(user__real_name__icontains=query, show_real_name=True)
        )
        .order_by('gamertag', 'id')
    )
    teams = Team.objects.select_related('school').filter(name__icontains=query).order_by('name', 'id')

    return JsonResponse({
        'query': query,
        'players': [_player_json(profile) for profile in profiles],
        'teams': [
            {'id': team.id, 'name': team.name, 'school': team.school.school, 'game': team.game}
            for team in teams
        ],
    })
