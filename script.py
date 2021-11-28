import os
from flask.helpers import make_response
from flask_cors.decorator import cross_origin
import geopandas as gpd
from shapely.geometry import Polygon
from flask import Flask, send_from_directory, safe_join, request
import json

chicago_zip = "/home/laxmena/Workspace/583/big_data_vis/geojson/chiago-zip.geojson"
covid_zip = "/home/laxmena/Workspace/583/big_data_vis/geojson/covid-zip.geojson"

chiz = gpd.read_file(chicago_zip)
chiz = json.loads(chiz.to_json())
covz = json.loads(gpd.read_file(covid_zip).to_json())

zip_bound = {}
week_bound = {}

# Color band list from low to high
color_band = ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"]

for each in chiz['features']:
    zip_bound[each['properties']['zip']] = each['geometry']

for each in covz['features']:
    if each['properties']['zip_code'] == 'Unknown':
        continue
    each['geometry'] = zip_bound[each['properties']['zip_code']]
    if each['properties']['week_start'] not in week_bound:
        week_bound[each['properties']['week_start']] = []
    week_bound[each['properties']['week_start']].append(each)

# Create geojson file for each key in week_bound
for key in week_bound:
    fname = key.split('T')[0]

    max_case = 0
    for each in week_bound[key]:
        try: 
            case = float(each['properties']['cases_weekly'])
        except:
            case = 0
        max_case = max(max_case, float(case))
    
    for each in week_bound[key]:
        # Calculate color band
        try: 
            case = float(each['properties']['cases_weekly'])
        except:
            case = 0
        if(max_case == 0):
            each['properties']['color'] = color_band[0]
        else:
            each['properties']['color'] = color_band[int(case/max_case*(len(color_band)-1))]
        each['fill-opacity'] = 0.5
        each['stroke'] = '#000000'
        each['stroke-width'] = 2
        each['stroke-opacity'] = 0.5
    
    # Create geojson feature collection
    feature_collection = {
        "type": "FeatureCollection",
        "features": week_bound[key]
    }
    with open(f'/home/laxmena/Workspace/583/big_data_vis/geojson/covid/{fname}.geojson', 'w') as f:
        f.write(json.dumps(feature_collection))




