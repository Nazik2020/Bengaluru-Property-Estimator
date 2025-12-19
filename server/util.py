import json
import pickle
import numpy as np
import os

__locations = None
__data_columns = None
__model = None

# Get the directory where this script is located
__script_dir = os.path.dirname(os.path.abspath(__file__))

def get_estimated_price(location, sqft, bath, bhk) :

    try :
         loc_index = __data_columns.index(location.lower())
    except:
        loc_index = -1
    x = np.zeros(len(__data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1
    return round ( __model.predict([x])[0], 2)

def get_location_names():
    return __locations

def load_saved_artifacts():
    print("loading saved artifacts... start")
    global __data_columns
    global __locations

    global __model
    columns_path = os.path.join(__script_dir, "artifacts", "columns.json")
    model_path = os.path.join(__script_dir, "artifacts", "bangaluru_home_price_model.pickle")
    
    with open(columns_path, 'r') as f:
        __data_columns =  json.load(f)['data_columns']
        __locations = __data_columns[3:]

    with open(model_path, 'rb') as f:
        __model = pickle.load(f)

        print("loading saved artifacts...done")


if __name__=='__main__':
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price('1st phase jp nagar', 1000, 3,3))
    print(get_estimated_price('1st phase jp nagar', 1000, 2,2))
    print(get_estimated_price('kalhali', 1000, 2,2))
    print(get_estimated_price('Ejipura', 1000, 2,2))