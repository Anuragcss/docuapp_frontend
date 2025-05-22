import React from "react";
import "./ContactUs.css";
import envelope from "../assets/envelope.jpg"; // make sure you have this image or replace with your own

const ContactUs = () => {
  return (
    <div className="contact-container">
      <div className="contact-box">
        <div className="contact-left">
          <img src={envelope} alt="Envelope Icon" className="contact-image" />
          <p>
            If you have questions or just want to get in touch, use the form below.
            We look forward to hearing from you!
          </p>
        </div>
        <div className="contact-right">
          <h2>Contact Us</h2>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="User Email" required />
            <textarea placeholder="Message" rows="6" required></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
