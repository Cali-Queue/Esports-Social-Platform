from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from .models import Schools, Team, User, UserProfile
from .search_views import clean_search_query


class CleanSearchQueryTests(SimpleTestCase):
    def test_trims_leading_and_trailing_space(self):
        self.assertEqual(clean_search_query('   jake  '), 'jake')
        self.assertEqual(clean_search_query('  '), '')
        self.assertEqual(clean_search_query(None), '')

    def test_keeps_letters_numbers_and_inner_spaces(self):
        self.assertEqual(clean_search_query('Team 42 Alpha'), 'Team 42 Alpha')

    def test_rejects_other_characters(self):
        for value in ('jake!', 'o\'neil', 'a_b', 'jake%', 'josé', 'a\tb', '<script>'):
            with self.subTest(value=value), self.assertRaisesMessage(ValueError, 'letters, numbers, and spaces'):
                clean_search_query(value)

    def test_limits_length_to_40_after_trimming(self):
        self.assertEqual(clean_search_query('a' * 40), 'a' * 40)
        self.assertEqual(clean_search_query('  ' + 'a' * 40 + '  '), 'a' * 40)
        with self.assertRaisesMessage(ValueError, '40 characters or fewer'):
            clean_search_query('a' * 41)


class SearchEndpointTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        school = Schools.objects.create(school='Sacramento State')
        cls.me = User.objects.create_user(email='me@csus.edu', password='pw', real_name='Me', isEmailVerified=True)
        UserProfile.objects.create(user=cls.me, handle='me', gamertag='MeMyself')

        jake = User.objects.create_user(email='jake@csus.edu', password='pw', real_name='Jake Smith',
                                        isEmailVerified=True, school=school)
        UserProfile.objects.create(user=jake, handle='jsmith', gamertag='Blaze', game='Valorant')

        hidden = User.objects.create_user(email='hidden@csus.edu', password='pw', real_name='Jake Hidden',
                                          isEmailVerified=True)
        UserProfile.objects.create(user=hidden, handle='ghost', gamertag='Ghost', show_real_name=False)

        inactive = User.objects.create_user(email='old@csus.edu', password='pw', real_name='Jake Old',
                                            isEmailVerified=True, is_active=False)
        UserProfile.objects.create(user=inactive, handle='oldjake', gamertag='OldJake')

        Team.objects.create(name='Jake Squad', school=school, game='Valorant')
        Team.objects.create(name='Hornets Black', school=school)

    def setUp(self):
        self.client.force_login(self.me)

    def search(self, q):
        return self.client.get(reverse('search'), {'q': q})

    def test_requires_login(self):
        self.client.logout()
        self.assertEqual(self.search('jake').status_code, 401)

    def test_case_insensitive(self):
        results = [self.search(q).json() for q in ('jake', 'JAKE', 'JaKe')]
        self.assertEqual([p['handle'] for p in results[0]['players']], ['jsmith'])
        self.assertEqual([t['name'] for t in results[0]['teams']], ['Jake Squad'])
        for other in results[1:]:
            self.assertEqual(other['players'], results[0]['players'])
            self.assertEqual(other['teams'], results[0]['teams'])

    def test_matches_gamertag_handle_and_team_name(self):
        self.assertEqual([p['handle'] for p in self.search('blaze').json()['players']], ['jsmith'])
        self.assertEqual([p['handle'] for p in self.search('JSMITH').json()['players']], ['jsmith'])
        self.assertEqual([t['name'] for t in self.search('hornets').json()['teams']], ['Hornets Black'])

    def test_hidden_real_names_are_not_searchable_or_returned(self):
        data = self.search('hidden').json()
        self.assertEqual(data['players'], [])
        ghost = self.search('ghost').json()['players'][0]
        self.assertIsNone(ghost['real_name'])

    def test_no_matches(self):
        response = self.search('Micky')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'query': 'Micky', 'players': [], 'teams': []})

    def test_empty_and_blank_searches_return_nothing(self):
        for q in ('', '    '):
            with self.subTest(q=q):
                response = self.search(q)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), {'query': '', 'players': [], 'teams': []})
        response = self.client.get(reverse('search'))  # no q at all
        self.assertEqual(response.json()['players'], [])

    def test_trims_query(self):
        data = self.search('   jake   ').json()
        self.assertEqual(data['query'], 'jake')
        self.assertEqual(len(data['players']), 1)

    def test_rejects_long_and_invalid_queries(self):
        self.assertEqual(self.search('a' * 40).status_code, 200)
        for q in ('a' * 41, 'jake%', "jake' OR 1=1"):
            with self.subTest(q=q):
                response = self.search(q)
                self.assertEqual(response.status_code, 400)
                self.assertIn('detail', response.json())

    def test_only_get_is_allowed(self):
        self.assertEqual(self.client.post(reverse('search'), {'q': 'jake'}).status_code, 405)
