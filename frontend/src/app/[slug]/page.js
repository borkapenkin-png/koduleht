import { notFound } from "next/navigation";
import ServicePageContent from "@/components/service-page/ServicePageContent";
import { getServiceFaqs, getServiceRouteData, getSiteUrl, withApiUrl } from "@/lib/site-api";
import { resolveServicePage, stripHtml } from "@/lib/site-helpers";

export async function generateStaticParams() {
  const { allPages } = await getServiceRouteData();
  return allPages.filter((page) => page?.slug).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { settings, allPages, areas } = await getServiceRouteData();
  const resolved = resolveServicePage(slug, allPages, areas);

  if (!resolved) {
    return {
      title: "Sivua ei löytynyt | J&B Tasoitus ja Maalaus",
    };
  }

  const { page } = resolved;
  const description = page.seo_description || stripHtml(page.description_text || "").slice(0, 160);
  const canonical = `${getSiteUrl().replace(/\/$/, "")}/${slug}`;

  return {
    title: page.seo_title || page.hero_title,
    description,
    alternates: { canonical },
    openGraph: {
      title: page.seo_title || page.hero_title,
      description,
      url: canonical,
      images: page.hero_image_url ? [{ url: withApiUrl(page.hero_image_url) }] : [],
    },
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const { settings, allPages, services, areas } = await getServiceRouteData();
  const resolved = resolveServicePage(slug, allPages, areas);

  if (!resolved) {
    notFound();
  }

  const { page, currentArea, baseSlug, isGeneralPage } = resolved;
  const faqs = await getServiceFaqs(page.service_id);
  const relatedPages = allPages.filter((item) => item.slug !== page.slug && item.is_published).slice(0, 3);

  return (
    <ServicePageContent
      settings={settings}
      services={services}
      allPages={allPages}
      areas={areas}
      page={page}
      faqs={faqs}
      relatedPages={relatedPages}
      currentArea={currentArea}
      baseSlug={baseSlug}
      isGeneralPage={isGeneralPage}
    />
  );
}
