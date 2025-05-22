import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Inputpage.module.css';

const Inputpage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <ul>
          <li onClick={() => navigate('/my-work')} style={{ cursor: 'pointer' }}>📁 MyWork</li>
            <li>🏠 Home</li>
            <li onClick={() => navigate('/template')} style={{ cursor: 'pointer' }}>📄 Templates</li>
            <li onClick={() => navigate('/generate')} style={{ cursor: 'pointer' }}>🧠 Summary</li>

           
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.wrapper}>
        <header className={styles.header}>📘 Input Page</header>

        <main className={styles.content}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input type="text" placeholder="Enter Title" />
          </div>

          <div className={styles.formGroup}>
            <label>Summary Type</label>
            <select>
              <option>Brief</option>
              <option>Detailed</option>
              <option>Bullet Points</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Author Name</label>
            <input type="text" placeholder="Your Name" />
          </div>
        </main>

        <footer className={styles.footer}>
          <span>🧠 Powered by AI - Little A</span>
        </footer>
      </div>
    </div>
  );
};

export default Inputpage;


