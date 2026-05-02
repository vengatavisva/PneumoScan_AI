# PneumoScan AI (formerly AETL_PXNet)

A full-stack AI diagnostic web application for automated Pneumonia detection from Chest X-rays.

This project utilizes an **Augmented Ensemble Transfer Learning** model that combines the strengths of **ResNet50** and **EfficientNetB0**, enhanced with **Squeeze-and-Excitation (SE) attention blocks**. It provides real-time diagnostic inferences, confidence scoring, severity assessments, and treatment recommendations.

Crucially, the system features **Grad-CAM explainability**, which generates heatmap overlays on the X-rays, providing transparent, visual evidence of the regions the AI analyzed to make its prediction. This ensures the tool is trustworthy for clinical review.

## 🚀 Features

*   **Ensemble AI Model**: High-accuracy Transfer Learning architecture.
*   **Explainable AI (XAI)**: Grad-CAM attention heatmaps for visual transparency.
*   **Clinical Dashboard**: A premium, responsive React (Vite) frontend with a sleek Charcoal & Teal medical design.
*   **High-Performance API**: A fast, asynchronous Python backend powered by FastAPI and Uvicorn.
*   **Automated Medical Reports**: Generates intelligent severity assessments and actionable treatment recommendations based on the AI's confidence levels.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, CSS3 (Custom Properties & Animations), Lucide Icons
*   **Backend**: Python 3.11, FastAPI, Uvicorn, Python-Multipart
*   **Machine Learning**: TensorFlow / Keras, OpenCV, NumPy, Scikit-learn
*   **Visualization**: Matplotlib

---

## 💻 How to Run Locally

Because this project uses a decoupled architecture, you must run both the backend API and the frontend website simultaneously.

### 1. Setup & Run the Backend (FastAPI)

Open a terminal in the root directory and navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment (if you haven't already) and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
```

Start the API server:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
*Wait until you see "Model loaded successfully" and "Application startup complete". The backend runs on `http://localhost:8000`.*

### 2. Setup & Run the Frontend (React / Vite)

Open a **new** terminal tab in the root directory and navigate to the frontend folder:

```bash
cd frontend
```

Install the Node.js dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```
*The frontend will be available at `http://localhost:5173`. Open this link in your browser to access the dashboard.*

---

## 📦 Note on Model Weights

The pre-trained model weights file (`aetl_pxnet.weights.h5`) is approximately ~130MB. To comply with GitHub's standard file size limits, this file is excluded from version control via `.gitignore`. 

To run this project, ensure you place your `aetl_pxnet.weights.h5` file inside the `backend/` directory before starting the FastAPI server.

## 📄 License

This project is open-source and available under the MIT License.
