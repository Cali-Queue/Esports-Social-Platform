from django.shortcuts import render

def explore_map(request):
    return render(request, 'map/explore.html')