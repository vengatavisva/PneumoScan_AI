import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="container about-container">
      <div className="about-header text-center">
        <h1>Understanding Pneumonia & AI Diagnostics</h1>
        <p>How AETL_PXNet revolutionizes continuous pulmonary care.</p>
      </div>

      <div className="about-content">
        <section className="glass-panel info-card">
          <h2>What is Pneumonia?</h2>
          <p>
            Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus (purulent material), causing cough with phlegm or pus, fever, chills, and difficulty breathing. A variety of organisms, including bacteria, viruses and fungi, can cause pneumonia.
          </p>
          <p>
            It is a serious condition that can range in seriousness from mild to life-threatening. It is most serious for infants and young children, people older than age 65, and people with health problems or weakened immune systems.
          </p>

          <h3>Common Symptoms:</h3>
          <ul className="symptom-list">
            <li>Chest pain when you breathe or cough</li>
            <li>Confusion or changes in mental awareness (in adults age 65 and older)</li>
            <li>Cough, which may produce phlegm</li>
            <li>Fatigue and feeling generally unwell</li>
            <li>Fever, sweating and shaking chills</li>
            <li>Lower than normal body temperature (in people older than age 65 and people with weak immune systems)</li>
            <li>Nausea, vomiting or diarrhea</li>
            <li>Shortness of breath</li>
          </ul>
        </section>

        <section className="glass-panel info-card">
          <h2>How Our AI Model Works</h2>
          <p>
            <strong>AETL_PXNet</strong> stands for Augmented Ensemble Transfer Learning Pneumonia X-Ray Network. 
            The system combines multiple state-of-the-art Deep Learning technologies to assist medical professionals in rapid diagnosis.
          </p>

          <div className="tech-grid">
            <div className="tech-item">
              <h4>Ensemble Transfer Learning</h4>
              <p>We combine the "brains" of two highly advanced vision models: <strong>ResNet50</strong> and <strong>EfficientNetB0</strong>. By pooling their features, the AI can detect patterns a single model might miss.</p>
            </div>
            
            <div className="tech-item">
              <h4>Squeeze-and-Excitation (SE) Networks</h4>
              <p>Our custom SE block acts as an "attention mechanism". Instead of looking at the whole X-ray equally, it teaches the AI to focus heavily on the lungs and ignore irrelevant background noise like bones or edges.</p>
            </div>

            <div className="tech-item">
              <h4>Grad-CAM Explainability</h4>
              <p>To build trust with doctors, the AI isn't simply a "black box". The <strong>Grad-CAM</strong> technology traces the AI's neural pathways backward to generate a visual heatmap, explicitly highlighting the exact regions of the lungs that look infected.</p>
            </div>
          </div>
        </section>

        <section className="glass-panel info-card text-center">
          <h2>Medical Disclaimer</h2>
          <p className="disclaimer-text">
            This artificial intelligence tool is developed for supplementary screening and educational purposes. 
            It is <strong>not a replacement</strong> for a professional medical diagnosis by a certified radiologist or physician. 
            If you suspect you have pneumonia or are experiencing severe respiratory distress, seek immediate emergency medical care.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
