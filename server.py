import os
from flask.helpers import make_response
from flask_cors.decorator import cross_origin
import geopandas as gpd
from shapely.geometry import Polygon
from flask import Flask, send_from_directory, safe_join, request
import json
from datetime import datetime, timedelta

app = Flask(__name__, static_folder=os.path.abspath('./geojson/'))
divvy_station = None
divvy_stations_gdf = None
# chicago_boundaries_gdf = None
# chicago_boundaries = None


@app.route('/', methods=['GET'])
def index():
    return serve_static('index.html')

@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename):
    return send_from_directory(safe_join(app.root_path,'vis/dist/shadow-maps/'), filename)

@app.route('/stations', methods=['GET'])
def get_stations():
    response = make_response(divvy_station)
    response.headers['Content-Type'] = 'application/json'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
    
@app.route('/boundaries', methods=['GET'])
def get_boundaries():
    boundary_file = 'geojson/chicago-zip.geojson'
    date = request.args.get('date')
    # Get Week start date
    try:
        dt = datetime.strptime(date, '%Y-%m-%d')
    except Exception as e:
        print(e)
        return make_response('Invalid date format', 400)
    try:
        week_start = dt - timedelta(days=dt.weekday()+1)
        print("Week Start: ==> ", week_start)
        boundary_file = 'geojson/covid/{}.geojson'.format(week_start.strftime('%Y-%m-%d'))
        # Check if file exists
        print(boundary_file)
        if not os.path.exists(boundary_file):
            print('File not found')
            boundary_file = 'geojson/chicago-zip.geojson'
    except Exception as e:
        print(e)
        boundary_file = 'geojson/chicago-zip.geojson'        

    boundary = gpd.read_file(boundary_file)
    boundary = json.loads(boundary.to_json())
    print(len(boundary['features']))
    response = make_response(boundary)
    response.headers['Access-Control-Allow-Origin'] = '*'            

    return response
@app.route('/network', methods=['GET'])
def serve_network():
    # Get query params from GET request
    print(request.args)

    date = request.args.get('date')
    count = request.args.get('count')

    print(date,count)
    if date is None:
        # Send error response if date is not provided
        response = make_response('Date is not provided', 400)
    else:
        if count is None:
            count = 10
        # Check if date is valid
        year = int(date[0:4])
        network_file = 'geojson/{}/divvy_{}.geojson'.format(year, date)
        if os.path.exists(network_file):
            # read network_file and convert it to json
            network = gpd.read_file(network_file)
            network = json.loads(network.to_json())
            # Filter only top n features from the network features
            print(type(network))
            network['features'] = network['features'][:int(count)]
            # create response
            response = make_response(network)
        else:
            response = make_response('Data not found for specific date', 404)

    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/distribution', methods=['POST'])
def serve_distribution():
    data =  request.get_json()
    formatted = [tuple(e) for e in data]
    polygon = Polygon(formatted)
    frames = divvy_stations_gdf[divvy_stations_gdf.within(polygon)]
    return frames.describe().to_json()

def covid_data():
    pass

def load():
    global divvy_stations_gdf
    global divvy_station

    divvy_stations_gdf = gpd.read_file('./stations.geojson')
    divvy_station = divvy_stations_gdf.to_json()


if __name__ == '__main__':
    load()
    app.run(debug=True, host='127.0.0.1', port=8080)