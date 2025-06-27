// src/pages/Settings.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import Sidebar from '../components/sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "http://127.0.0.1:8000";

const Settings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
    
    const customTemplateInputRef = useRef(null);

    const [settings, setSettings] = useState({
        ppt_template_id: 'none',
        ppt_include_date: false,
        ppt_include_page_number: false,
        ppt_footer_text: '',
        ppt_logo_position: 'top_left',
        default_ppt_logo_url: null,
        summary_include_date: false,
        summary_include_page_number: false,
        summary_header_text: '',
        summary_footer_text: '',
        summary_logo_position: 'top_left',
        summary_header_position: 'left',
        default_summary_logo_url: null,
        default_ppt_custom_template: null,
    });
    
    const [filesToUpload, setFilesToUpload] = useState({
        ppt_logo: null,
        summary_logo: null,
        ppt_template_file: null,
    });
    
    const availableTemplates = [ 
        { id: 'none', name: 'None' },
        { id: 'Temp.pptx', name: 'Green Theme' },
        { id: 'ModernDark.pptx', name: 'Modern Dark' },
        { id: 'CorporateBlue.pptx', name: 'Corporate Blue' },
        { id: 'VibrantGradient.pptx', name: 'Vibrant Gradient' },
        { id: 'MinimalistLight.pptx', name: 'Minimalist Light' },
        { id: 'GeometricGreen.pptx', name: 'Geometric Green' },
        { id: 'ProfessionalGray.pptx', name: 'Professional Gray' },
        { id: 'SunnyOrange.pptx', name: 'Sunny Orange' },
        { id: 'ElegantPurple.pptx', name: 'Elegant Purple' },
        { id: 'UniqueMatch.pptx', name: 'Unique Match' },
    ];
    
    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error("Authentication required. Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/settings/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Could not fetch settings." }));
                throw new Error(errorData.detail);
            }
            const data = await response.json();
            setSettings(prev => ({...prev, ...data}));
        } catch (error) {
            toast.error(`Failed to load settings: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleFileChange = (key, file) => {
        if (file) {
            if (key === 'ppt_template_file') {
                if (!file.name.endsWith('.pptx') && !file.name.endsWith('.potx')) {
                    toast.error("Invalid template file. Please select a .pptx or .potx file.");
                    if(customTemplateInputRef.current) customTemplateInputRef.current.value = null;
                    return;
                }
                handleSettingChange('ppt_template_id', 'none');
            }

            setFilesToUpload(prev => ({ ...prev, [key]: file }));

            if (key === 'ppt_logo' || key === 'summary_logo') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSettings(prev => ({ ...prev, [key === 'ppt_logo' ? 'default_ppt_logo_url' : 'default_summary_logo_url']: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error("Authentication token missing. Please log in again.");
            return;
        }

        const formData = new FormData();
        Object.keys(settings).forEach(key => {
            if (key !== 'default_ppt_logo_url' && key !== 'default_summary_logo_url' && key !== 'default_ppt_custom_template') {
                 if (key === 'ppt_template_id' && filesToUpload.ppt_template_file) {
                     formData.append('ppt_template_id', 'none');
                 } else {
                     formData.append(key, settings[key]);
                 }
            }
        });

        if (filesToUpload.ppt_logo) {
            formData.append('ppt_logo', filesToUpload.ppt_logo);
        }
        if (filesToUpload.summary_logo) {
            formData.append('summary_logo', filesToUpload.summary_logo);
        }
        if (filesToUpload.ppt_template_file) {
            formData.append('ppt_template_file', filesToUpload.ppt_template_file);
        }

        const toastId = toast.loading("Saving settings...");
        try {
            const response = await fetch(`${API_BASE_URL}/settings/me`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Failed to save settings.");
            }
            
            toast.update(toastId, { render: "Settings saved successfully! ✅", type: "success", isLoading: false, autoClose: 3000 });
            setSettings(prev => ({ ...prev, ...data })); 
            
            setFilesToUpload({ ppt_logo: null, summary_logo: null, ppt_template_file: null });
            if (customTemplateInputRef.current) customTemplateInputRef.current.value = null;

        } catch (error) {
            toast.update(toastId, { render: `Error: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };
    
    const getLogoUrl = (urlPath) => {
        if (!urlPath) return null;
        if (urlPath.startsWith('data:')) return urlPath;
        const pathPrefix = urlPath.startsWith('/') ? '' : '/static-user-assets/';
        return `${API_BASE_URL}${pathPrefix}${urlPath}`;
    };

    const handleTemplateSelect = (templateId) => {
        handleSettingChange('ppt_template_id', templateId);
        if (templateId !== 'none') {
            setFilesToUpload(prev => ({ ...prev, ppt_template_file: null }));
            if (customTemplateInputRef.current) {
                customTemplateInputRef.current.value = null;
            }
        }
    };
    
    if (isLoading) {
        return <div className={styles.loading}>Loading settings...</div>;
    }

    const getTemplateDisplayName = () => {
        if (settings.ppt_template_id === 'none' && settings.default_ppt_custom_template) {
            return `Custom: ${settings.default_ppt_custom_template}`;
        }
        const predefined = availableTemplates.find(t => t.id === settings.ppt_template_id);
        return predefined ? predefined.name : 'None';
    };


    return (
        <div className={styles.settingsPage}>
            <Sidebar />
            <div className={styles.settingsWrapper}>
                <p>Customize your default options for generating summaries and presentations.</p>
                
                <div className={styles.settingsGrid}>
                    <div className={styles.settingsCard}>
                        <h2 className={styles.settingsCardTitle}>PPT Settings</h2>
                        
                        <div className={styles.settingItem}>
                            <label>Default Theme</label>
                            <div className={styles.templateChooser}>
                                <button type="button" onClick={() => setIsTemplatePanelOpen(true)} className={styles.chooseTemplateButton}>
                                    Choose Theme
                                </button>
                                <span className={styles.currentTemplateName}>
                                    Current: {getTemplateDisplayName()}
                                </span>
                            </div>
                        </div>

                        <div className={styles.settingItem}>
                            <label>Default Custom Template (.pptx/.potx)</label>
                            <input ref={customTemplateInputRef} type="file" accept=".pptx,.potx" onChange={(e) => handleFileChange('ppt_template_file', e.target.files[0])} className={styles.fileInput} />
                            {filesToUpload.ppt_template_file ? (
                                <div className={styles.fileName}>Staged: {filesToUpload.ppt_template_file.name}</div>
                            ) : (
                                settings.default_ppt_custom_template && <div className={styles.fileName}>Saved: {settings.default_ppt_custom_template}</div>
                            )}
                        </div>

                        <div className={styles.settingItem}>
                            <label>Default Logo</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange('ppt_logo', e.target.files[0])} className={styles.fileInput} />
                            {getLogoUrl(settings.default_ppt_logo_url) && <img src={getLogoUrl(settings.default_ppt_logo_url)} alt="PPT Logo Preview" className={styles.logoPreview} />}
                        </div>
                        <div className={styles.settingItem}>
                            <label>Logo Position</label>
                            <select className={styles.formSelect} value={settings.ppt_logo_position} onChange={(e) => handleSettingChange('ppt_logo_position', e.target.value)}>
                                <option value="top_left">Top Left</option>
                                <option value="top_right">Top Right</option>
                            </select>
                        </div>
                        <div className={styles.checkboxItem}>
                            <input type="checkbox" id="pptDate" checked={settings.ppt_include_date} onChange={(e) => handleSettingChange('ppt_include_date', e.target.checked)} />
                            <label htmlFor='pptDate'>Include Date</label>
                        </div>
                        <div className={styles.checkboxItem}>
                            <input type="checkbox" id="pptPageNum" checked={settings.ppt_include_page_number} onChange={(e) => handleSettingChange('ppt_include_page_number', e.target.checked)} />
                            <label htmlFor='pptPageNum'>Include Page Number</label>
                        </div>
                        <div className={styles.settingItem}>
                            <label>Footer Text</label>
                            <input className={styles.formInput} type="text" placeholder="e.g., © 2025 MyCompany" value={settings.ppt_footer_text} onChange={(e) => handleSettingChange('ppt_footer_text', e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.settingsCard}>
                        <h2 className={styles.settingsCardTitle}>Summary Settings (DOCX)</h2>
                        <div className={styles.settingItem}>
                            <label>Default Logo</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange('summary_logo', e.target.files[0])} className={styles.fileInput} />
                            {getLogoUrl(settings.default_summary_logo_url) && <img src={getLogoUrl(settings.default_summary_logo_url)} alt="Summary Logo Preview" className={styles.logoPreview} />}
                        </div>
                        <div className={styles.settingItem}>
                            <label>Logo Position</label>
                            <select className={styles.formSelect} value={settings.summary_logo_position} onChange={(e) => handleSettingChange('summary_logo_position', e.target.value)}>
                                <option value="top_left">Top Left</option>
                                <option value="top_right">Top Right</option>
                            </select>
                        </div>
                        <div className={styles.settingItem}>
                            <label>Header Text</label>
                            <input className={styles.formInput} type="text" placeholder="e.g., Confidential Report" value={settings.summary_header_text} onChange={(e) => handleSettingChange('summary_header_text', e.target.value)} />
                        </div>
                        <div className={styles.settingItem}>
                            <label>Header Position</label>
                            <select className={styles.formSelect} value={settings.summary_header_position} onChange={(e) => handleSettingChange('summary_header_position', e.target.value)}>
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div className={styles.settingItem}>
                            <label>Footer Text</label>
                            <input className={styles.formInput} type="text" placeholder="e.g., Company Name" value={settings.summary_footer_text} onChange={(e) => handleSettingChange('summary_footer_text', e.target.value)} />
                        </div>
                        <div className={styles.checkboxItem}>
                            <input type="checkbox" id="summaryDate" checked={settings.summary_include_date} onChange={(e) => handleSettingChange('summary_include_date', e.target.checked)} />
                            <label htmlFor='summaryDate'>Include Date</label>
                        </div>
                        <div className={styles.checkboxItem}>
                           <input type="checkbox" id="summaryPageNum" checked={settings.summary_include_page_number} onChange={(e) => handleSettingChange('summary_include_page_number', e.target.checked)} />
                           <label htmlFor='summaryPageNum'>Include Page Number</label>
                        </div>
                    </div>
                </div>

                <div className={styles.actionsContainer}>
                    <button onClick={handleSave} className={`${styles.actionButton} ${styles.saveButton}`}>Save All Settings</button>
                </div>
            </div>

            {isTemplatePanelOpen && (
                 <div className={styles.panelOverlay} onClick={() => setIsTemplatePanelOpen(false)}></div>
            )}
            <div className={`${styles.templatePanel} ${isTemplatePanelOpen ? styles.open : ''}`}>
                <h3 className={styles.templatePanelTitle}>Choose a Default Template</h3>
                <ul className={styles.templateList}>
                    {availableTemplates.map(template => (
                        <li 
                            key={template.id}
                            className={`${styles.templateListItem} ${settings.ppt_template_id === template.id ? styles.selected : ''}`}
                            onClick={() => handleTemplateSelect(template.id)}
                        >
                            {template.name}
                        </li>
                    ))}
                </ul>
                <div className={styles.templatePanelActions}>
                     <span className={styles.selectedStatus}>
                         Selected: {getTemplateDisplayName()}
                     </span>
                     <button className={styles.cancelButton} onClick={() => setIsTemplatePanelOpen(false)}>
                         Close
                     </button>
                </div>
            </div>
            
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default Settings;