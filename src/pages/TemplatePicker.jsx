import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './TemplatePicker.css';
import styles from '../pages/GeneratePPT.module.css'; // To reuse sidebar styles

const templates = [
  { id: 'corporate', name: 'Corporate', image: '/templates/corporate.png', description: 'For business & reports' },
  { id: 'minimal', name: 'Minimal', image: '/templates/minimal.png', description: 'Clean & simple layouts' },
  { id: 'techy', name: 'Techy', image: '/templates/techy.png', description: 'Modern & tech-oriented' },
  { id: 'creative', name: 'Creative', image: 'docuapp_backend/src/assets/templates/Temp.pptx', description: 'Artistic & vibrant designs' },
];

const TemplatePicker = () => {
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const handleUseTemplate = () => {
    const isLoggedIn = !!localStorage.getItem('authToken');

    if (!isLoggedIn) {
      alert('Please sign in to use a template!');
      navigate('/signin');
      return;
    }

    if (!selectedId) {
      alert('Please select a template!');
      return;
    }

    navigate(`/upload?template=${selectedId}`);
  };

  return (
    <div style={{ display: 'flex' }}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <ul>
            <li onClick={() => navigate('/my-work')}> MyWork</li>
            <li onClick={() => navigate('/')}> Home</li>
            <li className={styles.active} onClick={() => navigate('/template')}> Templates</li>
            <li onClick={() => navigate('/generate')}> Summary/PPT</li>
            <li onClick={() => navigate('/pricing')}> Pricing</li>
            <li onClick={() => navigate('/aboutus')}> About Us</li>
            <li onClick={() => navigate('/contactus')}> Contact us</li>
          </ul>
        </nav>
      </aside>

      <div className="max-w-6xl mx-auto px-4 py-8 template-picker-container" style={{ flex: 1 }}>
        <h1 className="text-3xl font-bold mb-6 text-center template-picker-title">
          Choose a Template
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 template-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-card cursor-pointer rounded-lg border-2 p-2 hover:shadow-lg transition ${
                selectedId === template.id ? 'selected border-blue-500' : 'border-gray-200'
              }`}
              onClick={() => setSelectedId(template.id)}
            >
              <img
                src={template.image}
                alt={template.name}
                className="template-image w-full h-40 object-cover rounded"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x160?text=Image+Unavailable";
                }}
              />
              <div className="template-name mt-2 text-center">
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleUseTemplate}
            className="use-template-button bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
          >
            Use this Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePicker;
