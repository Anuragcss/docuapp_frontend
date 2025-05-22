import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onClose }) => {
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = () => {
    console.log('Profile updated:', userData);
    alert('Profile Updated (mock)');
    onClose();
  };

  const handleChangePassword = () => {
    console.log('Password changed:', userData);
    alert('Password Updated (mock)');
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    onClose();
    navigate('/');
  };

  const goToMyWork = () => {
    onClose();
    navigate('/my-work');
  };

  return (
    <div className="profile-dropdown">
      <h3>My Profile</h3>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={userData.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleChange}
      />
      <button onClick={handleUpdateProfile}>Update Profile</button>

      <hr style={{ margin: '10px 0' }} />

      <button
        className="mywork-button"
        onClick={goToMyWork}
      >
        My Work
      </button>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;


