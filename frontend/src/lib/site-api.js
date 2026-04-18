import { promises as fs } from "node:fs";
import path from "node:path";
import { getApiBaseUrl, getSiteUrl, withApiUrl } from "@/lib/public-env";

export { getApiBaseUrl, getSiteUrl, withApiUrl };

async function fetchJson(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    next: options.next || { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path} (${response.status})`);
  }

  return response.json();
}

let backupCache;

async function loadBackupData() {
  if (backupCache) return backupCache;

  try {
    const filePath = path.join(process.cwd(), "..", "production_data_export.json");
    const contents = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(contents);

    backupCache = {
      settings: parsed.site_settings?.[0] || {},
      services: parsed.services || [],
      references: parsed.references || [],
      partners: parsed.partners || [],
      faqs: parsed.faqs || [],
      servicePages: parsed.service_pages || [],
      areas: parsed.areas || [],
      calculatorConfig: parsed.calculator_config || { services: [], global_settings: {} },
      groupedFaqs: groupFaqs(parsed.faqs || [], parsed.services || []),
    };
  } catch {
    backupCache = {
      settings: {},
      services: [],
      references: [],
      partners: [],
      faqs: [],
      servicePages: [],
      areas: [],
      calculatorConfig: { services: [], global_settings: {} },
      groupedFaqs: { general: [], by_service: {} },
    };
  }

  return backupCache;
}

function groupFaqs(faqs, services) {
  const by_service = {};
  const general = [];

  for (const faq of faqs) {
    if (faq.service_id) {
      if (!by_service[faq.service_id]) {
        const service = services.find((item) => item.id === faq.service_id);
        by_service[faq.service_id] = {
          service_title: service?.title || "Palvelu",
          faqs: [],
        };
      }
      by_service[faq.service_id].faqs.push(faq);
    } else {
      general.push(faq);
    }
  }

  return { general, by_service };
}

export async function getHomeData() {
  try {
    const [settings, services, references, partners, servicePages] = await Promise.all([
      fetchJson("/api/settings"),
      fetchJson("/api/services"),
      fetchJson("/api/references"),
      fetchJson("/api/partners").catch(() => []),
      fetchJson("/api/service-pages").catch(() => []),
    ]);

    return { settings, services, references, partners, servicePages };
  } catch {
    const backup = await loadBackupData();
    return backup;
  }
}

export async function getReferencesData() {
  try {
    const [settings, services, references, servicePages] = await Promise.all([
      fetchJson("/api/settings"),
      fetchJson("/api/services"),
      fetchJson("/api/references"),
      fetchJson("/api/service-pages").catch(() => []),
    ]);

    return { settings, services, references, servicePages };
  } catch {
    const backup = await loadBackupData();
    return {
      settings: backup.settings,
      services: backup.services,
      references: backup.references,
      servicePages: backup.servicePages,
    };
  }
}

export async function getFaqData() {
  try {
    const [settings, services, servicePages, groupedFaqs] = await Promise.all([
      fetchJson("/api/settings"),
      fetchJson("/api/services"),
      fetchJson("/api/service-pages").catch(() => []),
      fetchJson("/api/faqs/grouped"),
    ]);

    return { settings, services, servicePages, groupedFaqs };
  } catch {
    const backup = await loadBackupData();
    return {
      settings: backup.settings,
      services: backup.services,
      servicePages: backup.servicePages,
      groupedFaqs: backup.groupedFaqs,
    };
  }
}

export async function getCalculatorData() {
  try {
    const [settings, servicePages, config, pageData, services, faqs, references] = await Promise.all([
      fetchJson("/api/settings"),
      fetchJson("/api/service-pages").catch(() => []),
      fetchJson("/api/calculator-config"),
      fetchJson("/api/service-pages/hintalaskuri").catch(() => null),
      fetchJson("/api/services").catch(() => []),
      fetchJson("/api/faqs", { next: { revalidate: 60 } }).catch(() => []),
      fetchJson("/api/references").catch(() => []),
    ]);

    return { settings, servicePages, config, pageData, services, faqs, references };
  } catch {
    const backup = await loadBackupData();
    return {
      settings: backup.settings,
      servicePages: backup.servicePages,
      config: backup.calculatorConfig,
      pageData: backup.servicePages.find((page) => page.slug === "hintalaskuri") || null,
      services: backup.services,
      faqs: backup.faqs.filter((faq) => faq.service_id === "hintalaskuri"),
      references: backup.references,
    };
  }
}

export async function getServiceRouteData() {
  try {
    const [settings, allPages, services, areas] = await Promise.all([
      fetchJson("/api/settings"),
      fetchJson("/api/service-pages").catch(() => []),
      fetchJson("/api/services").catch(() => []),
      fetchJson("/api/areas").catch(() => []),
    ]);

    return { settings, allPages, services, areas };
  } catch {
    const backup = await loadBackupData();
    return {
      settings: backup.settings,
      allPages: backup.servicePages,
      services: backup.services,
      areas: backup.areas,
    };
  }
}

export async function getServiceFaqs(serviceId) {
  if (!serviceId) return [];

  try {
    return await fetchJson(`/api/faqs?service_id=${serviceId}`);
  } catch {
    const backup = await loadBackupData();
    return backup.faqs.filter((faq) => faq.service_id === serviceId);
  }
}
