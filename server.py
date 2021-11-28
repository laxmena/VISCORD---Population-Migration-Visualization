import os
from flask.helpers import make_response
from flask_cors.decorator import cross_origin
import geopandas as gpd
from shapely.geometry import Polygon
from flask import Flask, send_from_directory, safe_join, request
import json
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
    boundary_file = './boundaries.geojson'
    boundary = gpd.read_file(boundary_file)
    boundary = json.loads(boundary.to_json())
            # create response
    response = make_response(boundary)
    response.headers['Access-Control-Allow-Origin'] = '*'            

    return response
@app.route('/network', methods=['GET'])
def serve_network():
    # network_file = 'geojson/2019/divvy_2019-01-01.geojson'
    # network = gpd.read_file(network_file)
    # network = json.loads(network.to_json())
    # network['features'] = network['features'][:int(100)]
    #         # create response
    # response = make_response(network)
    # date = request.args.get('date')
    # count = request.args.get('count')
    date = '2021-01-01'
    count=100
    print(date,count)
    if date is None:
        # Send error response if date is not provided
        response = make_response('Date is not provided', 400)
    else:
        if count is None:
            count = 10
        # Check if date is valid
        year = int(date[0:4])
        #network_file = 'geojson/{}/divvy_{}.geojson'.format(year, date)
        network_file = 'geojson/2019/divvy_2019-01-01.geojson'
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

def load():
    global divvy_stations_gdf
    global divvy_station
    # global chicago_boundaries_gdf
    # global chicago_boundaries

    divvy_stations_gdf = gpd.read_file('./stations.geojson')
    divvy_station = divvy_stations_gdf.to_json()
    # chicago_boundaries_gdf = gpd.read_file('./Boundaries.geojson')
    # chicago_boundaries = chicago_boundaries_gdf.to_json()


if __name__ == '__main__':
    load()
    app.run(debug=True, host='127.0.0.1', port=8080)