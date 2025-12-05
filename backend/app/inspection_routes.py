from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .extensions import db
from .models import Inspection, InspectionPhoto, User
from .utils import upload_to_cloudinary, generate_pdf


inspection_bp = Blueprint('inspection', __name__)


@inspection_bp.post('/create')
@jwt_required()
def create_inspection():
    data = request.json
    user_id = int(get_jwt_identity())


    new = Inspection(
        user_id=user_id,
        address=data.get('address'),
        notes=data.get('notes')
    )


    db.session.add(new)
    db.session.commit()


    return jsonify({'inspection_id': new.id})


@inspection_bp.post('/upload-photo')
@jwt_required()
def upload_photo():
    inspection_id = request.form.get('inspection_id')
    file = request.files['file']
    label = request.form.get('label')


    url = upload_to_cloudinary(file)


    photo = InspectionPhoto(
        inspection_id=inspection_id,
        url=url,
        label=label
    )
    db.session.add(photo)
    db.session.commit()


    return jsonify({'url': url})


@inspection_bp.get('/generate-pdf/<int:id>')
@jwt_required()
def generate(id):
    inspection = Inspection.query.get_or_404(id)
    photos = InspectionPhoto.query.filter_by(inspection_id=id).all()


    file_path = generate_pdf(inspection, photos)


    return send_file(file_path, download_name=f"inspection_{id}.pdf", as_attachment=True)