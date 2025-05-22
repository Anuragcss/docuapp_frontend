// src/components/Aboutus.jsx
import React from "react";
import "./Aboutus.css";
import businessImg from "../assets/business.png";
import locationImg from "../assets/location.png"; // ⬅️ Add this import

const Aboutus = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Us</h1>
        <div className="underline" />
        <p>
          DocuApp is an intelligent tool that automates the creation of PowerPoint presentations.
          With just a few inputs, it generates structured slides based on your topic.
          It uses advanced natural language processing to summarize and format content.
          Great for students, professionals, and businesses who need fast, polished decks.
          AI PPT Maker can pull in data from text, web links, or uploaded documents.
          It ensures consistency in design, layout, and tone across slides.
          Time-saving, efficient, and incredibly user-friendly.
          Supports exporting to PowerPoint and PDF formats with one click.
          Custom themes and branding can be added easily.
          Ideal for meetings, pitches, reports, and educational use cases.
        </p>
      </section>

      <section className="about-cards">
        <div className="card" style={{ backgroundImage: `url(${businessImg})` }}>
          <div className="overlay">
          </div>
        </div>

        <div className="card" style={{ backgroundImage: `url(${locationImg})` }}>
          <div className="overlay">
          </div>
        </div>
      </section>
    </div>
  );
};

export default Aboutus;
