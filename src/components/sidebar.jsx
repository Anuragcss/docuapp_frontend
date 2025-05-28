// Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../pages/GeneratePPT.module.css";


const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul>
          <li className={styles.active} onClick={() => navigate('/my-work')}> MyWork</li>
          <li onClick={() => navigate('/')}> Home</li>
          <li onClick={() => navigate('/template')}> Templates</li>
          <li onClick={() => navigate('/generate')}> Summary/PPT</li>
          <li onClick={() => navigate('/pricing')}> Pricing</li>
          <li onClick={() => navigate('/aboutus')}> About Us</li>
          <li onClick={() => navigate('/contactus')}> Contact us</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
