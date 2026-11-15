from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Schools, Team, TeamMember, User, UserProfile


class Command(BaseCommand):
    help = "Create sample schools, teams, and players for Discover"
    #used to create the dummy data
    @transaction.atomic #this means that it will only write to the database IF the whole function succeeds without errors
    def handle(self, *args, **options): 
        schools = [
            Schools.objects.get_or_create(school=name)[0]
            for name in ("Sacramento State", "UC Davis")
        ] #logic for creating the schools (currently only 2)

        teams = []
        #creates sample teams alternating between Valorant and League of Legends
        for index in range(10):
            school = schools[index // 5]
            game = "Valorant" if index % 2 == 0 else "League of Legends"

            team, _ = Team.objects.get_or_create( # _ is not needed because we do not need the second value only the first
                school=school,
                name=f"Sample Team {index + 1}",
                defaults={"game": game},
            )
            teams.append(team)

        roles = ("Controller", "Duelist", "IGL", "Flex")

        for number in range(1, 101): #creates 100 users
            team = teams[(number - 1) // 10] #returns a team from the teams list
            email = f"sample-player-{number:03d}@example.invalid" #creating an email

            user = User.objects.filter(email=email).first() #checks to see if a user with this email exits
            if user is None:
                user = User( #create new user
                    email=email,
                    real_name=f"Sample Player {number:03d}",
                    school=team.school,
                    isEmailVerified=True,
                )
                user.set_unusable_password() #account is unusable
                user.save()

            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    "handle": f"sample-player-{number:03d}",
                    "gamertag": f"Player{number:03d}",
                    "team": team,
                    "game": team.game,
                    "role": roles[(number - 1) % len(roles)],
                    "looking_for_team": number % 3 == 0, #every three players are looking for a team
                },
            )
            TeamMember.objects.get_or_create(team=team, user=user) 

        self.stdout.write(self.style.SUCCESS("Discover sample data is ready."))