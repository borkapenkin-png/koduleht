import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  ChevronDown,
  Mail,
  MapPin,
  Paintbrush,
  Phone,
  Building2,
  Layers,
  Hammer,
  Wrench,
  PaintBucket,
  Brush,
  Ruler,
  HardHat,
  Construction,
  Warehouse,
  DoorOpen,
  DoorClosed,
  Sofa,
  Lamp,
  Frame,
  Square,
  Sparkles,
  Sun,
  Droplets,
  Wind,
  TreeDeciduous,
  Fence,
  Scaling,
  LayoutGrid,
  PanelTop,
  CircleDot,
} from "lucide-react";
import QuoteRequestForm from "@/components/QuoteRequestFormClean";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { LocalBusinessSchema } from "@/components/site/StructuredData";
import { createSlugFromServiceTitle, getThemeStyle } from "@/lib/site-helpers";
import { getSiteUrl, withApiUrl } from "@/lib/site-api";

const iconMap = {
  Building2,
  Layers,
  Paintbrush,
  Hammer,
  Wrench,
  PaintBucket,
  Brush,
  Ruler,
  HardHat,
  Construction,
  Warehouse,
  DoorOpen,
  DoorClosed,
  Sofa,
  Lamp,
  Frame,
  Square,
  Sparkles,
  Sun,
  Droplets,
  Wind,
  TreeDeciduous,
  Fence,
  Scaling,
  LayoutGrid,
  PanelTop,
  CircleDot,
};

function formatPhone(value) {
  return (value || "+358 40 054 7270").replace(/\s/g, "");
}

