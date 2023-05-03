from flask import Flask
from flask import render_template
from flask import request, jsonify


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/submit', methods=['POST'])
def submit():
    textbox1 = request.form['textbox1']
    textbox2 = request.form['textbox2']
    # Validate user input
    if not textbox1 or not textbox2:
        return jsonify({'error': 'Invalid input'}), 400
    # Submit transaction to Wax cloud wallet
if __name__ == '__main__':
    app.run(debug=True)
