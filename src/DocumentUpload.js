import React, { useState } from 'react';
import axios from 'axios';
import './DocumentUpload.css';

function DocumentUpload({ symptoms, setDiagnosis }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [diagnosis, setLocalDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setLocalDiagnosis('');
    setError('');

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setLocalDiagnosis('');

    const formData = new FormData();
    formData.append('file', file);
    if (symptoms) formData.append('symptoms', symptoms);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not authenticated. Please log in.');
      }

      const response = await axios.post('http://localhost:3001/upload-document', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setLocalDiagnosis(response.data.diagnosis);
      setDiagnosis(response.data.diagnosis); // Pass the diagnosis to the parent component
    } catch (error) {
      console.error('Upload failed', error);
      setError(error.response?.data?.error || error.message || 'Failed to process document. Please try again or consult a doctor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="document-upload">
      <h2>Upload Medical Documents</h2>
      {symptoms && <p>Analyzing based on symptoms: <strong>{symptoms}</strong></p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file">Upload PDF, Word Document, or Image (e.g., X-ray, Report):</label>
          <input
            type="file"
            id="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            required
          />
        </div>
        {preview && (
          <div className="image-preview">
            <p>Preview (Image Only):</p>
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Analyze Document'}
        </button>
        {error && <p className="error">{error}</p>}
        {diagnosis && (
          <div className="diagnosis">
            <h3>Preliminary Report:</h3>
            <p>{diagnosis}</p>
            <p className="disclaimer">
              *This is a preliminary analysis by AI and not a substitute for professional medical advice. Consult a doctor.
            </p>
          </div>
        )}
      </form>
    </section>
  );
}

export default DocumentUpload;