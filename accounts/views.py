from django.db.models import Q
from django.http import JsonResponse

from .models import UserProfile, Schools, Team

def discover_players(request):
    search = request.GET.get("search", "").strip() #returns "" if the search field is empty
    school = request.GET.get("school", "").strip()
    game = request.GET.get("game", "").strip()
    roles = request.GET.getlist("role")
    looking_for_team = request.GET.get("looking_for_team") == "true"

    profiles = UserProfile.objects.select_related("user__school").filter(
        user__is_active=True) #only return users that have activated accounts

    if search:
        profiles = profiles.filter(
            Q(gamertag__icontains=search) #here we are using the or conditions to find if the search is in their gamertag, handle. or realname
            | Q(handle__icontains=search)
            | Q(user__real_name__icontains=search))
    if school:
        profiles = profiles.filter(user__school__school__iexact=school)
    if game:
        profiles = profiles.filter(game__iexact=game)
    if roles:
        profiles = profiles.filter(role__in=roles)
    if looking_for_team:
        profiles = profiles.filter(looking_for_team=True)

    #get and populate the data from the table using list comprehension.
    players = [
        {
            "id": profile.id,
            "handle": profile.handle,
            "gamertag": profile.gamertag,
            "school": profile.user.school.school if profile.user.school else None, #school is empty until the user finishes setup
            "game": profile.game,
            "role": profile.role,
            "looking_for_team": profile.looking_for_team,
            "avatar": profile.avatar,
        }
        for profile in profiles.order_by("gamertag")
    ]

    return JsonResponse({"players": players}) #return all of the players

def discover_teams(request):
    search = request.GET.get("search", "").strip()
    school = request.GET.get("school", "").strip()
    game = request.GET.get("game", "").strip()

    teams = Team.objects.select_related("school").all()

    if search:
        teams = teams.filter(name__icontains=search)
    if school:
        teams = teams.filter(school__school__iexact=school)
    if game:
        teams = teams.filter(game__iexact=game)

    return JsonResponse({
        "teams": [
            {
                "id": team.id,
                "name": team.name,
                "school": team.school.school,
                "game": team.game,
            }
            for team in teams.order_by("name", "id")
        ]
    })


def discover_schools(request):
    search = request.GET.get("search", "").strip()

    schools = Schools.objects.all()

    if search:
        schools = schools.filter(school__icontains=search)

    return JsonResponse({
        "schools": [
            {
                "id": school.id,
                "name": school.school,
            }
            for school in schools.order_by("school")
        ]
    })