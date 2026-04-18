import HomePageLiveContent from "@/components/site/HomePageLiveContent";
import { getHomeData, withApiUrl } from "@/lib/site-api";

export async function generateMetadata() {
  const { settings } = await getHomeData();
  const title =
    settings.home_seo_title || `${settings.company_name || "J&B Tasoitus ja Maalaus Oy"} | Maalaus- ja tasoituspalvelut`;
  const description = settings.home_seo_description || settings.hero_description || "Tasoitus- ja maalaustyöt Helsingissä ja Uudellamaalla.";

  return {
    title,
    description,
    alternates: {
      canonical: settings.home_canonical_url || "/",
    },
    openGraph: {
      title,
      description,
      url: settings.home_canonical_url || "/",
      images: settings.hero_image_url ? [{ url: withApiUrl(settings.hero_image_url) }] : [],
    },
  };
}

export default async function HomePage() {
  const { settings, services, references, partners, servicePages } = await getHomeData();
  return <HomePageLiveContent settings={settings} services={services} references={references} partners={partners} servicePages={servicePages} />;
}
