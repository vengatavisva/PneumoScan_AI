import os
import base64
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

from model import build_aetl_pxnet
from gradcam import get_gradcam

# Globals
ai_model = None
LAST_CONV_LAYER = "conv5_block3_out"

# Startup and shutdown context
@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_model
    print("Loading AETL_PXNet model weights...")
    ai_model = build_aetl_pxnet()
    weight_path = "aetl_pxnet.weights.h5"
    if os.path.exists(weight_path):
        ai_model.load_weights(weight_path)
        print("Model loaded successfully.")
    else:
        print(f"ERROR: {weight_path} not found!")
    yield
    print("Shutting down API...")

app = FastAPI(title="AETL_PXNet API", lifespan=lifespan)

# Allow CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def encode_image_base64(img_array):
    _, buffer = cv2.imencode('.jpg', img_array)
    return base64.b64encode(buffer).decode('utf-8')

def generate_medical_report(prediction, confidence):
    conf_pct = round(confidence * 100, 2)
    if prediction == "NORMAL":
        return {
            "severity": "None. The lungs appear clear and healthy.",
            "condition_explanation": "No significant signs of pneumonia, fluid buildup, or anomalous infection regions were detected by the AI in the provided chest X-ray.",
            "treatment_recommendations": "No specific medical treatment required for pneumonia. Maintain a healthy lifestyle. If you are experiencing symptoms like persistent cough or shortness of breath, consult a physician for other potential causes."
        }
    else:
        # PNEUMONIA Cases
        severity = "High Severity" if conf_pct > 95 else ("Moderate Severity" if conf_pct > 80 else "Low/Developing Severity")
        
        condition = f"The AI model strongly indicates the presence of Pneumonia (Confidence: {conf_pct}%). The highlighted regions in the Grad-CAM image show the inflamed air sacs (alveoli) which may be filling with fluid or pus, causing the opacity visible in the X-ray."
        
        treatment = (
            "1. <strong>Consult a Doctor Immediately</strong>: A professional medical diagnosis is required to confirm the AI prediction.\n"
            "2. <strong>Antibiotics/Antivirals</strong>: Depending on whether the pneumonia is bacterial or viral, your doctor will prescribe appropriate medication.\n"
            "3. <strong>Rest & Hydration</strong>: Crucial for immune system recovery.\n"
            "4. <strong>Follow-up Imaging</strong>: Additional chest X-rays may be needed to track clearing of the lungs."
        )
        
        return {
            "severity": severity,
            "condition_explanation": condition,
            "treatment_recommendations": treatment
        }

@app.post("/api/predict")
async def predict_xray(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"error": "Invalid image format"}

    # Preprocess image
    img_resized = cv2.resize(img, (224, 224))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_array = np.expand_dims(img_rgb / 255.0, axis=0)

    # 1. Prediction
    predictions = ai_model.predict(img_array)
    class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][class_idx])
    
    classes = ["NORMAL", "PNEUMONIA"]
    predicted_class = classes[class_idx]

    # 2. Grad-CAM
    heatmap = get_gradcam(img_array, ai_model, LAST_CONV_LAYER)
    
    # Overlay heatmap
    heatmap_resized = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap_colored = np.uint8(255 * heatmap_resized)
    heatmap_mapped = cv2.applyColorMap(heatmap_colored, cv2.COLORMAP_JET)
    
    # 3. Create the final overlaid image
    overlay = cv2.addWeighted(img, 0.6, heatmap_mapped, 0.4, 0)
    
    # Base64 encode images
    original_b64 = encode_image_base64(img)
    gradcam_b64 = encode_image_base64(overlay)

    # Generate Report
    report = generate_medical_report(predicted_class, confidence)

    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "severity": report["severity"],
        "condition_explanation": report["condition_explanation"],
        "treatment_recommendations": report["treatment_recommendations"],
        "original_image": f"data:image/jpeg;base64,{original_b64}",
        "gradcam_image": f"data:image/jpeg;base64,{gradcam_b64}"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "model_loaded": ai_model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
