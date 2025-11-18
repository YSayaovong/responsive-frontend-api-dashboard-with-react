// src/components/ModelsSection.jsx
import React, { useEffect, useState, useMemo } from "react";

const NHTSA_API =
  "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/honda?format=json";

// Primary image source: model-specific photos hosted on the web (Wikipedia etc.)
const MODEL_IMAGES = {
  accord:
    "https://upload.wikimedia.org/wikipedia/commons/2/2e/2018_Honda_Accord_EXL_front_5.13.18.jpg",
  civic:
    "https://upload.wikimedia.org/wikipedia/commons/5/54/2018_Honda_Civic_SR_VTEC_1.0_Front.jpg",
  "cr-v":
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/2018_Honda_CR-V_SR_iDTEC_1.6_Front.jpg",
  crv:
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/2018_Honda_CR-V_SR_iDTEC_1.6_Front.jpg",
  pilot:
    "https://upload.wikimedia.org/wikipedia/commons/7/7f/2019_Honda_Pilot_EXL_AWD_front_04.15.19.jpg",
  odyssey:
    "https://upload.wikimedia.org/wikipedia/commons/4/45/2018_Honda_Odyssey_EXL_front_4.20.18.jpg",
  ridgeline:
    "https://upload.wikimedia.org/wikipedia/commons/4/47/2017_Honda_Ridgeline_RTL-E_front_7.18.18.jpg",
  jazz:
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/2018_Honda_Jazz_i-VTEC_1.3.jpg",
  fit:
    "https://upload.wikimedia.org/wikipedia/commons/c/c7/2015_Honda_Fit_EX_%28GK5%29_front_view.jpg",
  "hr-v":
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/2019_Honda_HR-V_EXL_AWD_front_4.27.19.jpg",
  hrv:
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/2019_Honda_HR-V_EXL_AWD_front_4.27.19.jpg",
};

// Fallback image API (no key): loremflickr
const buildFallbackImage = (make, name) =>
  `https://loremflickr.com/400/300/${encodeURIComponent(
    make
  )},${encodeURIComponent(name)},car`;

function normalizeKey(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function ModelsSection({ searchTerm }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // ✅ REAL DATA API: NHTSA vehicle models for Honda
        const res = await fetch(NHTSA_API);
        const data = await res.json();

        const mapped = (data.Results || []).map((item, index) => {
          const make = item.Make_Name || "Honda";
          const name = item.Model_Name || "Model";
          const key = normalizeKey(name);

          // preferred: exact model photo
          const primaryImage = MODEL_IMAGES[key];

          // if we don’t have a curated URL for this model, skip it
          if (!primaryImage) return null;

          return {
            id: `${item.Model_ID}-${index}`,
            make,
            name,
            image: primaryImage,
          };
        });

        const filtered = mapped.filter(Boolean).slice(0, 12);
        setModels(filtered);
      } catch (err) {
        console.error(err);
        setError("Could not load vehicle models. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const normalizedQuery = (searchTerm || "").trim().toLowerCase();

  const visibleModels = useMemo(() => {
    if (!normalizedQuery) return models;

    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(normalizedQuery) ||
        m.make.toLowerCase().includes(normalizedQuery)
    );
  }, [models, normalizedQuery]);

  return (
    <section className="page-section">
      <div className="page-section-inner">
        <h2 className="section-title">Browse popular Honda models</h2>
        <p className="section-text">
          Model data is loaded live from the official NHTSA vehicle API. Each
          supported model is mapped to a reference image hosted on the web; if
          that image is blocked or unavailable, the card falls back to a car
          photo from an image API so the layout still looks complete.
        </p>

        {loading && (
          <div className="models-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="model-card skeleton" />
            ))}
          </div>
        )}

        {error && !loading && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            {visibleModels.length === 0 ? (
              <p className="error-text">
                No models match your search. Try Accord, Civic, CR-V, Pilot,
                Odyssey, Ridgeline, Fit, or HR-V.
              </p>
            ) : (
              <div className="models-grid">
                {visibleModels.map((model) => (
                  <article key={model.id} className="model-card">
                    <div className="model-image-wrapper">
                      <img
                        src={model.image}
                        alt={`${model.make} ${model.name}`}
                        className="model-image"
                        onError={(e) => {
                          // If the primary (Wikipedia) URL fails,
                          // switch once to the fallback image API.
                          if (e.target.dataset.fallback === "1") {
                            // second failure: hide image to avoid broken icon
                            e.target.style.display = "none";
                            return;
                          }
                          e.target.dataset.fallback = "1";
                          e.target.src = buildFallbackImage(
                            model.make,
                            model.name
                          );
                        }}
                      />
                    </div>
                    <div className="model-card-body">
                      <h3>{model.name}</h3>
                      <p className="model-make">{model.make}</p>
                      <p className="model-meta">
                        From $689 / month • 12–24 month terms
                      </p>
                      <button className="model-cta">View details</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ModelsSection;
