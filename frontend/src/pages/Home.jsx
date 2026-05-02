import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, FileWarning, ArrowRight, Loader, X, AlertTriangle, CheckCircle, Info, Stethoscope, Maximize2 } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please drop an image file (JPEG, PNG).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. Make sure the backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container home-container">
      <div className="hero-section">
        <h1 className="hero-title">AI-Powered Chest X-Ray Diagnosis</h1>
        <p className="hero-subtitle">
          Upload a chest X-ray image to detect Pneumonia instantly using our state-of-the-art Ensembled Transfer Learning model (PneumoScan AI) equipped with Grad-CAM explainability.
        </p>
      </div>

      <div className={`dashboard ${!result ? 'dashboard-centered' : 'dashboard-split'}`}>
        <div className="upload-card glass-panel flex-card">
          <div className="card-header">
            <h2>Diagnostic Input</h2>
            <p>Select or drag & drop a secure X-ray scan</p>
          </div>
          
          <div 
            className={`dropzone ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{display: 'none'}} 
            />
            
            {!selectedFile ? (
              <div className="dropzone-content">
                <UploadCloud size={48} color="var(--primary)" />
                <h3>Upload X-Ray</h3>
                <p>Drag and drop or click to browse</p>
              </div>
            ) : (
              <div className="preview-container">
                <img src={previewUrl} alt="X-Ray Preview" className="img-preview" />
                <div className="file-info">
                  <FileImage size={24} color="var(--primary)" />
                  <span>{selectedFile.name}</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <FileWarning size={20} />
              {error}
            </div>
          )}

          <div className="action-row">
            {selectedFile && (
              <button 
                className="btn btn-outline btn-clear" 
                onClick={clearSelection}
                disabled={loading}
              >
                Clear
              </button>
            )}
            
            <button 
              className="btn btn-primary btn-analyze" 
              disabled={!selectedFile || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <Loader className="spin" size={20} /> Analyzing...
                </>
              ) : (
                <>
                  Analyze Image <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="results-card glass-panel fade-in slide-in">
            <div className="results-header">
              <h2>Diagnostic Results</h2>
              <div className={`badge ${result.prediction === 'NORMAL' ? 'badge-safe' : 'badge-alert'} result-badge`}>
                {result.prediction === 'NORMAL' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                {result.prediction}
              </div>
            </div>

            <div className="confidence-meter">
              <div className="meter-label">
                <span>AI Confidence Score</span>
                <span style={{fontWeight: 700}}>{(result.confidence * 100).toFixed(2)}%</span>
              </div>
              <div className="meter-bar-track">
                <div 
                  className={`meter-bar-fill ${result.prediction === 'PNEUMONIA' ? 'fill-alert' : 'fill-safe'}`} 
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="image-comparison">
              <div className="img-box group" onClick={() => setModalImage(result.original_image)}>
                <h4>Original X-Ray</h4>
                <div className="img-wrapper">
                  <img src={result.original_image} alt="Original" />
                  <div className="img-overlay"><Maximize2 color="white" size={32} /></div>
                </div>
              </div>
              <div className="img-box group" onClick={() => setModalImage(result.gradcam_image)}>
                <h4>Grad-CAM AI Attention</h4>
                <div className="img-wrapper">
                  <img src={result.gradcam_image} alt="Grad-CAM" />
                  <div className="img-overlay"><Maximize2 color="white" size={32} /></div>
                </div>
                <p className="img-caption">Highlighted regions indicate areas of interest for the AI prediction.</p>
              </div>
            </div>

            <div className="medical-report">
              <h3>Medical Assessment</h3>
              
              <div className={`report-card ${result.prediction === 'NORMAL' ? 'card-safe' : 'card-alert'}`}>
                <div className="report-card-header">
                  <AlertTriangle size={20} />
                  <h4>Severity / Status</h4>
                </div>
                <p><strong>{result.severity}</strong></p>
              </div>
              
              <div className="report-card card-neutral">
                <div className="report-card-header">
                  <Info size={20} />
                  <h4>Condition Explanation</h4>
                </div>
                <p>{result.condition_explanation}</p>
              </div>
              
              <div className="report-card card-primary">
                <div className="report-card-header">
                  <Stethoscope size={20} />
                  <h4>Recommendations</h4>
                </div>
                <div className="treatment-content" dangerouslySetInnerHTML={{__html: result.treatment_recommendations.replace(/\n/g, '<br/>')}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalImage(null)}>
              <X size={24} />
            </button>
            <img src={modalImage} alt="Expanded X-Ray" className="modal-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
