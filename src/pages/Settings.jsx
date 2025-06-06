// src/pages/Settings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import Sidebar from '../components/sidebar';

const Settings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        summary: {
            includeDate: false,
            defaultLogo: null, // Stores filename from server
            logoPosition: 'top_left',
            headerText: '',
            headerPosition: 'left',
            footerText: '',
            includePageNumber: false,
        },
        ppt: {
            includeDate: false,
            defaultLogo: null, // Stores filename from server
            logoPosition: 'top_left',
            footerText: '',
            templateId: 'Temp.pptx', // Default template ID
            customTemplate: null, // Stores filename of custom template from server
            includePageNumber: false,
        },
    });
    
    // State to hold the actual file objects before they are uploaded
    const [filesToUpload, setFilesToUpload] = useState({
        summaryLogo: null,
        pptLogo: null,
        pptTemplate: null,
    });

    const [successMessage, setSuccessMessage] = useState('');

    const availableTemplates = [
        { id: 'Temp.pptx', name: 'Default Theme' },
        { id: 'ModernDark.pptx', name: 'Modern Dark' },
        { id: 'CorporateBlue.pptx', name: 'Corporate Blue' },
        { id: 'VibrantGradient.pptx', name: 'Vibrant Gradient' },
        { id: 'MinimalistLight.pptx', name: 'Minimalist Light' },
        { id: 'GeometricGreen.pptx', name: 'Geometric Green' },
        { id: 'ProfessionalGray.pptx', name: 'Professional Gray' },
        { id: 'SunnyOrange.pptx', name: 'Sunny Orange' },
        { id: 'ElegantPurple.pptx', name: 'Elegant Purple'},
        { id: 'UniqueMatch.pptx', name: 'Unique Match'},
    ];

    useEffect(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                // Merge saved settings with defaults to ensure all keys exist
                setSettings(prev => ({
                    summary: { ...prev.summary, ...parsedSettings.summary },
                    ppt: { ...prev.ppt, ...parsedSettings.ppt },
                }));
            } catch (error) {
                console.error("Failed to parse settings from localStorage", error);
            }
        }
    }, []);

    const handleSave = useCallback(async () => {
        setSuccessMessage('Saving...');
        try {
            // Create a mutable copy of settings to update with new filenames after upload.
            let updatedSettings = JSON.parse(JSON.stringify(settings));

            const uploadFile = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                
                // Assumes backend is running on this address
                const response = await fetch('http://127.0.0.1:8000/upload-default-asset/', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Upload failed with no specific error message.' }));
                    throw new Error(errorData.detail || `Failed to upload ${file.name}`);
                }
                const result = await response.json();
                return result.filename; // The backend returns the saved filename
            };

            // Sequentially upload files and update the settings object.
            if (filesToUpload.summaryLogo) {
                const savedFilename = await uploadFile(filesToUpload.summaryLogo);
                updatedSettings.summary.defaultLogo = savedFilename;
            }
            if (filesToUpload.pptLogo) {
                const savedFilename = await uploadFile(filesToUpload.pptLogo);
                updatedSettings.ppt.defaultLogo = savedFilename;
            }
            if (filesToUpload.pptTemplate) {
                const savedFilename = await uploadFile(filesToUpload.pptTemplate);
                updatedSettings.ppt.customTemplate = savedFilename;
            }

            // Save the final, updated settings object to localStorage.
            localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
            setSettings(updatedSettings); // Sync the component's main state.
            
            // Reset the queue of files to upload.
            setFilesToUpload({ summaryLogo: null, pptLogo: null, pptTemplate: null });

            setSuccessMessage('✅ Settings saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error("Failed to save settings or upload file:", error);
            setSuccessMessage(`❌ Error: ${error.message}`);
            setTimeout(() => setSuccessMessage(''), 5000); // Show error for longer
        }
    }, [settings, filesToUpload]);

    const handleSettingChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };
    
    const handleFileChange = (section, key, file) => {
        if (!file) return;
        
        // Determine which file state to update based on section and key
        let fileStateKey = '';
        if (section === 'summary' && key === 'defaultLogo') fileStateKey = 'summaryLogo';
        else if (section === 'ppt' && key === 'defaultLogo') fileStateKey = 'pptLogo';
        else if (section === 'ppt' && key === 'customTemplate') fileStateKey = 'pptTemplate';

        if (fileStateKey) {
            setFilesToUpload(prev => ({ ...prev, [fileStateKey]: file }));
        }
        
        // Update the main settings object to show the new filename in the UI instantly.
        // This will be replaced by the server-provided name upon saving.
        handleSettingChange(section, key, file.name);
    };

    return (
        <div className={styles.settingsPage}>
            <Sidebar />
            <div className={styles.settingsWrapper}>
              
                {successMessage && (
                    <div className={styles.successPopup}>{successMessage}</div>
                )}

                <div className={styles.settingsGrid}>
                    
                    {/* Summary Settings Card (DOCX) */}
                    <div className={styles.settingsCard}>
                        <h2 className={styles.settingsCardTitle}>Summary Settings (DOCX)</h2>
                        
                        <div className={styles.settingItem}>
                            <label>Default Logo for Summary</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange('summary', 'defaultLogo', e.target.files[0])} 
                                className={styles.fileInput} 
                            />
                            {settings.summary.defaultLogo && <span className={styles.fileName}>Selected: {settings.summary.defaultLogo}</span>}
                        </div>
                        <div className={styles.settingItem}>
                            <label>Logo Position</label>
                            <select 
                                className={styles.formSelect} 
                                value={settings.summary.logoPosition} 
                                onChange={(e) => handleSettingChange('summary', 'logoPosition', e.target.value)}
                            >
                                <option value="top_left">Top Left</option>
                                <option value="top_right">Top Right</option>
                            </select>
                        </div>
                        <hr className={styles.dividerHr} />

                        <h4 className={styles.subHeader}>Content Options:</h4>
                        <div className={styles.settingItem}>
                            <label>Header Text:</label>
                            <input 
                                className={styles.formInput} 
                                type="text" 
                                placeholder="e.g., Confidential Report" 
                                value={settings.summary.headerText} 
                                onChange={(e) => handleSettingChange('summary', 'headerText', e.target.value)} 
                            />
                        </div>
                         <div className={styles.settingItem}>
                            <label>Header Position:</label>
                            <div className={styles.radioGroup}>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="summaryHeaderPos" 
                                        value="left" 
                                        checked={settings.summary.headerPosition === 'left'} 
                                        onChange={(e) => handleSettingChange('summary', 'headerPosition', e.target.value)} 
                                    /> Left
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="summaryHeaderPos" 
                                        value="center" 
                                        checked={settings.summary.headerPosition === 'center'} 
                                        onChange={(e) => handleSettingChange('summary', 'headerPosition', e.target.value)} 
                                    /> Center
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="summaryHeaderPos" 
                                        value="right" 
                                        checked={settings.summary.headerPosition === 'right'} 
                                        onChange={(e) => handleSettingChange('summary', 'headerPosition', e.target.value)} 
                                    /> Right
                                </label>
                            </div>
                        </div>
                        <div className={styles.settingItem}>
                            <label>Footer Text:</label>
                            <input 
                                className={styles.formInput} 
                                type="text" 
                                placeholder="e.g., Company Name" 
                                value={settings.summary.footerText} 
                                onChange={(e) => handleSettingChange('summary', 'footerText', e.target.value)} 
                            />
                        </div>
                        <div className={styles.checkboxItem}>
                           <input 
                                type="checkbox" 
                                id="summaryPageNum" 
                                checked={settings.summary.includePageNumber} 
                                onChange={(e) => handleSettingChange('summary', 'includePageNumber', e.target.checked)} 
                            />
                           <label htmlFor='summaryPageNum'>Include Page Number</label>
                        </div>
                         <div className={styles.checkboxItem}>
                            <input 
                                type="checkbox" 
                                id="summaryDate" 
                                checked={settings.summary.includeDate} 
                                onChange={(e) => handleSettingChange('summary', 'includeDate', e.target.checked)} 
                            />
                            <label htmlFor='summaryDate'>Include Date</label>
                        </div>
                    </div>

                    {/* PPT Settings Card */}
                    <div className={styles.settingsCard}>
                        <h2 className={styles.settingsCardTitle}>PPT Settings</h2>

                        <div className={styles.settingItem}>
                            <label>Default Theme</label>
                            <select 
                                className={styles.formSelect} 
                                value={settings.ppt.templateId} 
                                onChange={(e) => handleSettingChange('ppt', 'templateId', e.target.value)}
                            >
                                {availableTemplates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.settingItem}>
                           <label>Default Custom Template</label>
                           <input 
                                type="file" 
                                accept=".pptx,.potx" 
                                onChange={(e) => handleFileChange('ppt', 'customTemplate', e.target.files[0])} 
                                className={styles.fileInput} 
                            />
                           {settings.ppt.customTemplate && <span className={styles.fileName}>Selected: {settings.ppt.customTemplate}</span>}
                        </div>
                        <hr className={styles.dividerHr} />
                        <div className={styles.settingItem}>
                            <label>Default Logo</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange('ppt', 'defaultLogo', e.target.files[0])} 
                                className={styles.fileInput} 
                            />
                             {settings.ppt.defaultLogo && <span className={styles.fileName}>Selected: {settings.ppt.defaultLogo}</span>}
                        </div>
                        <div className={styles.settingItem}>
                            <label>Logo Position</label>
                            <select 
                                className={styles.formSelect} 
                                value={settings.ppt.logoPosition} 
                                onChange={(e) => handleSettingChange('ppt', 'logoPosition', e.target.value)}
                            >
                                <option value="top_left">Top Left</option>
                                <option value="top_right">Top Right</option>
                            </select>
                        </div>
                        <hr className={styles.dividerHr} />
                        <h4 className={styles.subHeader}>Footer Options:</h4>
                        <div className={styles.checkboxItem}>
                            <input 
                                type="checkbox" 
                                id="pptDate" 
                                checked={settings.ppt.includeDate} 
                                onChange={(e) => handleSettingChange('ppt', 'includeDate', e.target.checked)} 
                            />
                            <label htmlFor='pptDate'>Include Date</label>
                        </div>
                        <div className={styles.checkboxItem}>
                            <input 
                                type="checkbox" 
                                id="pptPageNum" 
                                checked={settings.ppt.includePageNumber} 
                                onChange={(e) => handleSettingChange('ppt', 'includePageNumber', e.target.checked)} 
                            />
                             <label htmlFor='pptPageNum'>Include Page Number</label>
                        </div>
                        <div className={styles.settingItem}>
                            <label>Footer Text</label>
                            <input 
                                className={styles.formInput} 
                                type="text" 
                                placeholder="e.g., © 2025 MyCompany" 
                                value={settings.ppt.footerText} 
                                onChange={(e) => handleSettingChange('ppt', 'footerText', e.target.value)} 
                            />
                        </div>
                        
                    </div>
                </div>

                <div className={styles.actionsContainer}>
                    <button onClick={handleSave} className={`${styles.actionButton} ${styles.saveButton}`}>Save All Settings</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;