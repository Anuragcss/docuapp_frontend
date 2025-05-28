// GeneratePPT.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GeneratePPT.module.css';

const GeneratePPT = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [originalInputDetails, setOriginalInputDetails] = useState(null);

    const [loading, setLoading] = useState(false);
    const [summaryOutput, setSummaryOutput] = useState({
        title: '',
        introduction: '',
        summaryText: '',
        conclusion: '',
    });
    const [showSummaryDisplay, setShowSummaryDisplay] = useState(false);
    const [showGeneratePPTFromSummaryButton, setShowGeneratePPTFromSummaryButton] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showPasteTextArea, setShowPasteTextArea] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);

    const [pastedText, setPastedText] = useState('');
    const [urlInput, setUrlInput] = useState('');

    const [actionChoice, setActionChoice] = useState(null);
    const [numParagraphs, setNumParagraphs] = useState(3);
    const [currentSummaryTitle, setCurrentSummaryTitle] = useState('');
    
    const [suggestedSectionsHint, setSuggestedSectionsHint] = useState(null);
    const [loadingHint, setLoadingHint] = useState(false);

    const [pptContentStyle, setPptContentStyle] = useState('paragraphs');
    const [summaryContentStyle, setSummaryContentStyle] = useState('paragraphs');

    const [includeDateTime, setIncludeDateTime] = useState(false);
    const [updateDateTimeAutomatically, setUpdateDateTimeAutomatically] = useState(true);
    const [fixedDateTime, setFixedDateTime] = useState('');
    const [includeSlideNumber, setIncludeSlideNumber] = useState(false);
    const [footerTextHF, setFooterTextHF] = useState('');
    const [dontShowOnTitleSlide, setDontShowOnTitleSlide] = useState(true);

    const [useDefaultTemplate, setUseDefaultTemplate] = useState(true);
    const [customTemplateFile, setCustomTemplateFile] = useState(null);

    const [showSummaryDownloadOptionsModal, setShowSummaryDownloadOptionsModal] = useState(false);
    const [summaryDownloadOptions, setSummaryDownloadOptions] = useState({
        footerText: '',
        includePageNumber: false,
        headerText: '',
        headerPosition: 'left',
    });

    const fileInputRef = useRef();
    const customTemplateInputRef = useRef();
    const navigate = useNavigate();

    const getCurrentDateInputFormat = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        setFixedDateTime(getCurrentDateInputFormat());
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const clearSummaryDisplay = () => {
        setSummaryOutput({ title: '', introduction: '', summaryText: '', conclusion: '' });
        setShowSummaryDisplay(false);
        setShowGeneratePPTFromSummaryButton(false);
    };

    const resetHeaderFooterState = () => {
        setIncludeDateTime(false);
        setUpdateDateTimeAutomatically(true);
        setFixedDateTime(getCurrentDateInputFormat());
        setIncludeSlideNumber(false);
        setFooterTextHF('');
        setDontShowOnTitleSlide(true);
    };

    const resetTemplateStates = () => {
        setUseDefaultTemplate(true);
        setCustomTemplateFile(null);
        if (customTemplateInputRef.current) {
            customTemplateInputRef.current.value = null;
        }
    };

    const resetSummaryDownloadOptions = () => {
        setSummaryDownloadOptions({
            footerText: '',
            includePageNumber: false,
            headerText: '',
            headerPosition: 'left',
        });
    };

    const resetAllStates = () => {
        setUploadedFiles([]);
        setOriginalInputDetails(null);
        setLoading(false);
        clearSummaryDisplay();
        setSuccessMessage('');
        setErrorMessage('');
        setShowModal(false);
        setShowPasteTextArea(false);
        setShowUrlInput(false);
        setPastedText('');
        setUrlInput('');
        setActionChoice(null);
        setNumParagraphs(3);
        setCurrentSummaryTitle('');
        setSuggestedSectionsHint(null);
        setLoadingHint(false);
        setPptContentStyle('paragraphs');
        setSummaryContentStyle('paragraphs');
        resetHeaderFooterState();
        resetTemplateStates();
        setShowSummaryDownloadOptionsModal(false);
        resetSummaryDownloadOptions();
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const processAndShowModal = (inputMeta) => {
        setOriginalInputDetails(inputMeta);
        setUploadedFiles(inputMeta.type === 'file' ? [inputMeta.fileObject] : []);

        setShowModal(true);
        setShowPasteTextArea(false);
        setShowUrlInput(false);
        setActionChoice(null);
        setSuggestedSectionsHint(null);
        setNumParagraphs(3);
        setSummaryContentStyle('paragraphs');
        resetHeaderFooterState();
        resetTemplateStates();
        clearSummaryDisplay();
        setErrorMessage('');
        setSuccessMessage('');
        setCurrentSummaryTitle(inputMeta.name === "Pasted Text" || inputMeta.name.startsWith("URL:") ? "" : inputMeta.name.split('.')[0]);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileMeta = {
                name: selectedFile.name,
                fileObject: selectedFile,
                type: 'file',
            };
            processAndShowModal(fileMeta);
        }
    };

    const handleSavePastedText = () => {
        if (pastedText.trim() === '') {
            setErrorMessage('Please enter some text to save.');
            return;
        }
        const textMeta = { name: "Pasted Text", content: pastedText, type: 'text' };
        processAndShowModal(textMeta);
        setShowPasteTextArea(false);
    };

    const handleFileUploadClick = () => {
        clearSummaryDisplay();
        setShowPasteTextArea(false);
        setShowUrlInput(false);
        resetTemplateStates();
        if (fileInputRef.current) fileInputRef.current.value = null;
        fileInputRef.current.click();
    };

    const handleURLImportClick = () => {
        resetAllStates();
        setShowUrlInput(true);
    };

    const handleTextImportClick = () => {
        resetAllStates();
        setShowPasteTextArea(true);
    };

    const handleCustomTemplateFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.potx') || file.name.endsWith('.pptx')) {
                setCustomTemplateFile(file);
                setUseDefaultTemplate(false);
                setErrorMessage('');
            } else {
                setErrorMessage('Invalid template file. Please select a .potx or .pptx file.');
                setCustomTemplateFile(null);
                if (customTemplateInputRef.current) {
                    customTemplateInputRef.current.value = null;
                }
            }
        } else {
            setCustomTemplateFile(null);
        }
    };


    const handleProcessURLInput = async () => {
        if (!urlInput.trim() || !urlInput.startsWith('http')) {
            setErrorMessage('Please enter a valid URL (e.g., https://example.com).');
            return;
        }
        if (!currentSummaryTitle.trim()) {
            setErrorMessage('Please enter a Title for the output.');
            return;
        }
        const urlMeta = { name: `URL: ${urlInput.substring(0, 50)}...`, url: urlInput, type: 'url' };
        setOriginalInputDetails(urlMeta); 
        setShowUrlInput(false);
        setShowModal(true);
        setActionChoice(null); 
        setSuggestedSectionsHint(null); 
        setNumParagraphs(3); 
    };


    const fetchContentMetrics = async () => {
        if (!originalInputDetails) return;
        setLoadingHint(true);
        setSuggestedSectionsHint(null); 

        const formData = new FormData();
        if (originalInputDetails.type === 'file' && originalInputDetails.fileObject) {
            formData.append("file", originalInputDetails.fileObject, originalInputDetails.name);
        } else if (originalInputDetails.type === 'text' && originalInputDetails.content) {
            formData.append("pasted_text", originalInputDetails.content);
        } else if (originalInputDetails.type === 'url' && originalInputDetails.url) {
            formData.append("url", originalInputDetails.url);
        } else {
            setLoadingHint(false);
            setSuggestedSectionsHint("N/A (no input)");
            return;
        }

        // ** START: ADDED AUTH TOKEN FOR CONTENT METRICS **
        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            setErrorMessage('Authentication token not found. Please log in.');
            setLoadingHint(false);
            return;
        }
        // ** END: ADDED AUTH TOKEN FOR CONTENT METRICS **


        try {
            const response = await fetch("http://localhost:8000/estimate-content-metrics/", {
                method: 'POST',
                headers: headers, // ** ADDED headers here **
                body: formData,
            });

            if (response.status === 401) {
                setErrorMessage('Unauthorized. Your session may have expired. Please log in again.');
                localStorage.removeItem('authToken');
                setLoadingHint(false);
                // Potentially navigate to login: navigate('/login');
                return;
            }

            const data = await response.json();
            if (response.ok && data.suggested_sections) {
                const suggestedContentSections = Number(data.suggested_sections);
                if (!isNaN(suggestedContentSections)) {
                    const totalEstimatedSlides = suggestedContentSections + 4; // Assuming 4 are fixed (title, intro, conclusion, thank you)
                    setSuggestedSectionsHint(totalEstimatedSlides); 
                    if (numParagraphs === 3) { // Only update if it's still the default
                        setNumParagraphs(Math.max(1, Math.min(15, suggestedContentSections)));
                    }
                } else {
                    setSuggestedSectionsHint("N/A (invalid AI suggestion)");
                }
            } else {
                setSuggestedSectionsHint(data.error || "N/A");
                console.error("Failed to fetch content metrics:", data.error || "Unknown error");
            }
        } catch (error) {
            setSuggestedSectionsHint("Error fetching hint");
            console.error("Error fetching content metrics:", error);
        } finally {
            setLoadingHint(false);
        }
    };

    useEffect(() => {
        if (actionChoice === 'ppt' && originalInputDetails && showModal) {
            const token = localStorage.getItem('authToken');
            if (token) { // Only fetch if token exists
                fetchContentMetrics();
            } else {
                setErrorMessage('Authentication token not found. Please log in to get slide estimations.');
                setSuggestedSectionsHint("Auth required for hint");
            }
        }
    }, [actionChoice, originalInputDetails, showModal]);


    const handlePrimaryAction = async () => {
        if (!originalInputDetails) {
            setErrorMessage("No content (file, text, or URL) provided or processed.");
            return;
        }
        if (!currentSummaryTitle.trim()) {
            setErrorMessage("Please enter a title for the output.");
            return;
        }
        if (!actionChoice) {
            setErrorMessage("Please select an action (Get Summary or Convert to PPT).");
            return;
        }

        // ** START: ADDED AUTH TOKEN RETRIEVAL AND CHECK **
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Not authenticated. Please log in to generate content.');
            setLoading(false);
            // Optionally, redirect to login or show login modal
            // navigate('/login'); 
            return;
        }
        // ** END: ADDED AUTH TOKEN RETRIEVAL AND CHECK **

        setLoading(true);
        clearSummaryDisplay();
        setSuccessMessage('');
        setErrorMessage('');

        const formData = new FormData();
        formData.append("topic", currentSummaryTitle);
        formData.append("mode", actionChoice);

        if (originalInputDetails.type === 'file' && originalInputDetails.fileObject) {
            formData.append("file", originalInputDetails.fileObject, originalInputDetails.name);
        } else if (originalInputDetails.type === 'text' && originalInputDetails.content) {
            formData.append("pasted_text", originalInputDetails.content);
        } else if (originalInputDetails.type === 'url' && originalInputDetails.url) {
            formData.append("url", originalInputDetails.url);
        } else {
            setErrorMessage("Invalid input data for processing.");
            setLoading(false);
            return;
        }

        formData.append("num_paragraphs", numParagraphs); 

        if (actionChoice === "ppt") {
            formData.append("ppt_content_style", pptContentStyle);
            formData.append("include_date_time", includeDateTime);
            formData.append("update_date_time_auto", updateDateTimeAutomatically);
            formData.append("fixed_date_time", fixedDateTime || getCurrentDateInputFormat());
            formData.append("include_slide_number", includeSlideNumber);
            formData.append("footer_text", footerTextHF);
            formData.append("dont_show_on_title", dontShowOnTitleSlide);
            formData.append("use_default_template", useDefaultTemplate && !customTemplateFile);
            if (customTemplateFile) {
                formData.append("custom_template_file", customTemplateFile, customTemplateFile.name);
            }
        } else if (actionChoice === "summary") {
            formData.append("summary_style", summaryContentStyle);
        }

        const apiUrl = "http://localhost:8000/generate-ppt/"; 

        try {
            // ** START: ADDED HEADERS WITH AUTH TOKEN **
            const headers = {
                'Authorization': `Bearer ${token}`,
                // FormData sets its own Content-Type, so don't manually set it here
            };
            const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: formData });
            // ** END: ADDED HEADERS WITH AUTH TOKEN **
            
            // ** START: ADDED 401 UNAUTHORIZED HANDLING **
            if (response.status === 401) {
                setErrorMessage('Unauthorized. Your session may have expired. Please log in again.');
                localStorage.removeItem('authToken'); // Clear expired token
                // Optionally, redirect to login or show login modal
                // navigate('/login'); 
                throw new Error('User not authenticated'); // Stop further processing
            }
            // ** END: ADDED 401 UNAUTHORIZED HANDLING **

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); 
                const errorMsg = errorData.error || errorData.detail || `Generation failed: ${response.status} ${response.statusText}`;
                throw new Error(errorMsg);
            }
            const responseData = await response.json();

            if (actionChoice === "ppt") {
                if (responseData.slide_image_urls && responseData.pptx_download_url) {
                    setSuccessMessage(responseData.message || "✅ PPT generated! Redirecting to preview...");
                    setShowModal(false); 
                    navigate('/preview-ppt', { 
                        state: { 
                            slide_image_urls: responseData.slide_image_urls,
                            pptx_download_url: responseData.pptx_download_url,
                            pptx_filename: responseData.pptx_filename,
                            total_slides: responseData.total_slides,
                            topic: currentSummaryTitle 
                        } 
                    });
                } else {
                     if (responseData.pptx_download_url) { // Preview failed, but PPTX available
                        setErrorMessage(responseData.message || 'PPT generated, but preview is unavailable. You can try downloading.');
                        const downloadUrl = `http://localhost:8000${responseData.pptx_download_url}`;
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.setAttribute('download', responseData.pptx_filename);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                        setSuccessMessage('PPT downloaded as preview was unavailable.');
                        setShowModal(false);
                    } else {
                        throw new Error(responseData.error ||'Server did not return valid data for PPT preview or download.');
                    }
                }
            } else { // actionChoice === "summary"
                setSummaryOutput({
                    title: responseData.topic || currentSummaryTitle,
                    introduction: responseData.introduction || '',
                    summaryText: responseData.summary_text || '',
                    conclusion: responseData.conclusion || '',
                });
                setShowSummaryDisplay(true);
                setSuccessMessage(responseData.message || "✅ Summary generated successfully!");
                setShowGeneratePPTFromSummaryButton(true);
                setShowModal(false);
            }
        } catch (err) {
            console.error("❌ Upload/Processing error:", err);
            // Avoid overwriting specific auth error message
            if (err.message !== 'User not authenticated') {
                setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
            }
            clearSummaryDisplay();
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePPTFromSummaryClick = () => {
        if (!originalInputDetails) {
            setErrorMessage("Original content details are missing. Please start over to generate PPT.");
            return;
        }
        const token = localStorage.getItem('authToken'); // Check token before showing modal
        if (!token) {
            setErrorMessage('Not authenticated. Please log in to generate a PPT from summary.');
            return;
        }
        setActionChoice("ppt"); 
        resetHeaderFooterState();
        resetTemplateStates();
        setShowModal(true);
        setShowSummaryDisplay(false);
        setShowGeneratePPTFromSummaryButton(false);
    };

    const handleDownloadSummaryClick = () => {
        if (!summaryOutput.title && !summaryOutput.summaryText) {
            setErrorMessage("No summary content to apply options to.");
            return;
        }
        resetSummaryDownloadOptions();
        setShowSummaryDownloadOptionsModal(true);
    };

    const handleConfirmSummaryDownload = async () => {
        if (!summaryOutput.title && !summaryOutput.summaryText) {
            setErrorMessage("No summary content to download.");
            return;
        }

        // ** START: ADDED AUTH TOKEN FOR SUMMARY DOWNLOAD **
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Not authenticated. Please log in to download the summary.');
            setLoading(false);
            return;
        }
        // ** END: ADDED AUTH TOKEN FOR SUMMARY DOWNLOAD **

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const payload = {
            summary_output: {
                title: summaryOutput.title,
                introduction: summaryOutput.introduction,
                summaryText: summaryOutput.summaryText,
                conclusion: summaryOutput.conclusion,
            },
            options: summaryDownloadOptions,
        };

        const apiUrl = "http://localhost:8000/generate-summary-docx/";

        try {
            // ** START: ADDED HEADERS WITH AUTH TOKEN FOR SUMMARY DOWNLOAD **
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
            });
            // ** END: ADDED HEADERS WITH AUTH TOKEN FOR SUMMARY DOWNLOAD **

            // ** START: ADDED 401 UNAUTHORIZED HANDLING FOR SUMMARY DOWNLOAD **
            if (response.status === 401) {
                setErrorMessage('Unauthorized. Your session may have expired. Please log in again.');
                localStorage.removeItem('authToken');
                throw new Error('User not authenticated for summary download');
            }
            // ** END: ADDED 401 UNAUTHORIZED HANDLING FOR SUMMARY DOWNLOAD **


            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error || errorData.detail || `Word document generation failed: ${response.status} ${response.statusText}`;
                throw new Error(errorMsg);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                const safeTitle = summaryOutput.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'summary';
                link.setAttribute('download', `${safeTitle}_summary.docx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                setSuccessMessage("✅ Summary downloaded as .docx!");
                setShowSummaryDownloadOptionsModal(false);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.detail || 'Server returned an unexpected format instead of a DOCX file.');
            }
        } catch (err) {
            console.error("❌ DOCX Download error:", err);
            if (err.message !== 'User not authenticated for summary download') {
                 setErrorMessage(err.message || "An unexpected error occurred while downloading DOCX. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    const renderTextWithBold = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, lineIndex) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <React.Fragment key={lineIndex}>
                    {parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
                        }
                        return part;
                    })}
                    {lineIndex < text.split('\n').length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    const isPptModeActive = actionChoice === "ppt";
    const numParagraphsLabelText = isPptModeActive
        ? "Number of Content Slides (from themed sections):"
        : "Detail Level (influences paragraph/keypoint count):";
    const numParagraphsMinVal = 1;
    const numParagraphsMaxVal = isPptModeActive ? 15 : 10;
    const currentTotalSlides = isPptModeActive ? numParagraphs + 4 : null; // Assuming 4 fixed slides


    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <nav className={styles.nav}>
                    <ul>
                        <li onClick={() => navigate('/my-work')}> MyWork</li>
                        <li onClick={() => navigate('/')}> Home</li>
                        <li onClick={() => navigate('/template')}> Templates</li>
                        <li className={styles.active} onClick={() => navigate('/generate')}> Summary/PPT</li>
                        <li onClick={() => navigate('/pricing')}> Pricing</li>
                        <li onClick={() => navigate('/aboutus')}> About Us </li>
                        <li onClick={() => navigate('/contactus')}> Contact us </li>
                    </ul>
                </nav>
            </aside>

            <div className={styles.wrapper}>
                <header className={styles.header}>
                    Hi, I am your AI assistant, <strong>Little A!</strong> Upload your document.
                    <h5><p>"Turn any file, link, or text into a polished presentation—powered by AI, perfected by you."</p></h5>
                </header>

                <div className={styles.cardGrid}>
                    <div className={styles.card} onClick={handleFileUploadClick}>
                        <div className={styles.iconLarge}><img src="/assets/file.jpeg" alt="Upload" className={styles.iconImage} /></div>
                        <div className={styles.cardTitle}>Upload a file</div>
                        <div className={styles.divider}></div>
                        <ul className={styles.cardDescription}>
                            <li>PPTX, DOCX, PDF</li><li>Images (JPG, PNG)</li><li>TXT</li>
                        </ul>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp" onChange={handleFileChange} />
                    </div>
                    <div className={styles.card} onClick={handleURLImportClick}>
                        <div className={styles.iconLarge}><img src="/assets/url.jpeg" alt="URL" className={styles.iconImage} /></div>
                        <div className={styles.cardTitle}>Import from URL</div>
                        <div className={styles.divider}></div>
                        <ul className={styles.cardDescription}>
                           <li>Webpages, Blogs</li><li>Articles</li>
                        </ul>
                    </div>
                    <div className={styles.card} onClick={handleTextImportClick}>
                        <div className={styles.iconLarge}><img src="/assets/text.jpeg" alt="Text" className={styles.iconImage} /></div>
                        <div className={styles.cardTitle}>Paste Text</div>
                        <div className={styles.divider}></div>
                         <ul className={styles.cardDescription}>
                            <li>Type Manually</li><li>Paste Content</li>
                         </ul>
                    </div>
                </div>

                {showPasteTextArea && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{maxWidth: '600px'}}>
                            <h3>📝 Paste your text</h3>
                            <textarea
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                className={styles.textArea}
                                placeholder="Paste content here..."
                                rows="10"
                            />
                            <div className={styles.modalButtonContainer} style={{ marginTop: '20px', borderTop:'none', justifyContent:'flex-end' }}>
                                <button onClick={() => { setShowPasteTextArea(false); setPastedText(''); }} className={styles.closeButton}>Cancel</button>
                                <button onClick={handleSavePastedText} className={styles.uploadButton} >Process Text</button>
                            </div>
                        </div>
                    </div>
                )}

                {showUrlInput && (
                     <div className={styles.modalOverlay}>
                         <div className={styles.modalContent}>
                            <h3>🌐 Import Content from URL</h3>
                            <label htmlFor="urlInputMainPage" className={styles.modalLabel}>Enter URL:</label>
                            <input id="urlInputMainPage" type="url" placeholder="https://example.com" value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)} className={styles.urlInput} />

                             <label htmlFor="urlSummaryTitleMainPage" className={styles.modalLabel}>Title for Output:</label>
                             <input id="urlSummaryTitleMainPage" type="text" placeholder="e.g., Analysis of Web Content" value={currentSummaryTitle}
                                onChange={(e) => setCurrentSummaryTitle(e.target.value)} className={styles.textInput} />
                            
                             <div className={styles.modalButtonContainer} style={{borderTop:'none', justifyContent:'flex-end'}}>
                                <button onClick={() => { setShowUrlInput(false); setUrlInput(''); setCurrentSummaryTitle('');}} className={styles.closeButton}>Cancel</button>
                                <button onClick={handleProcessURLInput} className={styles.uploadButton} disabled={loading}>
                                     {loading ? '⏳ Processing...' : 'Next Step ➔'}
                                </button>
                             </div>
                         </div>
                     </div>
                 )}

                {showModal && originalInputDetails && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modalContent} ${actionChoice === 'ppt' ? styles.modalContentLarge : ''}`}>
                            <h3 className={styles.modalTitle}>📄 Content Options</h3>
                            <div className={styles.fileNameDisplay}><strong>Source:</strong> {originalInputDetails.name}</div>

                            {!actionChoice ? (
                                <div className={styles.modalButtonChoices}>
                                    <button onClick={() => setActionChoice("summary")} className={styles.choiceButton}>📝 Get Summary</button>
                                    <button onClick={() => { setActionChoice("ppt"); }} className={styles.choiceButton}>📊 Convert to PPT</button>
                                </div>
                            ) : (
                                <>
                                    <label htmlFor="mainTitleInputModal" className={styles.modalLabel}>Output Title:</label>
                                    <input
                                        id="mainTitleInputModal" type="text" placeholder="e.g. Machine Learning Overview"
                                        className={styles.textInput} value={currentSummaryTitle} onChange={(e) => setCurrentSummaryTitle(e.target.value)}
                                    />
                                    <label htmlFor="numParasInputModal" className={styles.modalLabel}>
                                        {numParagraphsLabelText}
                                        {isPptModeActive && (
                                            loadingHint ? 
                                            <span className={styles.hintText}> (Estimating total slides...)</span> 
                                            : (suggestedSectionsHint !== null && typeof suggestedSectionsHint === 'number' ? 
                                                <span className={styles.hintText}> 
                                                    (AI estimates approx. {suggestedSectionsHint} total slides. 
                                                    Your current settings will generate {currentTotalSlides} total slides based on {numParagraphs} content slides.)
                                                </span>
                                                : (suggestedSectionsHint !== null && <span className={styles.hintText}> (Hint: {suggestedSectionsHint})</span> ) 
                                              )
                                        )}
                                    </label>
                                    <input 
                                        id="numParasInputModal" 
                                        type="number" 
                                        min={numParagraphsMinVal} 
                                        max={numParagraphsMaxVal} 
                                        value={numParagraphs}
                                        onChange={(e) => setNumParagraphs(Math.max(numParagraphsMinVal, Math.min(numParagraphsMaxVal, Number(e.target.value))))} 
                                        className={styles.numberInput}
                                    />

                                    {actionChoice === "summary" && (
                                        <>
                                            <h4 className={styles.modalSectionTitle}>Summary Content Style:</h4>
                                            <div className={styles.radioGroupContainer}>
                                                <div className={styles.radioOption}>
                                                    <input type="radio" id="summaryStyleParagraph" name="summaryContentStyle" value="paragraphs" checked={summaryContentStyle === 'paragraphs'} onChange={(e) => setSummaryContentStyle(e.target.value)} />
                                                    <label htmlFor="summaryStyleParagraph">Paragraphs</label>
                                                </div>
                                                <div className={styles.radioOption}>
                                                    <input type="radio" id="summaryStyleKeypoints" name="summaryContentStyle" value="keypoints" checked={summaryContentStyle === 'keypoints'} onChange={(e) => setSummaryContentStyle(e.target.value)} />
                                                    <label htmlFor="summaryStyleKeypoints">Keypoints / Bullets</label>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {actionChoice === "ppt" && (
                                        <>
                                            <h4 className={styles.modalSectionTitle}>PPT Content Style:</h4>
                                            <div className={styles.radioGroupContainer}>
                                                <div className={styles.radioOption}>
                                                    <input type="radio" id="pptStyleParagraph" name="pptContentStyle" value="paragraphs" checked={pptContentStyle === 'paragraphs'} onChange={(e) => setPptContentStyle(e.target.value)} />
                                                    <label htmlFor="pptStyleParagraph">Paragraphs</label>
                                                </div>
                                                <div className={styles.radioOption}>
                                                    <input type="radio" id="pptStyleKeypoints" name="pptContentStyle" value="keypoints" checked={pptContentStyle === 'keypoints'} onChange={(e) => setPptContentStyle(e.target.value)} />
                                                    <label htmlFor="pptStyleKeypoints">Keypoints / Bullets</label>
                                                </div>
                                            </div>

                                            <h4 className={styles.modalSectionTitle}>Template Options:</h4>
                                            <div className={styles.templateOptionsContainer}>
                                                <div className={styles.hfCheckboxGroup}>
                                                    <input type="checkbox" id="useDefaultTemplateModal" checked={useDefaultTemplate && !customTemplateFile} onChange={(e) => { setUseDefaultTemplate(e.target.checked); if(e.target.checked) setCustomTemplateFile(null); }} disabled={!!customTemplateFile} />
                                                    <label htmlFor="useDefaultTemplateModal">Use Default Template</label>
                                                </div>
                                                <div className={styles.customTemplateUpload}>
                                                    <label htmlFor="customTemplateFileModal" className={styles.modalLabelInline}>Or Upload Custom Template (.potx, .pptx):</label>
                                                    <input type="file" id="customTemplateFileModal" ref={customTemplateInputRef} accept=".potx,.pptx" onChange={handleCustomTemplateFileChange} className={styles.fileInputSmall} />
                                                    {customTemplateFile && <span className={styles.fileNameSmall}>{customTemplateFile.name}</span>}
                                                </div>
                                            </div>


                                            <h4 className={styles.modalSectionTitle}>Header & Footer Options:</h4>
                                            <div className={styles.hfOptionsGrid}> 
                                                <div className={styles.hfColumn}>
                                                    <div className={styles.hfCheckboxGroup}>
                                                        <input type="checkbox" id="includeDateTimeModal" checked={includeDateTime} onChange={(e) => setIncludeDateTime(e.target.checked)} />
                                                        <label htmlFor="includeDateTimeModal">Date and time</label>
                                                    </div>
                                                    {includeDateTime && (
                                                        <div className={styles.hfRadioGroup}>
                                                            <div>
                                                                <input type="radio" id="updateAutoModal" name="dateTimeTypeModal" checked={updateDateTimeAutomatically} onChange={() => setUpdateDateTimeAutomatically(true)} />
                                                                <label htmlFor="updateAutoModal">Update automatically</label>
                                                            </div>
                                                            <div>
                                                                <input type="radio" id="fixedDateModal" name="dateTimeTypeModal" checked={!updateDateTimeAutomatically} onChange={() => setUpdateDateTimeAutomatically(false)} />
                                                                <label htmlFor="fixedDateModal">Fixed:</label>
                                                                <input type="date" value={fixedDateTime} onChange={(e) => setFixedDateTime(e.target.value)} disabled={updateDateTimeAutomatically} className={styles.hfFixedDateInput} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.hfColumn}>
                                                    <div className={styles.hfCheckboxGroup}> 
                                                        <input type="checkbox" id="includeSlideNumberModal" checked={includeSlideNumber} onChange={(e) => setIncludeSlideNumber(e.target.checked)} />
                                                        <label htmlFor="includeSlideNumberModal">Slide number</label>
                                                    </div>
                                                    <div className={styles.hfInputGroup}> 
                                                        <label htmlFor="footerTextHFInputModal" className={styles.modalLabelInline}>Footer Text:</label>
                                                        <input 
                                                            type="text" 
                                                            id="footerTextHFInputModal" 
                                                            value={footerTextHF} 
                                                            onChange={(e) => setFooterTextHF(e.target.value)} 
                                                            placeholder="Custom footer text" 
                                                            className={`${styles.textInput} ${styles.pptFooterInputLarge}`}
                                                        />
                                                    </div>
                                                    <div className={styles.hfCheckboxGroup}>
                                                        <input type="checkbox" id="dontShowOnTitleModal" checked={dontShowOnTitleSlide} onChange={(e) => setDontShowOnTitleSlide(e.target.checked)} />
                                                        <label htmlFor="dontShowOnTitleModal">Don't show on title slide</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className={styles.modalButtonContainer}>
                                        <button onClick={() => { resetAllStates(); }} className={styles.closeButton}>
                                            Cancel & Clear All
                                        </button>
                                        <button onClick={handlePrimaryAction} className={styles.uploadButton} disabled={loading || loadingHint}>
                                            {loading ? '⏳ Processing...' : (actionChoice === "summary" ? '🚀 Generate Summary' : '📊 Generate PPT')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {showSummaryDownloadOptionsModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{maxWidth: '650px'}}>
                            <h3 className={styles.modalTitle}>📄 Summary Download Options</h3>
                            
                            <label htmlFor="summaryHeaderText" className={styles.modalLabel}>Header Text (Top of Page):</label>
                            <input
                                id="summaryHeaderText" type="text" placeholder="e.g., Confidential Report"
                                className={styles.textInput}
                                value={summaryDownloadOptions.headerText}
                                onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerText: e.target.value})}
                            />
                            <div className={styles.radioGroupContainer} style={{flexDirection: 'row', gap: '20px', marginBottom: '20px'}}>
                                <div className={styles.radioOption}>
                                    <input type="radio" id="headerPosLeft" name="headerPosition" value="left" 
                                           checked={summaryDownloadOptions.headerPosition === 'left'} 
                                           onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerPosition: e.target.value})} />
                                    <label htmlFor="headerPosLeft">Header Left</label>
                                </div>
                                <div className={styles.radioOption}>
                                    <input type="radio" id="headerPosRight" name="headerPosition" value="right" 
                                           checked={summaryDownloadOptions.headerPosition === 'right'} 
                                           onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerPosition: e.target.value})} />
                                    <label htmlFor="headerPosRight">Header Right</label>
                                </div>
                            </div>

                            <label htmlFor="summaryFooterText" className={styles.modalLabel}>Footer Text (Bottom-Left):</label>
                            <input
                                id="summaryFooterText" type="text" placeholder="e.g., Company Name"
                                className={styles.textInput}
                                value={summaryDownloadOptions.footerText}
                                onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, footerText: e.target.value})}
                            />
                             <div className={styles.hfCheckboxGroup} style={{marginTop: '15px', marginBottom: '25px'}}>
                                <input type="checkbox" id="summaryIncludePageNum" 
                                       checked={summaryDownloadOptions.includePageNumber} 
                                       onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, includePageNumber: e.target.checked})} />
                                <label htmlFor="summaryIncludePageNum">Include Page Number (Bottom-Right)</label>
                            </div>

                            <div className={styles.modalButtonContainer}>
                                <button onClick={() => setShowSummaryDownloadOptionsModal(false)} className={styles.closeButton}>
                                    Cancel
                                </button>
                                <button onClick={handleConfirmSummaryDownload} className={styles.uploadButton} disabled={loading}>
                                    {loading ? '⏳ Downloading...' : '📥 Download as DOCX'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {successMessage && (
                    <div className={`${styles.popup} ${styles.successPopup}`}>{successMessage}</div>
                )}
                {errorMessage && (
                    <div className={`${styles.popup} ${styles.errorPopup}`}>{errorMessage}</div>
                )}

                {showSummaryDisplay && !errorMessage && (
                    <div className={styles.summaryBox}>
                        <h3 className={styles.summaryTitleHeader}>{summaryOutput.title || "Generated Output"}</h3>
                        {summaryOutput.introduction && (
                            <>
                                <h4 className={styles.summarySubHeader}>Introduction:</h4>
                                <div className={styles.summaryText}>{renderTextWithBold(summaryOutput.introduction)}</div>
                            </>
                        )}
                        <h4 className={styles.summarySubHeader}>Summary:</h4>
                        <div className={styles.summaryText}>{renderTextWithBold(summaryOutput.summaryText)}</div>
                        {summaryOutput.conclusion && (
                             <>
                                <h4 className={styles.summarySubHeader}>Conclusion:</h4>
                                <div className={styles.summaryText}>{renderTextWithBold(summaryOutput.conclusion)}</div>
                            </>
                        )}
                        <div className={styles.summaryActions}>
                             <button
                                onClick={handleDownloadSummaryClick} 
                                className={styles.actionButtonSecondary}
                                disabled={loading}
                            >
                                📥 Download Summary
                            </button>
                            {showGeneratePPTFromSummaryButton && (
                                <button
                                    onClick={handleGeneratePPTFromSummaryClick}
                                    className={styles.actionButton}
                                    disabled={loading}
                                >
                                    📊 Generate PPT
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratePPT;