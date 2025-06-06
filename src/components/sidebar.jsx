// src/components/sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// This path now correctly points from 'components' to the 'pages' folder for styles
import styles from "../pages/GeneratePPT.module.css"; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to apply 'active' class to the current page link
  const getClassName = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul>
          <li className={getClassName('/my-work')} onClick={() => navigate('/my-work')}> MyWork</li>
          <li className={getClassName('/')} onClick={() => navigate('/')}> Home</li>
          <li className={getClassName('/generate')} onClick={() => navigate('/generate')}> Summary/PPT</li>
          <li className={getClassName('/pricing')} onClick={() => navigate('/pricing')}> Pricing</li>
          <li className={getClassName('/aboutus')} onClick={() => navigate('/aboutus')}> About Us</li>
          <li className={getClassName('/contactus')} onClick={() => navigate('/contactus')}> Contact us</li>
          <li className={getClassName('/settings')} onClick={() => navigate('/settings')}> Settings</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;