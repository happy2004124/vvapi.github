from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import pymysql

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] ='mysql+pymysql://root:123456@localhost/game_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    scores = db.relationship('Score', backref='player', lazy='dynamic')


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)


@app.before_first_request
def create_tables():
    db.create_all()


@app.route('/')
def index():
    return 'Welcome to the game!'


@app.route('/players', methods=['POST'])
def add_player():
    data = request.json
    existing_player = Player.query.filter_by(name=data['name']).first()
    if existing_player:
        return jsonify({'id': existing_player.id,'message': 'Player found'}), 200
    new_player = Player(name=data['name'])
    db.session.add(new_player)
    db.session.commit()
    return jsonify({'id': new_player.id,'message': 'Player added successfully'}), 201


@app.route('/players/<int:player_id>/scores', methods=['POST'])
def add_score(player_id):
    data = request.json
    new_score = Score(player_id=player_id, score=data['score'])
    db.session.add(new_score)
    db.session.commit()
    return jsonify({'message': 'Score added successfully'}), 201


@app.route('/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    result = []
    for player in players:
        scores = [{"score": score.score} for score in player.scores.all()]
        result.append({'name': player.name,'scores': scores})
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)