const DEFAULT_SERVICE_SLUGS = {
  "Tasoitustyöt": "tasoitustyot-helsinki",
  "Maalaustyöt": "maalaustyot-helsinki",
  Mikrosementti: "mikrosementti-helsinki",
  Julkisivurappaus: "julkisivurappaus-helsinki",
  "Kattojen maalaukset": "kattomaalaus-helsinki",
  "Kattojen pesut ja maalaukset": "kattomaalaus-helsinki",
  "Julkisivujen maalaukset": "julkisivumaalaus-helsinki",
  "Julkisivujen pesut ja maalaukset": "julkisivumaalaus-helsinki",
};

export function getThemeStyle(settings = {}) {
  const color = settings.theme_color || "#0056D2";
  const font = settings.theme_font || "Inter";
  const size = settings.theme_size || "medium";
  const sizeMultiplier = size === "small" ? 0.9 : size === "large" ? 1.1 : 1;

  return {
    "--color-primary": color,
    "--color-primary-hover": `color-mix(in srgb, ${color} 85%, black)`,
    "--color-primary-active": `color-mix(in srgb, ${color} 75%, black)`,
    "--color-primary-light": `color-mix(in srgb, ${color} 10%, white)`,
    "--color-primary-lighter": `color-mix(in srgb, ${color} 5%, white)`,
    "--font-main": `"${font}", sans-serif`,
    "--size-multiplier": sizeMultiplier,
  };
}

export function createSlugFromServiceTitle(title) {
  return DEFAULT_SERVICE_SLUGS[title] || "maalaustyot-helsinki";
}

export function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getServiceById(services = [], id) {
  return services.find((service) => service.id === id);
}

export function resolveServicePage(slug, allPages = [], areas = []) {
  const reservedSlugs = ["admin", "api", "static", "assets"];
  if (!slug || reservedSlugs.includes(slug.toLowerCase())) return null;

  const defaultArea = areas.find((area) => area.is_default) || areas[0];
  const exactPage = allPages.find((page) => page.slug === slug);

  if (exactPage) {
    const matchedArea = areas.find((area) => slug.endsWith(`-${area.slug}`));
    const page = applyAreaOverrides(exactPage, matchedArea, slug, defaultArea);

    return {
      page,
      currentArea: matchedArea || null,
      baseSlug: matchedArea ? slug.replace(`-${matchedArea.slug}`, "") : null,
      isGeneralPage: false,
    };
  }

  if (defaultArea) {
    const generalSource = allPages.find((page) => page.slug === `${slug}-${defaultArea.slug}`);
    if (generalSource) {
      return {
        page: removeAreaName(generalSource, defaultArea),
        currentArea: null,
        baseSlug: slug,
        isGeneralPage: true,
      };
    }
  }

  const targetArea = areas.find((area) => slug.endsWith(`-${area.slug}`));
  if (targetArea && defaultArea) {
    const baseSlug = slug.replace(`-${targetArea.slug}`, "");
    const basePage = allPages.find((page) => page.slug === `${baseSlug}-${defaultArea.slug}`);
    if (!basePage) return null;

    const variant = removeAreaName(basePage, defaultArea);
    variant.slug = slug;
    variant.hero_title = `${variant.hero_title} ${targetArea.name_inessive}`.trim();
    variant.seo_title = `${variant.seo_title} ${targetArea.name_inessive}`.trim();

    const page = applyCustomTexts(variant, targetArea, baseSlug);
    return {
      page,
      currentArea: targetArea,
      baseSlug,
      isGeneralPage: false,
    };
  }

  return null;
}

function removeAreaName(page, area) {
  const clone = { ...page };
  const strip = (value) =>
    value?.replace(new RegExp(`\\s*${area.name_inessive}`, "gi"), "").replace(new RegExp(`\\s*${area.name}`, "gi"), "").trim() || value;

  clone.hero_title = strip(clone.hero_title);
  clone.seo_title = strip(clone.seo_title);
  return clone;
}

function applyCustomTexts(page, area, baseSlug) {
  const clone = { ...page };
  const customTexts = area?.custom_texts || {};
  const cityEntry = customTexts[baseSlug];

  if (cityEntry && typeof cityEntry === "object") {
    if (cityEntry.seo_title) clone.seo_title = cityEntry.seo_title;
    if (cityEntry.hero_title) clone.hero_title = cityEntry.hero_title;
    if (cityEntry.seo_description) clone.seo_description = cityEntry.seo_description;
    if (cityEntry.text) {
      clone.description_text = `${clone.description_text || ""}<div class="city-specific-content"><p>${cityEntry.text}</p></div>`;
    }
  } else if (typeof cityEntry === "string" && cityEntry) {
    clone.description_text = `${clone.description_text || ""}<div class="city-specific-content"><p>${cityEntry}</p></div>`;
  }

  return clone;
}

function applyAreaOverrides(page, area, slug, defaultArea) {
  if (!area) return { ...page };
  const baseSlug = slug.replace(`-${area.slug}`, "");
  return applyCustomTexts(page, area, baseSlug || defaultArea?.slug);
}
