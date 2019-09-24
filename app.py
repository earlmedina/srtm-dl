from flask import Flask, Response, render_template, redirect, url_for, request, jsonify, send_from_directory, send_file
import elevation, os, uuid


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



def landsat_dl(name, output, xmin, ymin, xmax, ymax):
  # clip the SRTM1 30m DEM of Rome and save it to Rome-DEM.tif
  elevation.clip(bounds=(xmin, ymin, xmax, ymax), output=output)
  # clean up stale temporary files and fix the cache in the event of a server error
  elevation.clean()
  return 'download/%s' % name



@app.route('/', methods=['GET','POST'])
def index():
    return render_template('index.html')

@app.route('/background_process', methods=['POST'])
def background_process():
    name = str(uuid.uuid4()) +'.tif'
    output = os.path.join(os.path.join(basedir, app.config['UPLOAD_FOLDER'],name))
    coords = request.get_json()
    print(coords)
    xmin = coords['geometry']['coordinates'][0][0][0]
    ymin = coords['geometry']['coordinates'][0][0][1]
    xmax = coords['geometry']['coordinates'][0][2][0]
    ymax = coords['geometry']['coordinates'][0][2][1]
    dl = landsat_dl(name, output, xmin, ymin, xmax, ymax)
    return dl



@app.route('/download/<path:filename>',methods=['GET','POST'])
def download(filename):
    #file = '/root/flask/elev/flask.tif'
    uploads = os.path.join(basedir, app.config['UPLOAD_FOLDER'])
    return send_from_directory(directory=uploads, filename=filename)
    #return send_file(filename=filename, as_attachment=True)

if __name__ == '__main__':
    app.run(
      host='0.0.0.0',  
      port=5005,
      debug=True
    )

