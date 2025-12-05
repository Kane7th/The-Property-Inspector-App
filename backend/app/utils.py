import cloudinary
import cloudinary.uploader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import tempfile


from config import Config


cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET
)


def upload_to_cloudinary(file):
    return cloudinary.uploader.upload(file)['secure_url']




def generate_pdf(inspection, photos):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf = canvas.Canvas(tmp.name, pagesize=letter)


    pdf.setFont("Helvetica", 16)
    pdf.drawString(30, 750, f"Inspection Report: {inspection.address}")


    pdf.setFont("Helvetica", 12)
    pdf.drawString(30, 730, f"Notes: {inspection.notes}")


    pdf.drawString(30, 710, "Photos:")
    y = 690
    for p in photos:
        pdf.drawString(40, y, p.url)
        y -= 20


    pdf.save()
    return tmp.name