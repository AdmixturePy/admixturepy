from flask import Flask, render_template, request, jsonify
import webMonte
import settings
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pymonte')
def calculator():
    return render_template('calculator.html')

@app.route('/pca')
def pca():
    return render_template('pca.html')

@app.route('/api/nmonte', methods=['POST'])
def nmonte():
    if(request.is_json):
        return webMonte.webMonte(request.json)
    else:
        return '{ "error_message": "Expecting JSON with sources and targets." }'

@app.route('/api/distance', methods=['POST'])
def return_distance():
    if(request.is_json):
        return webMonte.returnDistance(request.json)
    else:
        return '{ "error_message": "Expecting JSON with sources and targets." }'

@app.route('/api/samples/batch', methods=['POST'])
def return_sample_PC_batch():
    if(request.is_json):
        return webMonte.returnSamplesPCBatch(request.json)
    
@app.route('/api/samples', methods=['GET'])
def return_sample_names():
    return webMonte.returnAllSamples()

@app.route('/api/samples/<id>')
def return_sample(id):
    return webMonte.returnSample(id)

@app.route('/api/samples/<id>/<int:pc>')
def return_sample_pc(id, pc):
    return webMonte.returnSamplePC(id, pc)

@app.route('/api/version', methods=['GET'])
def return_version():
    import platform
    return {"version_major": settings.PYMONTE_VERSION_MAJOR, "version_minor":settings.PYMONTE_VERSION_MINOR, "platform": platform.platform() }

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', error_code=404, error_message=f"The requested URL: {request.path} was not found on this server.")

@app.errorhandler(405)
def page_not_found(e):
    return render_template('error.html', error_code=405, error_message=f"You're not supposed to be here. Are you accessing an API URL from a browser?")


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug = True)