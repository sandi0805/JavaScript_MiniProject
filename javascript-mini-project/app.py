import json
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():

    # use render_template to serve up the index.html

    return render_template("index.html")

@app.route("/samples")
def samples():
    # Opening JSON file 
    f = open('static/data/samples.json',)
    samples_dat = json.load(f)

    # open the json file, located at static/data/samples.json
    # use json.load() to read in the file as json
    # return that json through the Flask endpoini
    
    return samples_dat

if __name__ == "__main__":
    app.run(debug=True)