import Quandl
from bokeh.plotting import figure
import pandas as pd
from bokeh.embed import components
from bokeh.palettes import Spectral6, RdYlGn4

from flask import Flask, render_template, request, redirect, Response, send_from_directory

# Load file for all to read
dat = pd.read_csv("./data/all_types_daily.csv").reset_index()

app = Flask(__name__)

@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('data', path)

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/')
def index():
  ap = dat[dat["type"] == "access point"]
  ap["date"] = pd.to_datetime(ap["date"])

  ## Read the query string to get the name of the object
  #if "symbol" not in request.args:
  #    # If symbol wasn't given, return the empty template
  #    return render_template('index.html')

  #Parse "features" for getting a list of the attributes to show, use that instead of just "Open"
  #features =request.args.getlist('features')

  #samsung = dat[dat.product_name == "Samsung Seagate HN-M201RAD Momentus SpinPoint ST2000LM003 2TB 2.5-Inch SATA III Notebook Hard Drive 9.5MM"]  \
  #     .sort_values('date') \
  #     .groupby(pd.Grouper(key='date', freq='1W'))  \
  #     .mean()

  # Create bokeh graph using `figure()`
  p = figure(x_axis_type="datetime", plot_width=500)

  #Plot several figures, not just one
  #for i_f, f in enumerate(features):
  #p.line(dat.index, dat[f], line_width=2, color=RdYlGn4[i_f], legend=f)

  #print("date")
  #print(ap["date"])

  #print("mean")
  #print(ap["mean"])

  p.line(ap["date"], ap["mean"], line_width=2) #, color=RdYlGn4)

  # Call `components` on this graph
  script, div = components(p)

  # Insert these variables into the template
  #return render_template('index.html', stock_name = stock_name, dat_script = script, dat_div = div)
  return render_template('index.html', dat_script = script, dat_div = div)

if __name__ == '__main__':
  app.run(host='0.0.0.0', debug=True, port=8080)
