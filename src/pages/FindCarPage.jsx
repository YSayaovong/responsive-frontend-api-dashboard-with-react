// src/pages/FindCarPage.jsx
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import ModelsSection from "../components/ModelsSection";

function useQuery() {
  const location = useLocation();
  return useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
}

function FindCarPage() {
  const query = useQuery();
  const searchTerm = query.get("query") || "";

  return (
    <div>
      <section className="page-section">
        <div className="page-section-inner">
          <h1 className="section-title">Find your car</h1>
          <p className="section-text">
            Explore subscription-ready Honda models. This page demonstrates API
            data, image rendering, and a responsive marketplace layout. If you
            searched from the homepage, the results are filtered by your search
            term.
          </p>
          {searchTerm && (
            <p className="section-text">
              Showing results for: <strong>{searchTerm}</strong>
            </p>
          )}
        </div>
      </section>

      <ModelsSection searchTerm={searchTerm} />
    </div>
  );
}

export default FindCarPage;
