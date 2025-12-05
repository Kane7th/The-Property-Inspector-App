from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Inspection, InspectionPhoto
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import requests

inspections_bp = Blueprint("inspections", __name__, url_prefix="/inspections")


@inspections_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_inspection(id):
    user_id = int(get_jwt_identity())
    inspection = Inspection.query.get_or_404(id)

    if inspection.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    photos = InspectionPhoto.query.filter_by(inspection_id=id).all()
    photo_urls = [p.url for p in photos if p.url]

    return jsonify({
        "id": inspection.id,
        "address": inspection.address,
        "notes": inspection.notes,
        "photos": photo_urls
    })


@inspections_bp.route("", methods=["GET"])
@jwt_required()
def list_inspections():
    user_id = int(get_jwt_identity())
    inspections = Inspection.query.filter_by(user_id=user_id).all()
    data = []
    for i in inspections:
        photos = InspectionPhoto.query.filter_by(inspection_id=i.id).all()
        photo_data = [{"url": p.url, "label": p.label} for p in photos if p.url]
        data.append({
            "id": i.id,
            "address": i.address,
            "notes": i.notes,
            "photos": photo_data
        })
    return jsonify(data)


@inspections_bp.route("/create", methods=["POST"])
@jwt_required()
def create_inspection():
    user_id = int(get_jwt_identity())
    data = request.json
    address = data.get("address")
    notes = data.get("notes")
    if not address:
        return jsonify({"msg": "Address is required"}), 400

    inspection = Inspection(address=address, notes=notes, user_id=user_id)
    db.session.add(inspection)
    db.session.commit()
    return jsonify({"inspection_id": inspection.id})


@inspections_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_inspection(id):
    user_id = int(get_jwt_identity())
    inspection = Inspection.query.get_or_404(id)

    if inspection.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.json
    inspection.address = data.get("address", inspection.address)
    inspection.notes = data.get("notes", inspection.notes)
    db.session.commit()
    return jsonify({"msg": "Inspection updated"})


@inspections_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_inspection(id):
    user_id = int(get_jwt_identity())
    inspection = Inspection.query.get_or_404(id)

    if inspection.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    InspectionPhoto.query.filter_by(inspection_id=id).delete()
    db.session.delete(inspection)
    db.session.commit()
    return jsonify({"msg": "Inspection deleted"})


@inspections_bp.route("/upload-photo", methods=["POST"])
@jwt_required()
def upload_photo():
    data = request.json
    inspection_id = data.get("inspection_id")
    label = data.get("label")
    url = data.get("image_url")

    if not inspection_id or not url:
        return jsonify({"msg": "inspection_id and image_url are required"}), 400

    photo = InspectionPhoto(inspection_id=inspection_id, label=label, url=url)
    db.session.add(photo)
    db.session.commit()
    return jsonify({"msg": "Photo uploaded"})


@inspections_bp.route("/photos/<int:id>", methods=["PUT"])
@jwt_required()
def update_photo(id):
    photo = InspectionPhoto.query.get_or_404(id)
    user_id = int(get_jwt_identity())
    if photo.inspection.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.json
    photo.label = data.get("label", photo.label)
    photo.url = data.get("url", photo.url)
    db.session.commit()
    return jsonify({"msg": "Photo updated"})


@inspections_bp.route("/photos/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_photo(id):
    photo = InspectionPhoto.query.get_or_404(id)
    user_id = int(get_jwt_identity())
    if photo.inspection.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    db.session.delete(photo)
    db.session.commit()
    return jsonify({"msg": "Photo deleted"})


@inspections_bp.route("/<int:id>/pdf", methods=["GET"])
@jwt_required()
def download_pdf(id):
    inspection = Inspection.query.get_or_404(id)
    photos = InspectionPhoto.query.filter_by(inspection_id=id).all()

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica", 12)
    c.drawString(50, 750, f"Inspection ID: {inspection.id}")
    c.drawString(50, 730, f"Address: {inspection.address or ''}")
    c.drawString(50, 710, f"Notes: {inspection.notes or ''}")

    y = 680
    for photo in photos:
        try:
            response = requests.get(photo.url)
            img = ImageReader(BytesIO(response.content))
            c.drawImage(img, 50, y - 100, width=200, height=100)
            if photo.label:
                c.drawString(260, y - 50, f"Label: {photo.label}")
            y -= 120
            if y < 50:  # new page if needed
                c.showPage()
                c.setFont("Helvetica", 12)
                y = 750
        except Exception:
            c.drawString(50, y, f"Failed to load image: {photo.url}")
            y -= 20

    c.showPage()
    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"inspection_{inspection.id}.pdf",
        mimetype="application/pdf"
    )