export default function HomePageLiveContent({ settings, services, servicePages }) {
  const themeStyle = getThemeStyle(settings);
  const heroImage =
    withApiUrl(settings.hero_image_url) ||
    "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
  const siteUrl = getSiteUrl();
  const publishedPages = (servicePages || []).filter((page) => page.is_published).slice(0, 9);
  const companyPhone = settings.company_phone_primary || settings.contact_phone_1 || "+358 40 054 7270";
  const companyEmail = settings.company_email || settings.contact_email || "info@jbtasoitusmaalaus.fi";
  const companyAddress = settings.company_address || settings.contact_address || "Sienitie 25, 00760 Helsinki";
  const trustBadges = [settings.hero_badge_1, settings.hero_badge_2].filter(Boolean);

  return (
    <div style={themeStyle}>
      <SiteHeader settings={settings} isHome />
      <LocalBusinessSchema settings={settings} siteUrl={siteUrl} />

      <main>
        <section className="relative flex min-h-[88vh] items-center pt-16 md:min-h-screen" data-testid="hero-section">
          <div className="absolute inset-0">
            <img src={heroImage} alt={settings.company_name || "J&B Tasoitus ja Maalaus Oy"} className="h-full w-full object-cover" />
            <div className="hero-overlay absolute inset-0" />
          </div>

          <div className="container-custom relative z-10 py-14 md:py-20">
            <div className="max-w-[680px] lg:ml-52">
              <p className="font-slogan mb-3 text-sm text-primary md:mb-4">{settings.hero_slogan || "LAATUJOHTAJAT"}</p>
              <h1 className="max-w-[640px] text-5xl font-bold leading-[0.95] text-[#0F172A] md:text-7xl">
                {settings.hero_title_1 || "Ammattitaitoista"}{" "}
                <span className="text-primary">{settings.hero_title_2 || "maalausta"}</span>{" "}
                {settings.hero_title_3 || "ja tasoitusta"}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#64748B] md:text-[1.05rem] md:leading-8">
                {settings.hero_description ||
                  "Uudellamaalla toimiva luotettava ammattilainen vuodesta 2018. Sisä- ja ulkomaalaukset, julkisivurappaukset sekä tapetoinnit avaimet käteen -periaatteella."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#yhteystiedot" className="btn-primary min-w-[180px] inline-flex items-center justify-center gap-2">
                  Pyydä ilmainen arvio <ArrowRight size={18} />
                </a>
                <Link href="/hintalaskuri" className="btn-secondary min-w-[155px] inline-flex items-center justify-center gap-2">
                  <Calculator size={18} /> Hintalaskuri
                </Link>
                <a href="#palvelut" className="btn-secondary min-w-[180px] inline-flex items-center justify-center gap-2">
                  Tutustu palveluihin <ChevronDown size={18} />
                </a>
              </div>

              {trustBadges.length ? (
                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[#64748B] md:gap-8 md:text-base">
                  {trustBadges.map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-primary" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 md:block">
            <ChevronDown size={28} className="text-primary/70" />
          </div>
        </section>

        <section id="palvelut" className="section-padding bg-white" data-testid="services-section">
          <div className="container-custom">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-primary">MITÄ TEEMME</p>
              <h2 className="section-title">Palvelumme</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = iconMap[service.icon] || Building2;
                const slug = createSlugFromServiceTitle(service.title);
                return (
                  <Link key={service.id} href={`/${slug}`} className="group block overflow-hidden rounded-sm border border-[#E2E8F0] bg-white p-0 transition-colors hover:border-[#D7E6EE]">
                    {service.image_url ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={withApiUrl(service.image_url)} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                      </div>
                    ) : null}
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="icon-box !h-8 !w-8">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <h3 className="text-[1.75rem] font-semibold leading-none text-[#0F172A]">{service.title}</h3>
                      </div>
                      <p className="text-[1rem] leading-8 text-[#64748B]">{service.description}</p>
                      <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
                        Lue lisää <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="meista" className="section-padding bg-[#F8FAFC]" data-testid="about-section">
          <div className="container-custom">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">{settings.about_subtitle || "Tietoa meistä"}</p>
                <h2 className="section-title">{settings.about_title || "Luotettava kumppani pintaremontteihin"}</h2>
                <div className="mt-5 space-y-4 text-sm leading-7 text-[#64748B] md:text-base">
                  {[settings.about_text_1, settings.about_text_2, settings.about_text_3].filter(Boolean).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5">
                  <p className="font-semibold text-[#0F172A]">{settings.about_info_title || "Muista kotitalousvähennys"}</p>
                  <p className="mt-2 text-sm leading-7 text-[#64748B]">{settings.about_info_text}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-sm">
                <img
                  src={
                    withApiUrl(settings.about_image_url) ||
                    "https://images.pexels.com/photos/7941435/pexels-photo-7941435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  }
                  alt={settings.about_title || settings.company_name || "J&B Tasoitus ja Maalaus Oy"}
                  className="h-[320px] w-full object-cover md:h-[420px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-8 md:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Hintalaskuri</p>
                  <h2 className="section-title">Laske hinta-arvio hetkessä</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#64748B] md:text-base">
                    Käytä hintalaskuria ja saat suuntaa-antavan hinta-arvion maalaus- ja tasoitustöille. Sisältää materiaalit, työn ja ALV:n.
                  </p>
                </div>
                <div>
                  <Link href="/hintalaskuri" className="btn-primary inline-flex items-center justify-center gap-2">
                    Avaa hintalaskuri <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="yhteystiedot" className="section-padding bg-[#F8FAFC]" data-testid="contact-section">
          <div className="container-custom">
            <div className="mb-8 max-w-3xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">{settings.contact_subtitle || "Ota yhteyttä"}</p>
              <h2 className="section-title">{settings.contact_title || "Yhteystiedot"}</h2>
              <p className="mt-4 text-sm leading-7 text-[#64748B] md:text-base">
                {settings.contact_description || "Lähetä tarjouspyyntö tai pyydä meidät ilmaiselle arviokäynnille."}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-1 text-primary" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Osoite</p>
                      <p className="mt-1 text-sm leading-7 text-[#64748B]">{companyAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-1 text-primary" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Sähköposti</p>
                      <a href={`mailto:${companyEmail}`} className="mt-1 block text-sm leading-7 text-primary hover:underline">
                        {companyEmail}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-1 text-primary" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Puhelin</p>
                      <div className="mt-1 space-y-2 text-sm text-[#64748B]">
                        <div>
                          {settings.contact_phone_1_name ? <p className="text-xs text-[#94A3B8]">{settings.contact_phone_1_name}</p> : null}
                          <a href={`tel:${formatPhone(settings.contact_phone_1 || companyPhone)}`} className="text-primary hover:underline">
                            {settings.contact_phone_1 || companyPhone}
                          </a>
                        </div>
                        {settings.contact_phone_2 ? (
                          <div>
                            {settings.contact_phone_2_name ? <p className="text-xs text-[#94A3B8]">{settings.contact_phone_2_name}</p> : null}
                            <a href={`tel:${formatPhone(settings.contact_phone_2)}`} className="text-primary hover:underline">
                              {settings.contact_phone_2}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 md:p-8">
                <h3 className="text-2xl font-bold text-[#0F172A]">Lähetä tarjouspyyntö</h3>
                <div className="mt-6">
                  <QuoteRequestForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {publishedPages.length ? (
          <section className="section-padding bg-white">
            <div className="container-custom">
              <div className="mb-8 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Palvelualueet</p>
                <h2 className="section-title">Palvelemme pääkaupunkiseudulla ja Uudellamaalla</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {publishedPages.map((page) => (
                  <Link key={page.id || page.slug} href={`/${page.slug}`} className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFC] px-5 py-4 text-sm font-medium text-[#0F172A] transition-colors hover:border-primary/30 hover:text-primary">
                    {page.hero_title || page.title || page.seo_title || page.slug}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter settings={settings} servicePages={servicePages} />
    </div>
  );
}
