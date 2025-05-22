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
    const [numParagraphs, setNumParagraphs] = useState(3); // For summary paragraphs, or if summary keypoint detail level
    const [currentSummaryTitle, setCurrentSummaryTitle] = useState('');
    // const [numSlides, setNumSlides] = useState(5); // Removed: Replaced by numSlidesRequired
    const [numSlidesRequired, setNumSlidesRequired] = useState(5); // New state for combined slides input

    const [pptContentStyle, setPptContentStyle] = useState('paragraphs'); // For PPT slide content
    const [summaryContentStyle, setSummaryContentStyle] = useState('paragraphs'); // New: For summary output style

    const [includeDateTime, setIncludeDateTime] = useState(false);
    const [updateDateTimeAutomatically, setUpdateDateTimeAutomatically] = useState(true);
    const [fixedDateTime, setFixedDateTime] = useState('');
    const [includeSlideNumber, setIncludeSlideNumber] = useState(false);
    const [footerTextHF, setFooterTextHF] = useState('');
    const [dontShowOnTitleSlide, setDontShowOnTitleSlide] = useState(true);

    const [useDefaultTemplate, setUseDefaultTemplate] = useState(true); 
    const [customTemplateFile, setCustomTemplateFile] = useState(null); 

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
        setNumSlidesRequired(5); // Reset the new state
        setPptContentStyle('paragraphs');
        setSummaryContentStyle('paragraphs'); // Reset summary style
        resetHeaderFooterState();
        resetTemplateStates(); 
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
        setSummaryContentStyle('paragraphs'); // Default to paragraphs when modal opens
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
    };

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
        
        // numParagraphs is used for summary detail or for the *number of sections* in PPT
        formData.append("num_paragraphs", numParagraphs);

        if (actionChoice === "ppt") {
            // Both num_paragraphs (for sections) and num_slides (for content slides) will use numSlidesRequired
            formData.append("num_slides", numSlidesRequired); // Use the combined input for max content slides
            formData.append("num_paragraphs", numSlidesRequired); // Use the combined input for number of themed sections
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
            const response = await fetch(apiUrl, { method: 'POST', body: formData });

            if (actionChoice === "ppt") {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({})); 
                    const errorMsg = errorData.error || errorData.detail || `PPT generation failed: ${response.status} ${response.statusText}`;
                    throw new Error(errorMsg);
                }
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/vnd.openxmlformats-officedocument.presentationml.presentation")) {
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    const safeTitle = currentSummaryTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'presentation';
                    link.setAttribute('download', `${safeTitle}.pptx`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    window.URL.revokeObjectURL(downloadUrl);
                    setSuccessMessage("✅ PPT downloaded successfully!");
                    resetAllStates(); 
                } else {
                    const errorData = await response.json().catch(() => ({})); 
                    throw new Error(errorData.error || errorData.detail || 'Server returned an unexpected format instead of a PPT file.');
                }
            } else { // actionChoice === "summary"
                const responseData = await response.json();
                if (!response.ok) {
                    const errorMsg = responseData.error || responseData.detail || `Summary generation failed: ${response.status} ${response.statusText}`;
                    throw new Error(errorMsg);
                }
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
            setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
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
        setActionChoice("ppt");
        resetHeaderFooterState();
        resetTemplateStates();

        setShowModal(true); 
        setShowSummaryDisplay(false); 
        setShowGeneratePPTFromSummaryButton(false); 
    };
    
    const handleDownloadSummary = () => {
        if (!summaryOutput.title && !summaryOutput.summaryText) {
            setErrorMessage("No summary content to download.");
            return;
        }
        const { title, introduction, summaryText, conclusion } = summaryOutput;
        let fullText = `Title: ${title}\n\n`;
        if (introduction) {
            fullText += `Introduction:\n${introduction.replace(/\*\*(.*?)\*\*/g, '$1')}\n\n`; 
        }
        fullText += `Summary:\n${summaryText.replace(/\*\*(.*?)\*\*/g, '$1')}\n\n`; 
        if (conclusion) {
            fullText += `Conclusion:\n${conclusion.replace(/\*\*(.*?)\*\*/g, '$1')}\n\n`; 
        }

        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'summary';
        link.setAttribute('download', `${safeTitle}_summary.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSuccessMessage("✅ Summary downloaded as .txt!");
    };

    const renderTextWithBold = (text) => {
        if (!text) return null;
        // Split by newline first to handle multi-line text (like keypoints) then process bold for each line
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
                    {lineIndex < text.split('\n').length -1 && <br />} 
                </React.Fragment>
            );
        });
    };


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
                        <div className={styles.iconLarge}><img src="/assets/file.png" alt="Upload" className={styles.iconImage} /></div>
                        <div className={styles.cardTitle}>Upload a file</div>
                        <div className={styles.divider}></div>
                        <ul className={styles.cardDescription}>
                            <li>PPTX, DOCX, PDF</li><li>Images (JPG, PNG)</li><li>TXT</li>
                        </ul>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp" onChange={handleFileChange} />
                    </div>
                    <div className={styles.card} onClick={handleURLImportClick}>
                        <div className={styles.iconLarge}><img src="/assets/url.png" alt="URL" className={styles.iconImage} /></div>
                        <div className={styles.cardTitle}>Import from URL</div>
                        <div className={styles.divider}></div>
                        <ul className={styles.cardDescription}>
                           <li>Webpages, Blogs</li><li>Articles</li>
                        </ul>
                    </div>
                    <div className={styles.card} onClick={handleTextImportClick}>
                        <div className={styles.iconLarge}><img src="/assets/text.png" alt="Text" className={styles.iconImage} /></div>
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
                                    {actionChoice === "summary" && (
                                        <>
                                            <label htmlFor="numParasInputModal" className={styles.modalLabel}>
                                                Detail Level (influences paragraph/keypoint count):
                                            </label>
                                            <input id="numParasInputModal" type="number" min="1" max="10" value={numParagraphs}
                                                onChange={(e) => setNumParagraphs(Math.max(1, Math.min(10, Number(e.target.value))))} className={styles.numberInput}
                                            />
                                        </>
                                    )}

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
                                            {/* Combined input for number of slides required */}
                                            <label htmlFor="numSlidesRequiredInput" className={styles.modalLabel}>Number of slides required:</label>
                                            <input id="numSlidesRequiredInput" type="number" min="1" max="15" value={numSlidesRequired}
                                                onChange={(e) => setNumSlidesRequired(Math.max(1, Math.min(15, Number(e.target.value))))} className={styles.numberInput}
                                            />

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
                                                        <input type="text" id="footerTextHFInputModal" value={footerTextHF} onChange={(e) => setFooterTextHF(e.target.value)} placeholder="Custom footer text" className={styles.textInputSmall} />
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
                                        <button onClick={handlePrimaryAction} className={styles.uploadButton} disabled={loading}>
                                            {loading ? '⏳ Processing...' : (actionChoice === "summary" ? '🚀 Generate Summary' : '📊 Generate PPT')}
                                        </button>
                                    </div>
                                </>
                            )}
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
                                onClick={handleDownloadSummary}
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