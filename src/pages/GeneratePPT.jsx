import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './GeneratePPT.module.css';

const GeneratePPT = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [originalInputDetails, setOriginalInputDetails] = useState(null); // Stores { name, fileObject?, content?, url?, type }

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

    const [actionChoice, setActionChoice] = useState(null); // 'summary' or 'ppt'
    const [numParagraphs, setNumParagraphs] = useState(3); // Stores CONTENT slides/detail level
    const [currentSummaryTitle, setCurrentSummaryTitle] = useState('');
    
    const [suggestedSectionsHint, setSuggestedSectionsHint] = useState(null);
    const [loadingHint, setLoadingHint] = useState(false);
    const [aiSuggestedSlides, setAiSuggestedSlides] = useState(null);

    const [summaryContentStyle, setSummaryContentStyle] = useState('paragraphs'); // 'paragraphs' or 'keypoints'

    // PPT options state
    const [includeDateTime, setIncludeDateTime] = useState(false);
    const [updateDateTimeAutomatically, setUpdateDateTimeAutomatically] = useState(true);
    const [fixedDateTime, setFixedDateTime] = useState('');
    const [includeSlideNumber, setIncludeSlideNumber] = useState(false);
    const [footerTextHF, setFooterTextHF] = useState('');
    const [dontShowOnTitleSlide, setDontShowOnTitleSlide] = useState(true);
    const [pptLogoPosition, setPptLogoPosition] = useState('top_left'); // Added
    const [defaultPptLogoNameFromSettings, setDefaultPptLogoNameFromSettings] = useState(null); // Stores filename from settings
    const [defaultPptCustomTemplateNameFromSettings, setDefaultPptCustomTemplateNameFromSettings] = useState(null);


    const [customTemplateFile, setCustomTemplateFile] = useState(null); // For user upload in modal
    const [customLogoFile, setCustomLogoFile] = useState(null);  // For user upload in modal
    const [showTemplateChoiceModal, setShowTemplateChoiceModal] = useState(false); 
    const [availableTemplates, setAvailableTemplates] = useState([ 
        { id: 'Temp.pptx', name: 'Default Theme', previewSrc: '/assets/template_preview_placeholder.png' },
        { id: 'ModernDark.pptx', name: 'Modern Dark', previewSrc: '/assets/modern_dark_preview.png' },
        { id: 'CorporateBlue.pptx', name: 'Corporate Blue', previewSrc: '/assets/corporate_blue_preview.png' },
        { id: 'VibrantGradient.pptx', name: 'Vibrant Gradient', previewSrc: '/assets/vibrant_gradient_preview.png' },
        { id: 'MinimalistLight.pptx', name: 'Minimalist Light', previewSrc: '/assets/minimalist_light_preview.png' },
        { id: 'GeometricGreen.pptx', name: 'Geometric Green', previewSrc: '/assets/geometric_green_preview.png' },
        { id: 'ProfessionalGray.pptx', name: 'Professional Gray', previewSrc: '/assets/professional_gray_preview.png' },
        { id: 'SunnyOrange.pptx', name: 'Sunny Orange', previewSrc: '/assets/sunny_orange_preview.png' },
        { id: 'ElegantPurple.pptx', name: 'Elegant Purple', previewSrc: '/assets/elegant_purple_preview.png'},
        { id: 'UniqueMatch.pptx', name: 'Unique Match', previewSrc: '/assets/unique_match_preview.png' },
    ]);
    const [selectedPredefinedTemplate, setSelectedPredefinedTemplate] = useState(
        availableTemplates.length > 0 ? availableTemplates[0] : null
    ); 

    // State for DOCX options
    const [showSummaryDownloadOptionsModal, setShowSummaryDownloadOptionsModal] = useState(false);
    const [summaryDownloadOptions, setSummaryDownloadOptions] = useState({
        footerText: '',
        includePageNumber: false,
        headerText: '',
        headerPosition: 'left', // Added
        // defaultSummaryLogoNameFromSettings: null, // If summary logos were to be handled similarly
    });


    const fileInputRef = useRef();
    const customTemplateInputRef = useRef();
    const customLogoInputRef = useRef(); 
    const navigate = useNavigate();
    const location = useLocation();

    const numParagraphsMinVal = 1;
    const FIXED_SLIDES_COUNT = 4; 
    const MAX_CONTENT_SLIDES_PPT = 15;
    const MAX_CONTENT_SLIDES_SUMMARY = 10;

    const getCurrentDateInputFormat = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const applyDefaultSettings = () => {
        const savedSettingsString = localStorage.getItem('appSettings');
        if (savedSettingsString) {
            try {
                const defaults = JSON.parse(savedSettingsString);

                if (defaults.ppt) {
                    setIncludeDateTime(defaults.ppt.includeDate ?? false);
                    setIncludeSlideNumber(defaults.ppt.includePageNumber ?? false);
                    setFooterTextHF(defaults.ppt.footerText ?? '');
                    setPptLogoPosition(defaults.ppt.logoPosition ?? 'top_left');
                    setDefaultPptLogoNameFromSettings(defaults.ppt.defaultLogo ?? null);
                    setDefaultPptCustomTemplateNameFromSettings(defaults.ppt.customTemplate ?? null);


                    const predefinedTemplate = availableTemplates.find(t => t.id === defaults.ppt.templateId);
                    setSelectedPredefinedTemplate(predefinedTemplate || (availableTemplates.length > 0 ? availableTemplates[0] : null) );
                    // customTemplateFile and customLogoFile are for new uploads, so not set from string names here
                } else { // Fallback if defaults.ppt is not defined
                    setSelectedPredefinedTemplate(availableTemplates.length > 0 ? availableTemplates[0] : null);
                }

                if (defaults.summary) {
                    setSummaryDownloadOptions({
                        footerText: defaults.summary.footerText ?? '',
                        includePageNumber: defaults.summary.includePageNumber ?? false,
                        headerText: defaults.summary.headerText ?? '',
                        headerPosition: defaults.summary.headerPosition ?? 'left',
                        // defaultSummaryLogoNameFromSettings: defaults.summary.defaultLogo ?? null, // For future if summary default logo is used
                    });
                }
            } catch (error) {
                console.error("Error applying default settings:", error);
                 // Fallback to ensure selectedPredefinedTemplate has a value
                if (!selectedPredefinedTemplate && availableTemplates.length > 0) {
                    setSelectedPredefinedTemplate(availableTemplates[0]);
                }
            }
        } else {
             // Fallback to ensure selectedPredefinedTemplate has a value if no settings saved
            if (!selectedPredefinedTemplate && availableTemplates.length > 0) {
                setSelectedPredefinedTemplate(availableTemplates[0]);
            }
        }
        setFixedDateTime(getCurrentDateInputFormat()); // Always set current date for fixed option initially
    };

    useEffect(() => {
        applyDefaultSettings(); // Load defaults on initial mount

        if (location.state?.editMode) {
            const editState = location.state;
            setOriginalInputDetails(editState.originalInputDetails);
            setCurrentSummaryTitle(editState.topic);
            setActionChoice(editState.actionChoice);
            setNumParagraphs(editState.numParagraphs);
            setIncludeDateTime(editState.includeDateTime);
            setUpdateDateTimeAutomatically(editState.updateDateTimeAutomatically);
            setFixedDateTime(editState.fixedDateTime || getCurrentDateInputFormat());
            setIncludeSlideNumber(editState.includeSlideNumber);
            setFooterTextHF(editState.footerTextHF);
            setDontShowOnTitleSlide(editState.dontShowOnTitleSlide);
            setPptLogoPosition(editState.pptLogoPosition || 'top_left');

            if (editState.selectedPredefinedTemplate) {
                setSelectedPredefinedTemplate(editState.selectedPredefinedTemplate);
                setCustomTemplateFile(null);
            } else {
                 // If coming to edit and no specific predefined template was set, apply default from settings
                const savedSettingsString = localStorage.getItem('appSettings');
                if (savedSettingsString) {
                    const defaults = JSON.parse(savedSettingsString);
                    if (defaults.ppt?.templateId) {
                         const predTemplate = availableTemplates.find(t => t.id === defaults.ppt.templateId);
                         setSelectedPredefinedTemplate(predTemplate || availableTemplates[0]);
                    } else {
                        setSelectedPredefinedTemplate(availableTemplates[0]);
                    }
                } else {
                    setSelectedPredefinedTemplate(availableTemplates[0]);
                }
            }
            // customLogoFile would need to be re-selected by user if they want to change it in edit mode
            setShowModal(true);
             // Clear editMode from location state to prevent re-triggering
            navigate(location.pathname, { replace: true, state: {} });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, navigate, availableTemplates]); // availableTemplates added as it's used in fallback

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(''), 5000); // Longer for errors
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const clearSummaryDisplay = () => {
        setSummaryOutput({ title: '', introduction: '', summaryText: '', conclusion: '' });
        setShowSummaryDisplay(false);
        setShowGeneratePPTFromSummaryButton(false);
    };
    
    const resetPptOptionsToDefaults = () => {
        const savedSettingsString = localStorage.getItem('appSettings');
        let pptDefaults = { // Hardcoded fallbacks
            includeDate: false,
            includePageNumber: false,
            footerText: '',
            logoPosition: 'top_left',
            defaultLogo: null,
            customTemplate: null,
            templateId: availableTemplates.length > 0 ? availableTemplates[0].id : 'Temp.pptx',
        };

        if (savedSettingsString) {
            try {
                const parsed = JSON.parse(savedSettingsString);
                if (parsed.ppt) {
                    pptDefaults = { ...pptDefaults, ...parsed.ppt };
                }
            } catch (e) { console.error("Couldn't parse settings for PPT reset", e); }
        }
        
        setIncludeDateTime(pptDefaults.includeDate);
        setUpdateDateTimeAutomatically(true); // Default behavior for date
        setFixedDateTime(getCurrentDateInputFormat());
        setIncludeSlideNumber(pptDefaults.includePageNumber);
        setFooterTextHF(pptDefaults.footerText);
        setDontShowOnTitleSlide(true); // Common default
        setPptLogoPosition(pptDefaults.logoPosition);
        setDefaultPptLogoNameFromSettings(pptDefaults.defaultLogo);
        setDefaultPptCustomTemplateNameFromSettings(pptDefaults.customTemplate);


        const predefinedTemplate = availableTemplates.find(t => t.id === pptDefaults.templateId);
        setSelectedPredefinedTemplate(predefinedTemplate || (availableTemplates.length > 0 ? availableTemplates[0] : null));
        
        setCustomTemplateFile(null); // Clear any user-uploaded template for this session
        if (customTemplateInputRef.current) customTemplateInputRef.current.value = null;
        setCustomLogoFile(null); // Clear any user-uploaded logo for this session
        if (customLogoInputRef.current) customLogoInputRef.current.value = null;
    };

    const resetSummaryDownloadOptionsToDefaults = () => {
         const savedSettingsString = localStorage.getItem('appSettings');
         let summaryDefaults = { // Hardcoded fallbacks
            footerText: '',
            includePageNumber: false,
            headerText: '',
            headerPosition: 'left',
         };
         if (savedSettingsString) {
            try {
                const parsed = JSON.parse(savedSettingsString);
                if (parsed.summary) {
                    summaryDefaults = { ...summaryDefaults, ...parsed.summary };
                }
            } catch(e) { console.error("Couldn't parse settings for Summary reset", e); }
         }
        setSummaryDownloadOptions({
            footerText: summaryDefaults.footerText,
            includePageNumber: summaryDefaults.includePageNumber,
            headerText: summaryDefaults.headerText,
            headerPosition: summaryDefaults.headerPosition,
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
        setAiSuggestedSlides(null); 
        setLoadingHint(false);
        setSummaryContentStyle('paragraphs');
        
        resetPptOptionsToDefaults(); // Apply defaults for PPT options
        resetSummaryDownloadOptionsToDefaults(); // Apply defaults for Summary DOCX options
        setShowTemplateChoiceModal(false); 
        setShowSummaryDownloadOptionsModal(false);

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
        setAiSuggestedSlides(null); 
        setNumParagraphs(3); 
        setSummaryContentStyle('paragraphs');
        
        resetPptOptionsToDefaults(); // Load defaults when modal opens
        resetSummaryDownloadOptionsToDefaults(); // Load defaults for summary options

        clearSummaryDisplay();
        setErrorMessage('');
        setSuccessMessage('');
        // Suggest title from filename, or leave blank for text/URL for user to fill
        const suggestedTitle = (inputMeta.name && inputMeta.name !== "Pasted Text" && !inputMeta.name.startsWith("URL:")) 
            ? inputMeta.name.split('.').slice(0, -1).join('.') || inputMeta.name 
            : "";
        setCurrentSummaryTitle(suggestedTitle);
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
        setShowPasteTextArea(false); // Close the paste text area
    };

    const handleFileUploadClick = () => {
        resetAllStates(); // Reset before new upload flow
        if (fileInputRef.current) fileInputRef.current.value = null; // Clear file input
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
                setSelectedPredefinedTemplate(null); // Deselect predefined if custom is chosen
                setErrorMessage('');
            } else {
                setErrorMessage('Invalid template file. Please select a .potx or .pptx file.');
                setCustomTemplateFile(null);
                if (customTemplateInputRef.current) {
                    customTemplateInputRef.current.value = null;
                }
                 // Fallback to default predefined template if invalid custom file
                const defaultTemplateFromSettings = availableTemplates.find(t => t.id === defaultPptCustomTemplateNameFromSettings) || availableTemplates[0];
                setSelectedPredefinedTemplate(defaultTemplateFromSettings);
            }
        } else {
             setCustomTemplateFile(null); 
             // If file is deselected, re-select the default predefined template
             const defaultTemplateFromSettings = availableTemplates.find(t => t.id === defaultPptCustomTemplateNameFromSettings) || availableTemplates[0];
             setSelectedPredefinedTemplate(defaultTemplateFromSettings);
        }
    };

    const handleCustomLogoFileChange = (e) => { 
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
            if (allowedTypes.includes(file.type) && file.size < 5 * 1024 * 1024) { // 5MB limit
                setCustomLogoFile(file);
                setErrorMessage('');
            } else {
                setErrorMessage('Invalid logo file. Please select a PNG, JPG, GIF, BMP, or WEBP image under 5MB.');
                setCustomLogoFile(null);
                if (customLogoInputRef.current) {
                    customLogoInputRef.current.value = null;
                }
            }
        } else {
            setCustomLogoFile(null); // Clear if no file is selected
        }
    };

    const handleProcessURLInput = async () => {
        if (!urlInput.trim() || !urlInput.startsWith('http')) {
            setErrorMessage('Please enter a valid URL (e.g., https://example.com).');
            return;
        }
        if (!currentSummaryTitle.trim()) {
            setErrorMessage('Please enter a Title for the output.'); // Prompt for title for URL too
            return;
        }
        const urlMeta = { name: `URL: ${urlInput.substring(0, 50)}...`, url: urlInput, type: 'url' };
        processAndShowModal(urlMeta); 
        setShowUrlInput(false); 
    };

    const fetchContentMetrics = async () => {
        if (!originalInputDetails) return;
        setLoadingHint(true);
        setSuggestedSectionsHint(null); 
        setAiSuggestedSlides(null); 

        const formData = new FormData();
        if (originalInputDetails.type === 'file' && originalInputDetails.fileObject) {
            formData.append("file", originalInputDetails.fileObject, originalInputDetails.name);
        } else if (originalInputDetails.type === 'text' && originalInputDetails.content) {
            formData.append("pasted_text", originalInputDetails.content);
        } else if (originalInputDetails.type === 'url' && originalInputDetails.url) {
            formData.append("url", originalInputDetails.url);
        } else {
            setLoadingHint(false);
            setSuggestedSectionsHint("N/A (no input for hint)");
            return;
        }

        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            setErrorMessage('Authentication token not found. Please log in.');
            setLoadingHint(false);
            setSuggestedSectionsHint("Auth required for hint");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/estimate-content-metrics/", {
                method: 'POST',
                headers: headers, 
                body: formData,
            });

            if (response.status === 401) {
                setErrorMessage('Unauthorized. Session may have expired. Please log in.');
                localStorage.removeItem('authToken');
                setLoadingHint(false);
                setSuggestedSectionsHint("Auth error");
                return;
            }

            const data = await response.json();
            if (response.ok && data.suggested_sections !== undefined) {
                const suggestedNum = Number(data.suggested_sections);
                if (!isNaN(suggestedNum) && suggestedNum >= numParagraphsMinVal) {
                    setSuggestedSectionsHint(data.estimation_details || `AI suggests ${suggestedNum} content slides.`);
                    setAiSuggestedSlides(suggestedNum); 
                    setNumParagraphs(suggestedNum); 
                } else {
                    setSuggestedSectionsHint(data.estimation_details || "Content may be insufficient for a specific slide count hint.");
                    setAiSuggestedSlides(null); 
                }
            } else {
                setSuggestedSectionsHint(data.estimation_details || data.error_detail || "Could not get slide estimation hint.");
                setAiSuggestedSlides(null);
            }
        } catch (error) {
            setSuggestedSectionsHint("Error fetching slide estimation hint.");
            setAiSuggestedSlides(null);
            console.error("Error fetching content metrics:", error);
        } finally {
            setLoadingHint(false);
        }
    };
    
    useEffect(() => {
        if (actionChoice === 'ppt' && originalInputDetails && showModal && !location.state?.editMode && !aiSuggestedSlides) { // Fetch only if not already fetched
            const token = localStorage.getItem('authToken');
            if (token) { 
                fetchContentMetrics();
            } else {
                setErrorMessage('Authentication token not found. Please log in for slide estimations.');
                setSuggestedSectionsHint("Auth required for hint");
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Not authenticated. Please log in to generate content.');
            setLoading(false);
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
        
        formData.append("num_paragraphs", numParagraphs);

        if (actionChoice === "ppt") {
            formData.append("include_date_time", includeDateTime);
            formData.append("update_date_time_auto", updateDateTimeAutomatically);
            if (!updateDateTimeAutomatically) { // Only send fixed_date_time if it's selected
                 formData.append("fixed_date_time", fixedDateTime || getCurrentDateInputFormat());
            }
            formData.append("include_slide_number", includeSlideNumber);
            formData.append("footer_text", footerTextHF);
            formData.append("dont_show_on_title", dontShowOnTitleSlide);
            formData.append("logo_position", pptLogoPosition); 

            if (customTemplateFile) {
                formData.append("custom_template_file", customTemplateFile, customTemplateFile.name);
            } else if (selectedPredefinedTemplate && selectedPredefinedTemplate.id) {
                formData.append("selected_template_name", selectedPredefinedTemplate.id);
            } else if (defaultPptCustomTemplateNameFromSettings) { // Use default custom template from settings if no other choice
                formData.append("default_custom_template_name", defaultPptCustomTemplateNameFromSettings);
            }


            if (customLogoFile) { 
                formData.append("custom_logo_file", customLogoFile, customLogoFile.name);
            } else if (defaultPptLogoNameFromSettings) { // If no new logo uploaded, send default from settings
                formData.append("default_logo_filename", defaultPptLogoNameFromSettings);
            }
        } else if (actionChoice === "summary") {
            formData.append("summary_style", summaryContentStyle);
        }

        const apiUrl = "http://localhost:8000/generate-ppt/"; 

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
            };
            const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: formData });
            
            if (response.status === 401) {
                setErrorMessage('Unauthorized. Session may have expired. Please log in.');
                localStorage.removeItem('authToken'); 
                throw new Error('User not authenticated'); 
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Unknown error" })); 
                const errorMsg = errorData.detail || errorData.error || `Generation failed: ${response.status} ${response.statusText}`;
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
                            topic: currentSummaryTitle,
                            originalInputDetails, // Keep this to allow re-editing or re-summarizing
                            // Pass all relevant PPT options for potential edit mode in preview
                            actionChoice, numParagraphs, includeDateTime, updateDateTimeAutomatically, fixedDateTime, 
                            includeSlideNumber, footerTextHF, dontShowOnTitleSlide, pptLogoPosition,
                            selectedPredefinedTemplate, // Pass the object
                            // customTemplateFile?.name, // Name of custom template if used (File object itself cannot be passed in state)
                            // customLogoFile?.name, // Name of custom logo if used
                            defaultPptLogoNameFromSettings, // Pass this along
                            defaultPptCustomTemplateNameFromSettings,
                        } 
                    });
                } else {
                     if (responseData.pptx_download_url) { // PPT generated but no preview
                        setErrorMessage(responseData.message || 'PPT generated, but preview is unavailable. Attempting download.');
                        const downloadUrl = `http://localhost:8000${responseData.pptx_download_url}`;
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.setAttribute('download', responseData.pptx_filename || `${currentSummaryTitle}.pptx`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                        setSuccessMessage('PPT downloaded as preview was unavailable.');
                        setShowModal(false); // Close modal after download
                    } else {
                        throw new Error(responseData.error || responseData.detail || 'Server did not return valid data for PPT preview or download.');
                    }
                }
            } else { // Summary mode
                setSummaryOutput({
                    title: responseData.topic || currentSummaryTitle,
                    introduction: responseData.introduction || '',
                    summaryText: responseData.summary_text || '',
                    conclusion: responseData.conclusion || '',
                });
                setShowSummaryDisplay(true);
                setSuccessMessage(responseData.message || "Summary generated successfully!");
                setShowGeneratePPTFromSummaryButton(true);
                setShowModal(false); // Close modal after summary generation
            }
        } catch (err) {
            console.error("Upload/Processing error:", err);
            if (err.message !== 'User not authenticated') { // Avoid double message for auth
                setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
            }
            clearSummaryDisplay(); // Clear any partial display on error
        } finally {
            setLoading(false);
        }
    };
    
    const handleGeneratePPTFromSummaryClick = () => {
        if (!originalInputDetails) {
            setErrorMessage("Original content details are missing. Please start over to generate PPT from summary.");
            return;
        }
        const token = localStorage.getItem('authToken'); 
        if (!token) {
            setErrorMessage('Not authenticated. Please log in to generate a PPT from summary.');
            return;
        }
        setActionChoice("ppt"); 
        resetPptOptionsToDefaults(); // Load defaults for PPT options again when switching to PPT mode
        // No need to reset summaryDownloadOptions here as this modal is for PPT
        setShowModal(true); // Show the main generation modal configured for PPT
        setShowSummaryDisplay(false); // Hide summary display
        setShowGeneratePPTFromSummaryButton(false); // Hide button
        // Fetch content metrics if not already available for PPT mode
        if (!aiSuggestedSlides) fetchContentMetrics();
    };

    const handleDownloadSummaryClick = () => {
        if (!summaryOutput.title && !summaryOutput.summaryText) {
            setErrorMessage("No summary content available to download.");
            return;
        }
        resetSummaryDownloadOptionsToDefaults(); // Load defaults into the DOCX options modal
        setShowSummaryDownloadOptionsModal(true);
    };

    const handleConfirmSummaryDownload = async () => {
        const requestBody = {
            summary_output: {
                title: summaryOutput.title,
                introduction: summaryOutput.introduction,
                summaryText: summaryOutput.summaryText,
                conclusion: summaryOutput.conclusion,
            },
            options: summaryDownloadOptions, // This state holds the user's choices for DOCX
        };
    
        setLoading(true); 
        setErrorMessage('');
        setSuccessMessage('');
    
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErrorMessage('Authentication token not found. Please log in.');
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch("http://localhost:8000/generate-summary-docx/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.status === 401) {
                setErrorMessage('Unauthorized. Session may have expired. Log in again.');
                localStorage.removeItem('authToken');
                setLoading(false);
                return;
            }
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to download summary: ${response.statusText}`);
            }
    
            const blob = await response.blob();
            const filenameHeader = response.headers.get('content-disposition');
            let filename = "summary.docx"; 
            if (filenameHeader) {
                const parts = filenameHeader.split('filename=');
                if (parts.length > 1) {
                    filename = parts[1].split(';')[0].replace(/"/g, '');
                }
            }
    
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
    
            setSuccessMessage("Summary DOCX downloaded successfully!");
    
        } catch (error) {
            console.error("Error downloading summary DOCX:", error);
            setErrorMessage(error.message || "An error occurred while downloading the summary.");
        } finally {
            setLoading(false);
            setShowSummaryDownloadOptionsModal(false); // Close modal
        }
    };

    const renderTextWithBold = (text) => {
        if (!text) return null;
        return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const isPptModeActive = actionChoice === "ppt";
    
    useEffect(() => {
        const minVal = numParagraphsMinVal;
        const currentOverallMax = isPptModeActive ? MAX_CONTENT_SLIDES_PPT : MAX_CONTENT_SLIDES_SUMMARY;
        let correctedNumParagraphs = Number(numParagraphs); // Ensure it's a number

        if (isNaN(correctedNumParagraphs) || correctedNumParagraphs < minVal) {
            correctedNumParagraphs = minVal;
        }
        if (correctedNumParagraphs > currentOverallMax) { 
            correctedNumParagraphs = currentOverallMax;
        }

        if (numParagraphs !== correctedNumParagraphs) {
            setNumParagraphs(correctedNumParagraphs);
        }
    }, [numParagraphs, isPptModeActive, numParagraphsMinVal]);


    let numParagraphsLabelText = isPptModeActive
        ? "Number of Content Slides:"
        : "Detail Level (influences summary length):";
    
    let numParagraphsHintText = ""; 
    if (isPptModeActive) {
        if (loadingHint) {
            numParagraphsHintText = " (Estimating based on input...)";
        } else if (suggestedSectionsHint) { // Display the full hint from backend
             numParagraphsHintText = ` (${suggestedSectionsHint})`;
        } else { // Generic hint if AI hint not available
            const minTotalInInput = numParagraphsMinVal + FIXED_SLIDES_COUNT;
            const maxTotalInInput = MAX_CONTENT_SLIDES_PPT + FIXED_SLIDES_COUNT;
            numParagraphsHintText = ` (Total slides: ${numParagraphsMinVal}-${MAX_CONTENT_SLIDES_PPT} content + ${FIXED_SLIDES_COUNT} standard = ${minTotalInInput}-${maxTotalInInput} approx.)`;
        }
    } else { // Summary mode hint
         numParagraphsHintText = ` (Min: ${numParagraphsMinVal}, Max: ${MAX_CONTENT_SLIDES_SUMMARY} detail)`;
    }
    
    // Calculate displayed value for "total slides" input field
    const totalSlidesDisplayValue = isPptModeActive ? (Number(numParagraphs) || 0) + FIXED_SLIDES_COUNT : numParagraphs;

    const handleTotalSlidesInputChange = (e) => {
        let rawValue = Number(e.target.value);
        if (isNaN(rawValue)) rawValue = numParagraphsMinVal + (isPptModeActive ? FIXED_SLIDES_COUNT : 0);

        let newContentSlidesCount;
        if (isPptModeActive) {
            newContentSlidesCount = rawValue - FIXED_SLIDES_COUNT;
            newContentSlidesCount = Math.max(numParagraphsMinVal, Math.min(newContentSlidesCount, MAX_CONTENT_SLIDES_PPT));
        } else { // Summary mode
            newContentSlidesCount = Math.max(numParagraphsMinVal, Math.min(rawValue, MAX_CONTENT_SLIDES_SUMMARY));
        }
        setNumParagraphs(newContentSlidesCount);
    };


    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <nav className={styles.nav}>
                    <ul>
                        <li onClick={() => navigate('/my-work')}> MyWork</li>
                        <li onClick={() => navigate('/')}> Home</li>
                        <li className={styles.active} onClick={() => { resetAllStates(); navigate('/generate');}}> Summary/PPT</li>
                        <li onClick={() => navigate('/pricing')}> Pricing</li>
                        <li onClick={() => navigate('/aboutus')}> About Us </li>
                        <li onClick={() => navigate('/contactus')}> Contact us </li>
                         <li onClick={() => navigate('/settings')}> Settings</li>
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
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.tiff" onChange={handleFileChange} />
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
                            <h3> Paste your text</h3>
                            <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)}
                                className={styles.textArea} placeholder="Paste content here..." rows="10"/>
                            <div className={styles.modalButtonContainer} style={{ marginTop: '20px', borderTop:'none', justifyContent:'flex-end' }}>
                                <button type="button" onClick={() => { setShowPasteTextArea(false); setPastedText(''); }} className={styles.closeButton}>Cancel</button>
                                <button type="button" onClick={handleSavePastedText} className={styles.uploadButton} >Process Text</button>
                            </div>
                        </div>
                    </div>
                )}

                {showUrlInput && (
                     <div className={styles.modalOverlay}>
                         <div className={styles.modalContent}>
                            <h3> Import Content from URL</h3>
                            <label htmlFor="urlInputMainPage" className={styles.modalLabel}>Enter URL:</label>
                            <input id="urlInputMainPage" type="url" placeholder="https://example.com" value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)} className={styles.urlInput} />
                             <label htmlFor="urlSummaryTitleMainPage" className={styles.modalLabel}>Title for Output:</label>
                             <input id="urlSummaryTitleMainPage" type="text" placeholder="e.g., Analysis of Web Content" value={currentSummaryTitle}
                                onChange={(e) => setCurrentSummaryTitle(e.target.value)} className={styles.textInput} />
                             <div className={styles.modalButtonContainer} style={{borderTop:'none', justifyContent:'flex-end'}}>
                                <button type="button" onClick={() => { setShowUrlInput(false); setUrlInput(''); setCurrentSummaryTitle('');}} className={styles.closeButton}>Cancel</button>
                                <button type="button" onClick={handleProcessURLInput} className={styles.uploadButton} disabled={loading}>
                                     {loading ? 'Processing...' : 'Next Step ➔'}
                                </button>
                             </div>
                         </div>
                     </div>
                 )}

                {showModal && originalInputDetails && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modalContent} ${actionChoice === 'ppt' ? styles.modalContentLarge : ''}`}>
                            <h3 className={styles.modalTitle}> Content Options</h3>
                            <div className={styles.fileNameDisplay}><strong>Source:</strong> {originalInputDetails.name}</div>

                            {!actionChoice ? (
                                 <div className={styles.modalButtonChoices}>
                                    <button type="button" onClick={() => setActionChoice("summary")} className={styles.choiceButton}>📝 Get Summary</button>
                                    <button type="button" onClick={() => setActionChoice("ppt")} className={styles.choiceButton}>📊 Convert to PPT</button>
                                </div>
                            ) : (
                                <>
                                    <label htmlFor="mainTitleInputModal" className={styles.modalLabel}>Output Title:</label>
                                    <input id="mainTitleInputModal" type="text" placeholder="e.g. Machine Learning Overview"
                                        className={styles.textInput} value={currentSummaryTitle} onChange={(e) => setCurrentSummaryTitle(e.target.value)}/>
                                    
                                    <label htmlFor="numParasInputModal" className={styles.modalLabel}>
                                        {numParagraphsLabelText}
                                        <span className={styles.hintText}>{numParagraphsHintText}</span>
                                    </label>
                                    <input 
                                        id="numParasInputModal" type="number" 
                                        min={isPptModeActive ? numParagraphsMinVal + FIXED_SLIDES_COUNT : numParagraphsMinVal} 
                                        max={isPptModeActive ? MAX_CONTENT_SLIDES_PPT + FIXED_SLIDES_COUNT : MAX_CONTENT_SLIDES_SUMMARY}
                                        value={totalSlidesDisplayValue}
                                        onChange={handleTotalSlidesInputChange} 
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
                                                    <label htmlFor="summaryStyleKeypoints">Bullets</label>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {actionChoice === "ppt" && (
                                        <>
                                            <h4 className={styles.modalSectionTitle}>Template & Branding:</h4>
                                            <div className={styles.templateOptionsContainer}>
                                                <button type="button" onClick={() => setShowTemplateChoiceModal(true)} className={`${styles.choiceButton} ${styles.fullWidthButton}`}>
                                                    🎨 Choose Predefined Template
                                                </button>
                                                <div className={styles.selectedTemplateInfo}>
                                                    <strong>Current:</strong> {' '}
                                                    {customTemplateFile ? customTemplateFile.name 
                                                      : (selectedPredefinedTemplate ? selectedPredefinedTemplate.name 
                                                        : (defaultPptCustomTemplateNameFromSettings ? `Default Custom: ${defaultPptCustomTemplateNameFromSettings}` : 'Default Theme'))}
                                                </div>
                                                
                                                <div className={styles.customTemplateUpload}>
                                                    <label htmlFor="customTemplateFileModal" className={styles.modalLabelInline}>Upload Custom (.pptx, .potx):</label>
                                                    <input type="file" id="customTemplateFileModal" ref={customTemplateInputRef} accept=".pptx,.potx" onChange={handleCustomTemplateFileChange} className={styles.fileInputSmall} />
                                                </div>

                                                <div className={styles.customTemplateUpload} style={{marginTop: '10px'}}>
                                                    <label htmlFor="customLogoFileModal" className={styles.modalLabelInline}>Upload Logo (max 5MB):</label>
                                                    <input type="file" id="customLogoFileModal" ref={customLogoInputRef} accept="image/*" onChange={handleCustomLogoFileChange} className={styles.fileInputSmall} />
                                                    {customLogoFile ? <span className={styles.fileNameChip}>{customLogoFile.name}</span> : (defaultPptLogoNameFromSettings && <span className={styles.fileNameChip}>Default: {defaultPptLogoNameFromSettings}</span>) }
                                                </div>
                                                <div className={styles.customTemplateUpload}> {/* Changed to standard settingItem for consistency */}
                                                    <label htmlFor="pptLogoPos" className={styles.modalLabelInline}>Logo Position:</label>
                                                    <select id="pptLogoPos" value={pptLogoPosition} onChange={(e) => setPptLogoPosition(e.target.value)} className={styles.formSelectSmall}>
                                                        <option value="top_left">Top Left</option>
                                                        <option value="top_right">Top Right</option>
                                                    </select>
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
                                                        <input type="text" id="footerTextHFInputModal" value={footerTextHF} onChange={(e) => setFooterTextHF(e.target.value)} placeholder="Custom footer text" className={`${styles.textInput} ${styles.pptFooterInputLarge}`}/>
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
                                        <button type="button" onClick={resetAllStates} className={styles.closeButton}>
                                            Cancel & Clear All
                                        </button>
                                        <button type="button" onClick={handlePrimaryAction} className={styles.uploadButton} disabled={loading || loadingHint}>
                                            {loading ? 'Processing...' : (actionChoice === "summary" ? 'Generate Summary' : '📊 Generate PPT')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                 {showTemplateChoiceModal && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modalContent} ${styles.templateChoiceModal}`}>
                            <h3 className={styles.modalTitle}>Choose a Template</h3>
                            <div className={styles.templateGrid}>
                                {availableTemplates.map(template => (
                                    <div 
                                        key={template.id} 
                                        className={`${styles.templateCard} ${selectedPredefinedTemplate?.id === template.id ? styles.selected : ''}`}
                                        onClick={() => {
                                            setSelectedPredefinedTemplate(template);
                                            setCustomTemplateFile(null); 
                                            if (customTemplateInputRef.current) customTemplateInputRef.current.value = null;
                                            setShowTemplateChoiceModal(false);
                                        }}
                                    >
                                        <div className={styles.templatePreviewPlaceholder} style={template.previewSrc ? { backgroundImage: `url(${template.previewSrc})` } : { /* inline style for placeholder */ }}>
                                          {!template.previewSrc && template.name}
                                        </div>
                                        <div className={styles.templateName}>{template.name}</div>
                                        {selectedPredefinedTemplate?.id === template.id && (
                                            <div className={styles.selectedTextMarker}>Selected</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.modalButtonContainer} style={{justifyContent: 'flex-end'}}>
                                <button type="button" onClick={() => setShowTemplateChoiceModal(false)} className={styles.closeButton}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {showSummaryDownloadOptionsModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{maxWidth: '650px'}}>
                            <h3 className={styles.modalTitle}> Summary Download Options (DOCX)</h3>
                            
                            <label htmlFor="summaryHeaderText" className={styles.modalLabel}>Header Text (Top of Page):</label>
                            <input id="summaryHeaderText" type="text" placeholder="e.g., Confidential Report" className={styles.textInput} value={summaryDownloadOptions.headerText} onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerText: e.target.value})}/>
                            
                            <label className={styles.modalLabel} style={{marginTop: '15px'}}>Header Position:</label>
                            <div className={styles.radioGroupContainer} style={{flexDirection: 'row', gap: '20px', marginBottom: '20px', justifyContent: 'flex-start'}}>
                                <div className={styles.radioOption}>
                                    <input type="radio" id="headerPosLeft" name="headerPosition" value="left" checked={summaryDownloadOptions.headerPosition === 'left'} onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerPosition: e.target.value})} />
                                    <label htmlFor="headerPosLeft">Left</label>
                                </div>
                                <div className={styles.radioOption}>
                                     <input type="radio" id="headerPosCenter" name="headerPosition" value="center" checked={summaryDownloadOptions.headerPosition === 'center'} onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerPosition: e.target.value})} />
                                     <label htmlFor="headerPosCenter">Center</label>
                                </div>
                                <div className={styles.radioOption}>
                                    <input type="radio" id="headerPosRight" name="headerPosition" value="right" checked={summaryDownloadOptions.headerPosition === 'right'} onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, headerPosition: e.target.value})} />
                                    <label htmlFor="headerPosRight">Right</label>
                                </div>
                            </div>

                            <label htmlFor="summaryFooterText" className={styles.modalLabel}>Footer Text (Bottom-Left):</label>
                            <input id="summaryFooterText" type="text" placeholder="e.g., Company Name" className={styles.textInput} value={summaryDownloadOptions.footerText} onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, footerText: e.target.value})}/>
                             <div className={styles.hfCheckboxGroup} style={{marginTop: '15px', marginBottom: '25px', textAlign: 'left'}}>
                                <input type="checkbox" id="summaryIncludePageNum" checked={summaryDownloadOptions.includePageNumber} onChange={(e) => setSummaryDownloadOptions({...summaryDownloadOptions, includePageNumber: e.target.checked})} />
                                <label htmlFor="summaryIncludePageNum">Include Page Number (Bottom-Right)</label>
                            </div>

                            <div className={styles.modalButtonContainer}>
                                <button type="button" onClick={() => setShowSummaryDownloadOptionsModal(false)} className={styles.closeButton}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleConfirmSummaryDownload} className={styles.uploadButton} disabled={loading}>
                                    {loading ? ' Downloading...' : ' Download as DOCX'}
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
                             <button type="button" onClick={handleDownloadSummaryClick} className={styles.actionButtonSecondary} disabled={loading}>
                                📥 Download Summary
                            </button>
                            {showGeneratePPTFromSummaryButton && (
                                <button type="button" onClick={handleGeneratePPTFromSummaryClick} className={styles.actionButton} disabled={loading}>
                                     📊 Generate PPT from this Summary
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