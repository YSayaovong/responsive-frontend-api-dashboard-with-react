// src/components/Hero.jsx
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero hero--plain">
      <div className="container hero__content hero__content--center">
        <h1 className="hero__title">
          Australia's most awarded <br /> car subscription platform
        </h1>

        <h2 className="hero__subtitle">
          FIND YOUR DREAM CAR WITH <span className="accent">BLINKER</span>
        </h2>

        <form
          id="home-search-form"
          className="search search--large"
          action="/browse"
        >
          <input
            id="home-search-input"
            name="q"
            className="search__input"
            placeholder="Search by Model, Make or Keyword"
          />

          <button className="search__btn" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79L20 21.5 21.5 20 15.5 14zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>

        {/* Illustration */}
        <div className="city-illustration">
          <div className="sun"></div>
          <div className="birds"></div>

          <div className="buildings">
            <div className="house"></div>
            <div className="tower tall"></div>
            <div className="tower"></div>
          </div>

          <div className="trees"></div>

          {/* Car Animation */}
          <div id="hero-car" className="car car--hidden">
            <svg viewBox="0 0 200 60" width="200" height="60">
              <path
                d="M10,40 L30,30 L90,30 L120,20 L160,20 L185,35 L190,40 L190,45 L10,45 Z"
                fill="#4b1fc3"
              />
              <circle cx="55" cy="45" r="10" fill="#111827" />
              <circle cx="150" cy="45" r="10" fill="#111827" />
              <rect x="95" y="22" width="20" height="8" fill="#87e6ef" />
              <rect x="120" y="20" width="28" height="10" fill="#87e6ef" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
