import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Adjust path based on your structure
import './MyWork.css';
import styles from './GeneratePPT.module.css'; // Reuse sidebar styles

const MyWork = () => {
  const [presentations, setPresentations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  useEffect(() => {
    const fetchPresentations = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication token not found. Redirecting to login...');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/presentations/my-work/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          setError('Unauthorized. Your session may have expired. Redirecting to login...');
          localStorage.removeItem('authToken');
          setIsLoading(false);
          setTimeout(() => navigate('/login'), 2500);
          return;
        } else if (!response.ok) {
          let errorData = { message: `HTTP error! Status: ${response.status}` };
          try {
            const parsedError = await response.json();
            errorData.message = parsedError.detail || parsedError.message || errorData.message;
          } catch (e) {
            console.warn("Could not parse error response as JSON", e);
          }
          throw new Error(errorData.message);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setPresentations(data);
        } else {
          setError("Received invalid data format from server for presentations.");
          setPresentations([]);
        }

      } catch (err) {
        console.error("Fetch error in MyWork:", err);
        setError(err.message || 'An unexpected error occurred while fetching presentations.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresentations();
  }, [navigate]);

  if (isLoading) {
    return <div className="mywork-container mywork-loading">Loading presentations...</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="mywork-container" style={{ flex: 1 }}>
      
        <h2>Your personal hub for all generated decks, keeping your work easy to find, easy to <b> Download</b>, and ready when you are.</h2>
        {error && (
          <div className="mywork-error-container">
            <p className="mywork-error-message">Error fetching presentations: {error}</p>
            <button onClick={() => navigate('/generate')} className="mywork-action-button">
              Go to Generate Page
            </button>
          </div>
        )}
        {!error && presentations.length === 0 && (
          <div className="mywork-empty">
            <p>You haven't created any presentations yet.</p>
            <button onClick={() => navigate('/generate')} className="mywork-action-button">
              Create your first presentation
            </button>
          </div>
        )}
        {!error && presentations.length > 0 && (
          <div className="mywork-grid">
            {presentations.map((ppt) => (
              <div key={ppt.id || ppt.filename} className="mywork-card">
                {ppt.preview_image_url ? (
                  <img
                    src={`http://127.0.0.1:8000${ppt.preview_image_url}`}
                    alt={`Preview of ${ppt.topic}`}
                    className="mywork-preview-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder?.classList.contains('mywork-preview-placeholder-dynamic')) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <div className="mywork-preview-placeholder"><span>No Preview</span></div>
                )}
                {ppt.preview_image_url && (
                  <div className="mywork-preview-placeholder mywork-preview-placeholder-dynamic" style={{ display: 'none' }}>
                    <span>Preview Error</span>
                  </div>
                )}
                <div className="mywork-card-content">
                  <h3 title={ppt.topic}>{ppt.topic}</h3>
                  <p className="mywork-filename" title={ppt.filename}>📄 {ppt.filename}</p>
                  <p className="mywork-created-date">🗓️ Created: {formatDate(ppt.created_at)}</p>
                  <a
                    href={`http://127.0.0.1:8000${ppt.pptx_download_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mywork-download-button"
                    download={ppt.filename}
                  >
                    Download PPTX
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWork;
