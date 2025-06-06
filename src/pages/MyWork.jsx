import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MyWork.css';

const MyWork = () => {
  const [presentations, setPresentations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pptToDelete, setPptToDelete] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const fetchPresentations = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Authentication token not found. Please log in again. Redirecting...');
      toast.error('Authentication token not found. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/presentations/my-work/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
        throw new Error(errorData.detail || `Error fetching presentations: ${res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setPresentations(data);
        setError(null);
      } else {
        throw new Error('Received unexpected data format from server.');
      }
    } catch (err) {
      console.error("Fetch presentations error:", err);
      setError(err.message || 'An unknown error occurred while fetching presentations.');
      toast.error(err.message || 'Could not fetch presentations.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (pptId) => {
    if (!pptId) {
      console.error("confirmDelete called with invalid pptId:", pptId);
      toast.error("Cannot delete: Presentation ID is missing.");
      return;
    }
    setPptToDelete(pptId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!pptToDelete) {
      toast.error("No presentation selected for deletion.");
      setShowConfirm(false);
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/presentations/${pptToDelete}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const successData = await res.json().catch(() => null);
        toast.success(successData?.message || "Presentation deleted successfully ✅");
        setPresentations(prev => prev.filter(p => p.id !== pptToDelete));
      } else {
        const errorData = await res.json().catch(() => ({ detail: "Failed to delete presentation. Server returned an error." }));
        toast.error(errorData.detail || `Failed to delete: ${res.statusText} ❌`);
        console.error("Delete failed with status:", res.status, "Response data:", errorData);
      }
    } catch (err) {
      toast.error("Delete operation failed ❗ Check network or server status.");
      console.error("Network or parsing error during delete:", err);
    } finally {
      setShowConfirm(false);
      setPptToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setPptToDelete(null);
  };

  const shareLink = (ppt) => {
    if (ppt && ppt.pptx_download_url) {
      if (ppt.pptx_download_url.startsWith('http')) {
        return ppt.pptx_download_url;
      }
      const backendPort = '8000';
      const baseUrl = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
      return `${baseUrl}${ppt.pptx_download_url}`;
    }
    toast.error("Download link for the presentation is not available.");
    return '';
  };

  const shareViaEmail = (ppt) => {
    const link = shareLink(ppt); 
    if (!link) return; 
    const subject = encodeURIComponent(`Check out this presentation: ${ppt.topic || 'Untitled Presentation'}`);
    const body = encodeURIComponent(`Hi,\n\nCheck out this presentation about "${ppt.topic || 'Untitled Presentation'}". You can download it here:\n${link}\n\nCheers!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsapp = (ppt) => { 
    const link = shareLink(ppt); 
    if (!link) return;
    const message = encodeURIComponent(`Check out this presentation: ${ppt.topic || 'Presentation'}\nDownload it here: ${link}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareViaTelegram = (ppt) => {
    const link = shareLink(ppt); 
    if (!link) return;
    const text = encodeURIComponent(`Check out this presentation: ${ppt.topic || 'Presentation'}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, "_blank");
  };

  useEffect(() => {
    fetchPresentations();
  }, []); 

  if (isLoading) return (
    <div className="mywork-page-layout">
      <Sidebar />
      <div className="mywork-container mywork-loading">Loading your brilliant decks... ⏳</div>
    </div>
  );

  return (
    <div className="mywork-page-layout">
      <Sidebar />
      <div className="mywork-container">
        <h2>Your generated decks. Download, delete or share effortlessly.</h2>

        {error && (
          <div className="mywork-error-container">
            <p className="mywork-error-message">⚠️ Error: {error}</p>
            <button onClick={fetchPresentations} className="mywork-action-button">Try Reloading</button>
            <button onClick={() => navigate('/generate')} className="mywork-action-button" style={{marginLeft: '10px'}}>Create New</button>
          </div>
        )}

        {!error && presentations.length === 0 && !isLoading && ( 
          <div className="mywork-empty">
            <p>Looks like you haven't created any presentations yet. Let's make some magic! ✨</p>
            <button onClick={() => navigate('/generate')} className="mywork-action-button">Create Your First Presentation</button>
          </div>
        )}

        {!error && presentations.length > 0 && (
          <div className="mywork-grid">
            {presentations.map((ppt) => (
              <div key={ppt.id || ppt.filename} className="mywork-card">
                {ppt.preview_image_url ? (
                  <img
                    src={ppt.preview_image_url.startsWith('http') ? ppt.preview_image_url : `http://127.0.0.1:8000${ppt.preview_image_url}`}
                    alt={`Preview of ${ppt.topic}`}
                    className="mywork-preview-image"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex';}}
                  />
                ) : null} 
                <div className="mywork-preview-placeholder" style={{display: ppt.preview_image_url ? 'none' : 'flex'}}>
                    <span>No Preview Available</span>
                </div>

                <div className="mywork-card-content">
                  <h3 title={ppt.topic}>{ppt.topic || "Untitled Presentation"}</h3>
                  <p className="mywork-filename" title={ppt.filename}>📄 {ppt.filename || "N/A"}</p>
                  <p className="mywork-created-date">🗓️ {formatDate(ppt.created_at)}</p>

                  <div className="mywork-button-row">
                    <a
                      href={shareLink(ppt)} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mywork-download-button"
                      download={ppt.filename || "presentation.pptx"} 
                    >
                      Download
                    </a>

                    <button className="mywork-delete-button" onClick={() => confirmDelete(ppt.id)}>Delete</button>
                  </div>

                  <div className="mywork-share-icons">
                    <button className="mywork-icon-button" onClick={() => shareViaEmail(ppt)} title="Share via Email">
                      <img src="/src/assets/mail.jpg" alt="Email" className="mywork-icon-img" />
                    </button>
                    <button className="mywork-icon-button" onClick={() => shareViaWhatsapp(ppt)} title="Share via Whatsapp">
                      <img src="/src/assets/whatsapp.jfif" alt="Whatsapp" className="mywork-icon-img" />
                    </button>
                    <button className="mywork-icon-button" onClick={() => shareViaTelegram(ppt)} title="Share via Telegram">
                      <img src="/src/assets/telegram.png" alt="Telegram" className="mywork-icon-img" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showConfirm && (
          <div className="confirm-modal">
            <div className="confirm-box">
              <p>Are you sure you want to delete this presentation?</p>
              <div className="modal-actions">
                <button className="mywork-action-button mywork-confirm-delete" onClick={handleDelete}>Yes, Delete</button>
                <button className="mywork-action-button mywork-cancel-delete" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </div>
  );
};

export default MyWork;
