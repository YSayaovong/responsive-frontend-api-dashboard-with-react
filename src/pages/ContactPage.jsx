// src/pages/ContactPage.jsx
import React from "react";

function ContactPage() {
  return (
    <div>
      <section className="page-section">
        <div className="page-section-inner">
          <h1 className="section-title">Contact</h1>
          <p className="section-text">
            Have a fleet, marketplace, or dealership? Send us a message and the
            Blinker team will follow up.
          </p>

          <form
            className="contact-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="form-row">
              <label>
                Name
                <input type="text" placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" placeholder="you@example.com" />
              </label>
            </div>
            <label>
              Phone Number
              <input type="text" placeholder="Your phone number" />
            </label>
            <label>
              Message
              <textarea
                rows="4"
                placeholder="Send us a messssage and we'll get back to you as soon as we can. Let us help you find your next car!"
              />
            </label>
            <button type="submit" className="primary-btn">
              Submit
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
