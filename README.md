# Cloud-Based Smart Classroom Attendance System: A Web-Native Biometric Solution for Dense Environments

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![InsightFace](https://img.shields.io/badge/InsightFace-RetinaFace%20%2B%20ArcFace-FF6F00?style=flat)](https://github.com/deepinsight/insightface)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Team No. 13** | Department of Computer Science & Engineering | MIT VPU

---

## 📌 Project Overview

Traditional attendance tracking in university classrooms via manual roll calls or paper sign-in sheets is labor-intensive, error-prone, and steals 5–10 minutes of valuable instructional time every lecture. Native mobile attendance apps enforce friction through mandatory app store downloads, permissions, and OS fragmentation, while basic computer vision models (such as Haar cascades or generic object detectors) suffer from catastrophic detection failures when confronted with small, distant, tilted, or partially occluded faces in crowded lecture halls.

This project delivers a **zero-friction, web-native biometric attendance platform** engineered specifically for high-density academic environments:
- **Zero App Installation:** Faculty and instructors open a secure web app directly in any browser.
- **Dense Facial Localization:** Integrates **RetinaFace** for high-precision detection of dense, small, and occluded faces with 5-point facial landmark alignment.
- **Robust Biometric Identification:** Utilizes **ArcFace** generating 512-dimensional facial embeddings matched via Cosine Similarity against enrolled student profiles.
- **Automated Workflow:** Verifies attendance and automatically outputs structured Excel (`.xlsx`) records within seconds.

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    A[Instructor Device / Browser] -->|HTML5 MediaCapture API| B[Web Frontend]
    B -->|Canvas toBlob / FormData| C[FastAPI Backend]
    C -->|cv2.imdecode / NumPy| D[RetinaFace Detector]
    D -->|Face Crops & Landmarks| E[ArcFace Embeddings 512-D]
    E -->|Cosine Similarity Matrix| F[(Database / Embeddings Store)]
    F -->|Match Results| G[Attendance Log]
    G -->|Pandas Engine| H[Excel .xlsx Report & Email]
```

---

## 🗂️ Project Directory Structure

```
Biometric Solution for Dense Environment/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # REST endpoints (/health, /attendance/verify, /students/enroll)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── detector.py         # RetinaFace face detection and alignment
│   │   │   ├── recognizer.py       # ArcFace embedding extraction & vector matching
│   │   │   └── report.py           # Attendance aggregation & Excel export
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── db.py               # Database connections (SQLite / MySQL)
│   │   │   └── models.py           # Student & Attendance schemas
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   └── image_processing.py # Image decoding and validation
│   │   ├── config.py               # Global settings, similarity threshold, paths
│   │   └── main.py                 # FastAPI application & CORS initialization
│   └── run.py                      # Development server runner (Uvicorn)
├── frontend/
│   ├── css/
│   │   └── styles.css              # Responsive, mobile-first styling
│   ├── js/
│   │   ├── camera.js               # WebRTC getUserMedia rear camera stream handler
│   │   └── app.js                  # Canvas capture, API submission, and result modal
│   └── index.html                  # Instructor camera capture interface
├── docs/                           # Project requirements, learning path, and roadmap
│   ├── A Web-Native Biometric Solution for Dense Environments.docx
│   ├── Web Attendance System Learning Path.docx
│   └── week-by-week schedule .docx
├── data/
│   ├── embeddings/                 # Stored biometric vector embeddings (.npy)
│   └── reports/                    # Generated attendance reports (.xlsx)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS Flexbox, JavaScript ES6+ | Browser-based UI, WebRTC `MediaDevices.getUserMedia()` |
| **Backend** | Python 3.9+, FastAPI, Uvicorn | High-performance asynchronous REST API with CORS support |
| **Computer Vision** | OpenCV, InsightFace, NumPy | Image decoding, matrix manipulation, bounding box rendering |
| **Face Detection** | RetinaFace | State-of-the-art dense face localization & 5-point landmark alignment |
| **Face Recognition**| ArcFace | Deep angular margin loss generating 512-D discriminative vectors |
| **Data & Storage** | SQLite / MySQL, Pandas, OpenPyXL | Student metadata, vector storage, and automated Excel reporting |

---

## 🚀 Quick Start & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/JULY-18/Biometric-Solution-for-Dense-Environment.git
cd "Biometric-Solution-for-Dense-Environment"
```

### 2. Backend Setup
```bash
# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the FastAPI backend
python backend/run.py
```
The API server will run at `http://localhost:8000`. You can test interactive API docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
Because modern browsers require a secure context (`HTTPS` or `localhost`) to access camera hardware:
```bash
# In a new terminal, serve the frontend:
cd frontend
python3 -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

---

## 👥 Team Members (Team 13)

| Name | SRN | Email |
| :--- | :--- | :--- |
| **Rayyan Shaikh** | SCFU424020 | SCFU4240020@mitvpu.ac.in |
| **Ruhsikesh Shinde** | SCFU424049 | SCFU4240049@mitvpu.ac.in |
| **Yogesh Narayankar** | SCFU424066 | SCFU4240066@mitvpu.ac.in |

---

## 📄 License
This project is developed for academic and educational purposes under the MIT License.
