# The Property Inspector App 🏠🔍

> Full‑stack property inspection app 
Bckend in Flask (Python) + frontend in React (Vite) with JWT auth, Cloudinary image upload, and PDF export.

## 🔎 What it does

The Property Inspector App allows users to:

* Register & login with email/password (JWT-based auth).
* Create new property inspections, save address + notes + photos.
* Upload photos to Cloudinary for storage.
* View a gallery of all inspections (address, notes, photos).
* Download each inspection as a PDF — including address, notes, and photos.
* Edit or delete existing inspections (CRUD) — only for the owner (JWT-protected).

It’s basically a lean MVP — perfect for property managers, inspectors, or landlords who want a simple way to log and export property inspections.

## 🛠️ Tech Stack

| Layer                  | Tech / Library                                                |
| ---------------------- | ------------------------------------------------------------- |
| Backend                | Flask, Flask‑JWT‑Extended, SQLAlchemy (SQLite)                |
| Image Upload & Storage | Cloudinary                                                    |
| PDF Generation         | ReportLab                                                     |
| Frontend               | React, Vite, Axios, React Router DOM                          |
| Dev / Build Tools      | Python (venv), Node.js/NPM, VSCode (or your preferred editor) |

## 🚀 Getting Started — Local Setup

### Prerequisites

* Python 3.x
* Node.js + npm
* Git

### Quick Start

From your terminal:

```bash
# Clone the repo
git clone https://github.com/Kane7th/The-Property-Inspector-App.git
cd The-Property-Inspector-App

# 1) Set up backend
cd backend
python -m venv venv
# On Windows
venv\\Scripts\\activate
# On Linux/macOS
# source venv/bin/activate
pip install -r requirements.txt  # (ensure you have a requirements file or install manually flask, flask_jwt_extended, sqlalchemy, reportlab, flask_cors, etc.)
python app.py
```

Backend should now run at `http://127.0.0.1:5000`.

In a separate terminal:

```bash
# 2) Set up frontend
cd ../frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173` (or as per Vite’s output) — that’s your frontend.

### Config

* Make sure your `.env` (or `.env.local`) contains your Cloudinary credentials:

  ```env
  VITE_CLOUDINARY_CLOUD=your_cloudinary_cloud_name
  VITE_CLOUDINARY_PRESET=your_upload_preset
  ```
* The backend uses a SQLite database by default (`database.db`) and JWT secret key is defined in code (for prod, you’ll want to move to environment variables).

## ✅ Features (What Works So Far)

* ✅ User registration & login with hashed password + JWT.
* ✅ Protected backend routes (only authenticated users can CRUD).
* ✅ Inspection CRUD: create, read (list), update, delete — for inspections.
* ✅ Photo upload via Cloudinary + storing URLs.
* ✅ Display photos in dashboard.
* ✅ PDF generation with inspection data + photos.
* ✅ JWT auth enforced for all relevant routes (inspections, uploads, PDF download).

## 📝 Project Structure (at a glance)

```
/backend          # Flask backend
  ├─ app.py       # App entry point
  ├─ auth.py      # Authentication routes
  ├─ inspections_bp.py  # Inspection CRUD & PDF generation
  ├─ models.py    # Data models (User, Inspection, Photo)
  └─ extensions.py  # DB and JWT initialization

/frontend         # React + Vite frontend
  ├─ src/
  │    ├─ pages/        # Login, Register, Dashboard, New/Edit Inspection
  │    ├─ api/          # Axios wrapper (auto‑attach JWT)
  │    └─ utils/        # auth utility functions (getToken, removeToken)
  └─ package.json
```

## 🧪 How to Use (Workflow)

1. Register a new user or login.
2. On dashboard: create a new inspection (address, notes, upload photo).
3. After saving — photo gets uploaded to Cloudinary, inspection record saved with photo URL.
4. Dashboard lists all inspections with photos preview.
5. Click “Download PDF” — gets a PDF with address, notes, and embedded photo(s).
6. Use “Edit” to modify address/notes/photos.
7. Use “Delete” to remove inspection (only your own).

## ✅ Roadmap / Next Steps

* ✨ Add user profile and multi‑user support (e.g. change email/password).
* 🗂️ Allow uploading multiple photos per inspection, with labels, and manage them (delete/update photos).
* 🧩 Add richer frontend UI (e.g. modal for add/edit, better styling).
* ☁️ Switch SQLite to more scalable DB (PostgreSQL).
* 🔐 Make configuration (JWT secret, DB URL, Cloudinary keys) environment-based — prepare for production.
* 📄 Add validation and error handling (e.g. validate inputs, better user feedback).
* 🧪 Add unit/integration tests (backend + frontend).
* 🚢 Add deployment workflow (e.g. Docker, CI/CD).

## 🤝 Contributing & Collaboration

Feel free to open issues or submit PRs — improvements to structure, validation, UI/UX, new features, bug‑fixes are welcome.

When contributing:

* Follow existing folder structure.
* Keep auth & security consistent.
* Maintain clear commit messages.

## ℹ️ Why This Project Exists

I built this as a **lightweight inspection management tool** — ideal for small‑scale landlords, property managers or contractors who want a simple web app to track property inspections with photos and downloadable PDF reports.

It’s also a learning project combining backend (Flask), frontend (React + Vite), JWT auth, cloud image storage, and PDF generation — good reference for anyone wanting to build a fullstack CRUD app with modern tooling.

---

If you use this or build on top of it — hit me up, would love to see what you build with it!
