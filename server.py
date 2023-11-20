from flask import Flask, render_template,request,jsonify
import requests

API_Address='http://api.weatherapi.com/v1/forecast.json?key=3c38f31dc60e4f979ad114837231511&q=las vegas&days=7&aqi=no&alerts=no'

app = Flask(__name__,template_folder=r'C:/Users/oisin/WebDevProj/WeatherApp/Server/ClientSide/templates',static_folder=r'C:/Users/oisin/WebDevProj/WeatherApp/Server/ClientSide/static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/city-selection', methods=['POST'])
def selection():
    data = request.get_json()
    received_string = data.get('data', '')
    
    # Do something with the received string
    # For example, print it
    print('Received String:', received_string)

    API_Address=received_string
    
    #Send to js file
    try:
        # Specify the API endpoint you want to call
        api_url = API_Address
        
        # Make a GET request to the API
        response = requests.get(api_url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Parse the JSON response
            api_data = response.json()

            # Do something with the data (for example, return it as JSON)
            return jsonify(api_data) #returns json of Weather Data to js file
        else:
            # If the request was not successful, return an error message
            return jsonify({'error': f'Failed to fetch data from API. Status code: {response.status_code}'})
    except Exception as e:
        # Handle exceptions, e.g., network errors
        return jsonify({'error': f'An error occurred: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True) 