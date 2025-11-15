// src/pages/Browse.jsx
import { useEffect, useState } from "react";
import { getVehiclesDataset } from "../data";

// small helpers so we don't repeat formatting logic
const fmtCurrency = (n) => `$${n.toLocaleString()}`;
const fmtKm = (n) => `${n.toLocaleString()} km`;

export default function Browse() {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load initial data on first render
  useEffect(() => {
    loadVehicles("");
  }, []);

  async function loadVehicles(query) {
    try {
      setLoading(true);
      setError("");
      const data = await getVehiclesDataset(query); // comes from ../data
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError("Could not load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadVehicles(searchTerm.trim());
  }

  // filter by search + price
  const visibleVehicles = vehicles.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchesQ =
      !q ||
      `${v.year} ${v.make} ${v.model} ${v.body || ""} ${v.trans || ""}`
        .toLowerCase()
        .includes(q);

    const matchesPrice = !maxPrice || v.price <= maxPrice;
    return matchesQ && matchesPrice;
  });

  return (
    <>
      {/* Top hero strip with background image */}
      <section className="hero hero--image">
        <div className="container hero__content hero__content--center hero__content--compact">
          <h1 className="hero__title hero__title--small">Browse our cars</h1>

          <form className="search" onSubmit={handleSearchSubmit}>
            <input
              className="search__input"
              placeholder="Search by Make, Model or Keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search__btn" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79L20 21.5 21.5 20 15.5 14zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Results section */}
      <main className="container section section--center">
        {/* Price filter */}
        <div className="filters">
          <div className="filters__price">
            <label htmlFor="priceMax" className="filters__label">
              Price range:{" "}
              <span id="priceRangeLabel">
                $0 to {fmtCurrency(Number(maxPrice || 0))}
              </span>
            </label>
            <input
              type="range"
              id="priceMax"
              min="0"
              max="100000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="filters__scale">
              <span>$0</span>
              <span>$100,000</span>
            </div>
          </div>
        </div>

        <h3 className="results-title">Search results:</h3>

        {loading && <p className="muted">Loading cars…</p>}
        {error && <p className="muted" style={{ color: "crimson" }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid">
              {visibleVehicles.map((v) => {
                const fallback = `https://picsum.photos/seed/${encodeURIComponent(
                  v.id
                )}/800/600`;

                const imgSrc = v.img || fallback;

                return (
                  <article className="card" key={v.id}>
                    {/* 🔴 IMPORTANT: img is INSIDE .card__img so CSS can control size */}
                    <div className="card__img">
                      <img
                        src={imgSrc}
                        alt={`${v.year} ${v.make} ${v.model}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallback;
                        }}
                      />
                    </div>

                    <div className="card__body">
                      <div className="card__title">
                        {v.year} {v.make} {v.model}
                      </div>

                      <div className="specs">
                        <span>🚗</span>
                        <span>{fmtKm(v.km)}</span>
                        <span>🚙</span>
                        <span>{v.body}</span>
                        <span>⚙️</span>
                        <span>{v.trans}</span>
                      </div>

                      <div className="price">{fmtCurrency(v.price)}</div>
                    </div>
                  </article>
                );
              })}
            </div>

            {visibleVehicles.length === 0 && (
              <p className="muted" style={{ marginTop: "16px" }}>
                No cars found. Try a different search or price range.
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
