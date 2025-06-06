import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Navbar2 from './components/Navbar2';
import HeroSection from './components/HeroSection';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import GeneratePPT from './pages/GeneratePPT';
import Upload from './pages/Upload';
import MyWork from './pages/MyWork';
import ContactUs from './components/ContactUs';
import Pricing from './components/Pricing';
import Aboutus from './components/Aboutus';
import Inputpage from './pages/Inputpage';
import PPTPreview from './pages/PPTPreview'; 
import ForgotPassword from './pages/ForgotPassword'; // Adjust path
import ResetPassword from './pages/ResetPassword'; 
import Settings from './pages/Settings'; // Adjust path


const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

const RequireAuth = ({ children }) => {
  const location = useLocation();
  return isAuthenticated()
    ? children
    : <Navigate to="/signin" state={{ from: location }} replace />;
};

const Layout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const showMainNavbar = currentPath !== '/generate';
  const showGenerateNavbar = currentPath === '/generate';

  return (
    <>
      {showMainNavbar && <Navbar />}
      {showGenerateNavbar && <Navbar2 />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/generate" element={<GeneratePPT />} />
        
        <Route path="/upload" element={<Upload />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path="/input" element={<Inputpage />} />
        <Route path="/preview-ppt" element={<PPTPreview />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path ="/settings" element={<Settings />} />

       
        <Route
          path="/my-work"
          element={
            <RequireAuth>
              <MyWork />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default Layout;
