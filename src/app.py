
# TUTORIAL Len Feremans, Sandy Moens and Joey De Pauw
# see tutor https://code.tutsplus.com/tutorials/creating-a-web-app-from-scratch-using-python-flask-and-mysql--cms-22972
from flask import Flask, render_template, request, redirect, url_for, flash
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from passlib.hash import sha256_crypt


engine = create_engine("postgresql://said2@localHost:5432/postgres")
db = scoped_session(sessionmaker(bind=engine))




from config import config_data
from quote_data_access import Quote, DBConnection, QuoteDataAccess

# INITIALIZE SINGLETON SERVICES
app = Flask('Tutorial ')
app.secret_key = '*^*(*&)(*)(*afafafaSDD47j\3yX R~X@H!jmM]Lwf/,?KT'
app_data = dict()
app_data['app_name'] = config_data['app_name']

# connection = DBConnection(dbname=config_data['dbname'], dbuser=config_data['dbuser'])
# quote_data_access = QuoteDataAccess(connection)

DEBUG = False
HOST = "127.0.0.1" if DEBUG else "0.0.0.0"


# REST API
# See https://www.ibm.com/developerworks/library/ws-restful/index.html
# @app.route('/quotes', methods=['GET'])
# def get_quotes():
#     # Lookup row in table Quote, e.g. 'SELECT ID,TEXT FROM Quote'
#     quote_objects = quote_data_access.get_quotes()
#     # Translate to json
#     return jsonify([obj.to_dct() for obj in quote_objects])
#
#
# @app.route('/quotes/<int:id>', methods=['GET'])
# def get_quote(id):
#     # ID of quote must be passed as parameter, e.g. http://localhost:5000/quotes?id=101
#     # Lookup row in table Quote, e.g. 'SELECT ID,TEXT FROM Quote WHERE ID=?' and ?=101
#     quote_obj = quote_data_access.get_quote(id)
#     return jsonify(quote_obj.to_dct())
#
#
# # To create resource use HTTP POST
# @app.route('/quotes', methods=['POST'])
# def add_quote():
#     # Text value of <input type="text" id="text"> was posted by form.submit
#     quote_text = request.form.get('text')
#     quote_author = request.form.get('author')
#     # Insert this value into table Quote(ID,TEXT)
#     quote_obj = Quote(iden=None, text=quote_text, author=quote_author)
#     print('Adding {}'.format(quote_obj.to_dct()))
#     quote_obj = quote_data_access.add_quote(quote_obj)
#     return jsonify(quote_obj.to_dct())


# VIEW
@app.route("/")
def main():
    return render_template('home.html', app_data=app_data)

@app.route("/Contact")
def contact():
    return render_template('contact.html', app_data=app_data)

@app.route("/Sign_In")
def sign_in():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        usernamedata = db.execute("SELECT username FROM users WHERE username =:username", {"username":username}).fetchone()
        passworddata = db.execute("SELECT password FROM users WHERE username =:username", {"username":username}).fetchone()
        if usernamedata is None:
            flash("No username", "danger")
            return render_template('Sign_In.html')
        elif passworddata is None:
            flash("No password", "danger")
            return render_template('Sign_In.html')
        else:
            for passwor_data in passworddata:
                if sha256_crypt.verify(password,passwor_data):
                    session = True
                    flash("You are now logged in!!", "success")
                    return redirect(url_for('main'))
                else:
                    flash("incorrect password", "danger")
                    return render_template('Sign_In.html')

    return render_template('Sign_In.html', app_data=app_data)

@app.route("/InputParameters", methods=["GET", "POST"])
def input():

    return render_template('InputPage.html', app_data=app_data)


@app.route("/Sign_Up", methods=["GET", "POST"])
def sign_up():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        rewrite_password = request.form.get('rewrite_password')
        usernamedata = db.execute("SELECT username FROM users WHERE username =:username", {"username":username}).fetchone()
        if usernamedata == None:
            if password == rewrite_password:
                db.execute("INSERT INTO users(name,username,password) VALUES(:name,:username,:password)",
                {"username":username,"password":password, "email":email})
                db.commit()
                flash("You are registered and can now login", "success")
                return redirect(url_for('sign_in'))
            else:
                flash("password does not match", "danger")
                return redirect(url_for('sign_up'))
        else:
            flash("user already existed, please login or contact admin", "danger")
            return redirect(url_for('sign_in'))
    return render_template('Sign_Up.html', app_data=app_data)

@app.route("/UserAccount")
def useracc():
    return render_template('UserAccount.html', app_data=app_data)

@app.route("/AdminAccount")
def adminacc():
    return render_template('AdminAccount.html', app_data=app_data)

# @app.route("/show_quotes")
# def show_quotes():
#     # quote_objects = quote_data_access.get_quotes()
#     # Render quote_objects "server-side" using Jinja 2 template system
#     return render_template('quotes.html', app_data=app_data, quote_objects=quote_objects)


# @app.route("/show_quotes_ajax")
# def show_quotes_ajax():
#     # Render quote_objects "server-side" using Jinja 2 template system
#     return render_template('quotes_ajax.html', app_data=app_data)
#
#
# @app.route("/test")
# def test():
#     return render_template('test.html', app_data=app_data)


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
