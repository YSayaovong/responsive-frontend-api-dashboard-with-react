// src/components/Hero.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const term = searchTerm.trim();

    // If user typed something, send it as query param
    if (term) {
      navigate(`/find-your-car?query=${encodeURIComponent(term)}`);
    } else {
      // No term -> just go to full list
      navigate("/find-your-car");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <section className="hero">
      <div className="hero-inner">
        <p className="hero-badge">Australia • Car subscriptions</p>

        <h1 className="hero-title">
          Australia's most awarded
          <br />
          car subscription platform
        </h1>

        <p className="hero-subtitle">FIND YOUR DREAM CAR WITH BLINKER</p>

        <div className="hero-search-wrapper">
          <input
            className="hero-search-input"
            type="text"
            placeholder="Search by Model, Make or Keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="hero-search-button"
            type="button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="hero-graphic">
          <div className="hero-block hero-block-small" />
          <div className="hero-block hero-block-main" />
          <div className="hero-block hero-block-tall" />
          <div className="hero-baseline" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
