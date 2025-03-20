from flask import Flask, request, render_template

app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    n = None
    if request.method == 'POST':
        try:
            n = int(request.form.get('grid_size', 0))
            if n < 5 or n > 9:
                n = None
        except ValueError:
            n = None
    return render_template('index.html', grid_size = 5)

if __name__ == '__main__':
    app.run(debug=True)
