// src/pages/Upload.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';

// Reuse the same templates array for lookup
const templates = [
  {
    id: 'corporate',
    name: 'Corporate',
    image: '/templates/corporate.png',
    description: 'For business & reports'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    image: '/templates/minimal.png',
    description: 'Clean & simple layouts'
  },
  {
    id: 'techy',
    name: 'Techy',
    image: '/templates/techy.png',
    description: 'Modern & tech-oriented'
  },
  {
    id: 'education',
    name: 'Education',
    image: '/templates/education.png',
    description: 'For academic content'
  }
];

const Upload = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedTemplateId = searchParams.get('template');

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  if (!selectedTemplate) {
    return <p className="text-center mt-10 text-red-600">Template not found ❗</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-center mb-6">
        You selected: {selectedTemplate.name}
      </h2>

      <img
        src={selectedTemplate.image}
        alt={selectedTemplate.name}
        className="w-full h-60 object-cover rounded shadow mb-4"
      />

      <p className="text-center text-gray-600">{selectedTemplate.description}</p>

      {/* Upload logic below this if needed */}
    </div>
  );
};

export default Upload;

