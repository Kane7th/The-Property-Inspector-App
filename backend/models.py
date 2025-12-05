from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)

class Inspection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text)
    image_url = db.Column(db.String(512))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class InspectionPhoto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('inspection.id'))
    label = db.Column(db.String(255))
    url = db.Column(db.String(512))
