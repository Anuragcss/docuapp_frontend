import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar2.css";
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Detect route change or login state changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <nav className="navbar">
      {/* Logo on the left */}
      <div className="nav-logo">
        <Link to="/">DocuApp</Link>
      </div>


      {/* Right Buttons */}
      <div className="nav-buttons">
        {isLoggedIn && user ? (
          <div className="profile-wrapper" ref={dropdownRef}>
            <div
              className="user-info"
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {user.picture && (
                <img
                  src={user.picture}
                  alt="avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              )}
              <span className="user-name" style={{ fontWeight: 500 }}>{user.name || user.email}</span>
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown-wrapper">
                <ProfileDropdown onClose={() => setDropdownOpen(false)} />
              </div>
            )}
          </div>
        ) : (
          <>
            {location.pathname !== '/signin' && (
              <Link to="/signin"><button className="btn-light">Sign in</button></Link>
            )}
            {location.pathname !== '/signup' && (
              <Link to="/signup"><button className="btn-primary">Sign up</button></Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
