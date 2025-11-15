// src/vehiclesApi.js

/* ---------- Wikipedia helpers (validated car lookup) ---------- */
const VEHICLE_KEYWORDS = [
  "automobile",
  "car",
  "vehicle",
  "crossover",
  "suv",
  "sedan",
  "hatchback",
  "coupe",
  "minivan",
  "pickup",
  "estate",
  "wagon",
];

const SUB_BRANDS = [
  "Scion",
  "Genesis",
  "Ram",
  "Mini",
  "Infiniti",
  "Acura",
  "Lexus",
  "Alfa Romeo",
  "Land Rover",
  "Range Rover",
  "Polestar",
  "Cupra",
  "MG",
  "DS",
  "Seat",
  "Škoda",
  "Skoda",
  "Vauxhall",
  "Holden",
  "Geo",
  "Daewoo",
  "Daihatsu",
  "Smart",
  "GMC",
  "Datsun",
];

async function wikiGET(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(url + " -> " + res.status);
  return res.json();
}

async function wikiSummary(title) {
  return wikiGET(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`
  );
}

async function wikiMediaList(title) {
  return wikiGET(
    `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(
      title
    )}`
  );
}

async function wikiSearchTitles(q, limit = 5) {
  const data = await wikiGET(
    `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(
      q
    )}&limit=${limit}`
  );
  return data.pages || [];
}

function textHasVehicleKeyword(t = "") {
  const s = (t || "").toLowerCase();
  return VEHICLE_KEYWORDS.some((k) => s.includes(k));
}

function chooseMediaImage(mediaData, make, model) {
  if (!mediaData || !mediaData.items) return null;
  const kw = [make, model]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const scoreFor = (it) => {
    const title = (it.title || "").toLowerCase();
    const caption = (
      it.caption && it.caption.text ? it.caption.text : ""
    ).toLowerCase();
    let score = 0;
    kw.forEach((k) => {
      if (title.includes(k)) score += 2;
      if (caption.includes(k)) score += 2;
    });
    if ((it.type || "") === "image") score += 1;
    return score;
  };

  const imgs = mediaData.items.filter((it) => it.type === "image");
  imgs.sort((a, b) => scoreFor(b) - scoreFor(a));
  const pick = imgs[0];
  if (!pick) return null;

  if (pick.original && pick.original.source) return pick.original.source;
  if (pick.srcset && pick.srcset.length)
    return pick.srcset[pick.srcset.length - 1].src;
  if (pick.thumbnail && pick.thumbnail.source) return pick.thumbnail.source;
  return null;
}

async function resolveCarTitle(make, model) {
  const m = (make || "").trim();
  const mdl = (model || "").trim();

  // sub-brand override
  const modelFirstWord = mdl.split(/\s+/)[0];
  let effectiveMake = m;
  if (SUB_BRANDS.includes(modelFirstWord)) {
    effectiveMake = modelFirstWord;
  }

  const candidates = [
    `${effectiveMake} ${mdl}`,
    `${mdl} (${effectiveMake})`,
    `${mdl} (car)`,
    `${mdl} (automobile)`,
    mdl,
  ];

  for (const c of candidates) {
    try {
      const pages = await wikiSearchTitles(c, 5);
      const valid = pages.find(
        (p) =>
          textHasVehicleKeyword(p.description) ||
          textHasVehicleKeyword(p.excerpt)
      );
      if (valid) return valid.key || valid.title;

      if (pages.length) {
        const p0 = pages[0];
        const t = (p0.title || p0.key || "").toLowerCase();
        if (
          t.includes(mdl.toLowerCase()) ||
          t.includes(effectiveMake.toLowerCase())
        ) {
          return p0.key || p0.title;
        }
      }
    } catch (_e) {
      // ignore and move on
    }
  }

  // fallback
  return `${effectiveMake} ${mdl}`;
}

async function imageForMakeModel(make, model, seed) {
  const title = await resolveCarTitle(make, model);

  // summary first
  try {
    const s = await wikiSummary(title);
    if (textHasVehicleKeyword(s.description || s.extract)) {
      if (s.originalimage && s.originalimage.source)
        return s.originalimage.source;
      if (s.thumbnail && s.thumbnail.source) return s.thumbnail.source;
    }
  } catch (_e) {
    // ignore
  }

  // media list next
  try {
    const m = await wikiMediaList(title);
    const img = chooseMediaImage(m, make, model);
    if (img) return img;
  } catch (_e) {
    // ignore
  }

  // final fallback
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
}

/* ---------- Live vehicle data via NHTSA API ---------- */

async function fetchModelsForMake(make) {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(
    make
  )}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error for ${make}: ${res.status}`);
  const data = await res.json();
  return data.Results || [];
}

function toVehicleSkeleton(make, model, idx) {
  const price = 18000 + ((idx * 317) % 22000);
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const year = years[idx % years.length];
  const bodies = ["SUV", "Wagon", "Hatchback", "Sedan"];
  const trans = ["Automatic", "Auto Dual Clutch", "Auto Seq Sportshift"];

  return {
    id: `${make}-${model}-${idx}`,
    year,
    make,
    model,
    km: 5000 + ((idx * 2311) % 90000),
    body: bodies[idx % bodies.length],
    trans: trans[idx % trans.length],
    price,
    img: null,
  };
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1).toLowerCase();
}

// This is what Browse.jsx uses
export async function getVehiclesDataset(initialQuery) {
  const makes = initialQuery
    ? [capitalize(initialQuery)]
    : ["Toyota", "Ford", "Kia", "Volkswagen", "Subaru", "Tesla"];

  const all = [];

  for (const mk of makes) {
    try {
      const rows = await fetchModelsForMake(mk);
      rows.slice(0, 6).forEach((r, i) =>
        all.push(toVehicleSkeleton(mk, r.Model_Name, i))
      );
    } catch (e) {
      console.warn(e);
    }
  }

  // resolve images with small concurrency cap
  const CONCURRENCY = 3;
  let i = 0;

  async function worker() {
    while (i < all.length) {
      const idx = i++;
      const v = all[idx];
      try {
        v.img = await imageForMakeModel(v.make, v.model, v.id);
      } catch (_e) {
        v.img = `https://picsum.photos/seed/${encodeURIComponent(
          v.id
        )}/800/600`;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return all;
}
