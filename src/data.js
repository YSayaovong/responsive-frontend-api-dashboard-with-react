// src/data.js
// Central place for car data + images

/* ---------- Wikipedia + image helpers ---------- */

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
  "van"
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
  "Datsun"
];

function textHasVehicleKeyword(t = "") {
  const s = (t || "").toLowerCase();
  return VEHICLE_KEYWORDS.some((k) => s.includes(k));
}

function looksLikeLogoOrIcon(item) {
  const t = `${item.title || ""} ${item.caption?.text || ""}`.toLowerCase();

  const badWords = [
    "logo",
    "emblem",
    "symbol",
    "icon",
    "badge",
    "vector",
    "cartoon",
    "line art",
    "map",
    "flag",
    "diagram",
    "schematic"
  ];

  return badWords.some((w) => t.includes(w));
}

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

function chooseMediaImage(mediaData, make, model) {
  if (!mediaData || !mediaData.items) return null;

  const kw = [make, model].filter(Boolean).map((s) => s.toLowerCase());

  const scoreItem = (it) => {
    if (it.type !== "image") return -Infinity;
    if (looksLikeLogoOrIcon(it)) return -Infinity;

    const title = (it.title || "").toLowerCase();
    const caption = (it.caption?.text || "").toLowerCase();
    let score = 0;

    kw.forEach((k) => {
      if (title.includes(k)) score += 3;
      if (caption.includes(k)) score += 3;
    });

    if (textHasVehicleKeyword(caption)) score += 4;

    if (it.original?.source) score += 2;
    else if (it.thumbnail?.source) score += 1;

    return score;
  };

  const imgs = mediaData.items.filter((it) => it.type === "image");
  if (!imgs.length) return null;

  imgs.sort((a, b) => scoreItem(b) - scoreItem(a));

  const best = imgs[0];
  if (!best || scoreItem(best) === -Infinity) return null;

  if (best.original?.source) return best.original.source;
  if (best.srcset?.length) return best.srcset[best.srcset.length - 1].src;
  if (best.thumbnail?.source) return best.thumbnail.source;
  return null;
}

async function resolveCarTitle(make, model) {
  const m = (make || "").trim();
  const mdl = (model || "").trim();

  // If the model already starts with a sub-brand name, use that as make
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
    mdl
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
    } catch {
      // try next candidate
    }
  }

  // Fallback, even if Wikipedia lookup failed
  return `${effectiveMake} ${mdl}`.trim();
}

async function imageForMakeModel(make, model, seed) {
  const title = await resolveCarTitle(make, model);

  // 1) try summary
  try {
    const s = await wikiSummary(title);
    const text = `${s.description || ""} ${s.extract || ""}`;
    if (textHasVehicleKeyword(text) && !looksLikeLogoOrIcon(s)) {
      if (s.originalimage?.source) return s.originalimage.source;
      if (s.thumbnail?.source) return s.thumbnail.source;
    }
  } catch {
    // ignore and fall through
  }

  // 2) try media list
  try {
    const m = await wikiMediaList(title);
    const img = chooseMediaImage(m, make, model);
    if (img) return img;
  } catch {
    // ignore
  }

  // 3) fallback random photo
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/260`;
}

/* ---------- NHTSA models API ---------- */

async function fetchModelsForMake(make) {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(
    make
  )}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NHTSA API error for ${make}: ${res.status}`);
  const data = await res.json();
  return data.Results || [];
}

function toVehicleSkeleton(make, modelName, idx) {
  const priceBase = 18000;
  const priceSpread = 22000;
  const price = priceBase + ((idx * 317) % priceSpread);

  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const year = years[idx % years.length];

  const bodies = ["SUV", "Wagon", "Hatchback", "Sedan"];
  const trans = ["Automatic", "Manual", "CVT", "Dual Clutch"];

  return {
    id: `${make}-${modelName}-${idx}`,
    year,
    make,
    model: modelName,
    km: 5000 + ((idx * 2311) % 90000),
    body: bodies[idx % bodies.length],
    trans: trans[idx % trans.length],
    price,
    img: null // filled in later
  };
}

/* ---------- Main exported API ---------- */

export async function getVehiclesDataset(initialQuery = "") {
  const q = initialQuery.trim();
  const makes = q
    ? [q.split(/\s+/)[0]] // user typed "honda civic" → use "honda" as make
    : ["Honda", "Toyota", "Ford", "Subaru", "Tesla"];

  const all = [];

  // 1) fetch models per make
  for (const mkRaw of makes) {
    const mk = capitalize(mkRaw);
    try {
      const rows = await fetchModelsForMake(mk);
      // Take first 8 models for each make
      rows.slice(0, 8).forEach((r, i) => {
        all.push(toVehicleSkeleton(mk, r.Model_Name, i));
      });
    } catch (err) {
      console.warn("Error fetching models for", mkRaw, err);
    }
  }

  // No cars? just bail
  if (!all.length) return [];

  // 2) resolve images with small concurrency cap
  const CONCURRENCY = 4;
  let i = 0;

  async function worker() {
    while (i < all.length) {
      const idx = i++;
      const v = all[idx];
      try {
        v.img = await imageForMakeModel(v.make, v.model, v.id);
      } catch {
        v.img = `https://picsum.photos/seed/${encodeURIComponent(
          v.id
        )}/400/260`;
      }
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, () => worker())
  );

  return all;
}

/* ---------- small helper ---------- */

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
