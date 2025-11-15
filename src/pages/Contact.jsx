// src/pages/Contact.jsx

export default function Contact() {
  return (
    <main className="container section section--center">
      <h1>Contact us</h1>
      <p className="muted">
        Tell us about your needs and we’ll get back to you shortly.
      </p>

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Thanks — we will be in touch.");
        }}
      >
        <div className="grid grid--two">
          <label>
            First name
            <input required />
          </label>
          <label>
            Last name
            <input required />
          </label>
        </div>

        <label>
          Work email
          <input type="email" required />
        </label>

        <label>
          Company
          <input />
        </label>

        <label>
          Message
          <textarea rows="5" />
        </label>

        <button className="btn btn--primary">Send</button>
      </form>
    </main>
  );
}
