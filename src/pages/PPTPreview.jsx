// PPTPreview.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './PPTPreview.module.css'; // You'll need to create this CSS file

const PPTPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [previewData, setPreviewData] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [loadingError, setLoadingError] = useState('');

    useEffect(() => {
        if (location.state && location.state.slide_image_urls && location.state.pptx_download_url) {
            setPreviewData(location.state);
            setCurrentSlideIndex(0); 
            // Check if preview generation specifically failed but pptx is fine
            if (location.state.slide_image_urls.length === 0 && location.state.total_slides === 0 && location.state.pptx_download_url) {
                 setLoadingError('Preview images could not be generated or the presentation has no slides. You can still download the PPTX file.');
            } else if (location.state.slide_image_urls.length === 0 && location.state.total_slides > 0) {
                 // This case implies an issue where slides were expected but no images came through
                 setLoadingError('Slide images are missing, though slides were expected in the presentation. Please try generating again or download the PPTX.');
            } else {
                setLoadingError(''); // Clear any previous errors if data is fine
            }
        } else {
            console.error("PPTPreview: No preview data found in location state.");
            navigate('/generate', { replace: true, state: { error: "No preview data available to display." } });
        }
    }, [location.state, navigate]);

    if (!previewData) {
        // This might be briefly shown while location.state is processed by useEffect
        return <div className={styles.loading}>Loading preview data...</div>;
    }

    // Destructure with defaults to prevent errors if some fields are unexpectedly missing
    const { 
        slide_image_urls = [], 
        pptx_download_url, 
        pptx_filename, 
        total_slides = 0, 
        topic,
        originalInputDetails, // Added for edit functionality
        actionChoice,         // Added for edit functionality
        numParagraphs,        // Added for edit functionality
        includeDateTime,      // Added for edit functionality
        updateDateTimeAutomatically, // Added for edit functionality
        fixedDateTime,        // Added for edit functionality
        includeSlideNumber,   // Added for edit functionality
        footerTextHF,         // Added for edit functionality
        dontShowOnTitleSlide, // Added for edit functionality
        selectedPredefinedTemplate, // Added for edit functionality
        customLogoFile        // Added for edit functionality
        // Note: customTemplateFile cannot be directly passed back as a File object through route state.
        // You might need to re-handle its selection or re-upload if editing.
    } = previewData;

    const handleNextSlide = () => {
        setCurrentSlideIndex(prevIndex => Math.min(prevIndex + 1, slide_image_urls.length - 1));
    };

    const handlePrevSlide = () => {
        setCurrentSlideIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const handleDownload = () => {
        if (!pptx_download_url) {
            setLoadingError("Download URL is missing. Cannot download PPTX.");
            return;
        }
        const link = document.createElement('a');
        // Assuming backend and frontend are on the same origin or CORS is handled
        link.href = `http://localhost:8000${pptx_download_url}`; 
        link.setAttribute('download', pptx_filename || 'presentation.pptx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };
    
    const handleGoBack = () => {
        navigate('/generate'); 
    };

    const handleEdit = () => {
        navigate('/generate', { 
            state: { 
                editMode: true, // Indicate that it's an edit session
                originalInputDetails, // Pass original input details
                actionChoice,         // Pass selected action
                numParagraphs,        // Pass number of paragraphs/slides
                currentSummaryTitle: topic, // Pass the current title
                includeDateTime,      // Pass header/footer settings
                updateDateTimeAutomatically, // Pass header/footer settings
                fixedDateTime,        // Pass header/footer settings
                includeSlideNumber,   // Pass header/footer settings
                footerTextHF,         // Pass header/footer settings
                dontShowOnTitleSlide, // Pass header/footer settings
                selectedPredefinedTemplate, // Pass selected template
                // customTemplateFile cannot be passed directly, user will need to re-upload if needed
                customLogoFile // Pass custom logo file (if string URL, otherwise handle re-upload)
            } 
        });
    };

    return (
        <div className={styles.previewContainer}>
            <div className={styles.previewHeader}>
                <h2>Preview: {topic || pptx_filename || "Presentation"}</h2>
                <div className={styles.headerActions}>
                    <button onClick={handleGoBack} className={styles.actionButtonSecondary}>
                        &larr; Back to Generate
                    </button>
                    <button onClick={handleEdit} className={styles.actionButtonSecondary}> {/* Added Edit button */}
                         Edit Options
                    </button>
                    {pptx_download_url && (
                        <button onClick={handleDownload} className={styles.actionButton}>
                             Download PPTX
                        </button>
                    )}
                </div>
            </div>

            {loadingError && <div className={styles.errorMessage}>{loadingError}</div>}

            {!loadingError && slide_image_urls.length > 0 ? (
                <div className={styles.slideViewer}>
                    <div className={styles.slideImageContainer}>
                        <img 
                            src={`http://localhost:8000${slide_image_urls[currentSlideIndex]}`} 
                            alt={`Slide ${currentSlideIndex + 1}`} 
                            className={styles.slideImage}
                            onError={(e) => {
                                e.target.alt = `Failed to load slide ${currentSlideIndex + 1}`;
                                e.target.src = ''; // Optional: replace with a placeholder image URL
                                console.error(`Error loading image: ${slide_image_urls[currentSlideIndex]}`);
                                setLoadingError(prev => prev ? `${prev}\nFailed to load image for slide ${currentSlideIndex + 1}.` : `Failed to load image for slide ${currentSlideIndex + 1}.`);
                            }}
                        />
                    </div>
                    <div className={styles.navigationControls}>
                        <button 
                            onClick={handlePrevSlide} 
                            disabled={currentSlideIndex === 0 || slide_image_urls.length === 0} 
                            className={styles.navButton}
                        >
                            Previous
                        </button>
                        <span>
                            Slide {slide_image_urls.length > 0 ? currentSlideIndex + 1 : 0} of {total_slides > 0 ? total_slides : slide_image_urls.length}
                        </span>
                        <button 
                            onClick={handleNextSlide} 
                            disabled={currentSlideIndex >= slide_image_urls.length - 1 || slide_image_urls.length === 0} 
                            className={styles.navButton}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                !loadingError && <div className={styles.noPreview}>No slides to display in preview. If you expected slides, the presentation might be empty or an error occurred during preview generation.</div>
            )}
        </div>
    );
};

export default PPTPreview;