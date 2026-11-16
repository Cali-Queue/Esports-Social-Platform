from django.urls import path

from .views import discover_players, discover_teams, discover_schools

#Note: this is the urls file and this is where we enter all of our paths.
#Arguments: path("path", function to do task, name of the route)
#Name is optional: can be helpful later on when Django code needs to redirect to that route rather than using the entire path

urlpatterns = [
    path("players/", discover_players, name="discover_players"), #returns json of all players
    path("teams/", discover_teams, name="discover_teams"), #returns json of all teams
    path("schools/", discover_schools, name="discover_schools"), #returns json of all school
]