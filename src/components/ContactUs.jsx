import React, { useState } from "react";
import "./ContactUs.css";
import envelope from "../assets/envelope.jpg";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("http://localhost:8000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("✅ Server response:", data);

      if (response.ok) {
        setStatus(data.message);
        setFormData({ name: "", email: "", message: "" });
      } else {
        // error from backend will be in "detail"
        setStatus("Failed to send. Server said: " + (data.detail || data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      setStatus("Network/server error ❌");
    }
  };

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
          <form onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            <textarea name="message" placeholder="Message" rows="6" value={formData.message} onChange={handleChange} required />
            <button type="submit">Send</button>
          </form>
          {status && <p>{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
