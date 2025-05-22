import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">DocuApp</Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/aboutus" className="nav-link">About Us</Link></li>
        <li><Link to="/pricing" className="nav-link">Pricing</Link></li>
        <li><Link to="/contactus" className="nav-link">Contact Us</Link></li>
      </ul>

      <div className="nav-buttons">
        {isLoggedIn ? (
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
              <span className="user-name" style={{ fontWeight: 500 }}>{user.name}</span>
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

