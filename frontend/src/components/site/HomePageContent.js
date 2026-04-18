import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  ChevronDown,
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
  Calculator,
} from "lucide-react";
import QuoteRequestForm from "@/components/QuoteRequestFormClean";
import SiteHeaderLegacy from "@/components/site/SiteHeaderLegacy";
import SiteFooterLegacy from "@/components/site/SiteFooterLegacy";
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

export default function HomePageContent({ settings, services, references, partners, servicePages }) {
  const themeStyle = getThemeStyle(settings);
  const heroImage = withApiUrl(settings.hero_image_url) || "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
  const aboutImage = withApiUrl(settings.about_image_url) || "https://images.pexels.com/photos/7941435/pexels-photo-7941435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
  const siteUrl = getSiteUrl();
  const stats = settings.company_stats || [];

  return (
    <div style={themeStyle}>
      <SiteHeaderLegacy settings={settings} isHome />
      <LocalBusinessSchema settings={settings} siteUrl={siteUrl} />

      <main>
        <section className="relative flex min-h-[90vh] items-center pt-16 md:min-h-screen" data-testid="hero-section">
          <div className="absolute inset-0">
            <img src={heroImage} alt={settings.company_name || "J&B Tasoitus ja Maalaus Oy"} className="h-full w-full object-cover" />
            <div className="hero-overlay absolute inset-0" />
          </div>

          <div className="container-custom relative z-10 py-12 md:py-20">
            <div className="max-w-2xl">
              <p className="font-slogan mb-3 text-sm text-primary md:mb-4">{settings.hero_slogan || "LAATUJOHTAJAT"}</p>
              <h1 className="mb-4 text-3xl font-bold leading-tight text-[#0F172A] sm:text-4xl md:mb-6 md:text-6xl lg:text-7xl">
                {settings.hero_title_1 || "Ammattitaitoista"}
                <br />
                <span className="text-primary">{settings.hero_title_2 || "maalausta"}</span> {settings.hero_title_3 || "ja tasoitusta"}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#64748B] md:text-lg">{settings.hero_description}</p>

              <div className="mt-6 flex flex-col gap-3 md:mt-8 md:flex-row md:gap-4">
                <a href="#yhteystiedot" className="btn-primary inline-flex items-center justify-center gap-2 text-sm md:text-base">
                  Pyydä ilmainen arvio <ArrowRight size={18} />
                </a>
                <Link href="/hintalaskuri" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm md:text-base">
                  <Calculator size={18} /> Hintalaskuri
                </Link>
                <a href="#palvelut" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm md:text-base">
                  Tutustu palveluihin <ChevronDown size={18} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[#64748B] md:mt-12 md:gap-8 md:text-base">
                {[settings.hero_badge_1, settings.hero_badge_2].filter(Boolean).map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <CheckCircle size={21} className="text-primary" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
            <ChevronDown size={32} className="text-primary opacity-60" />
          </div>
        </section>

        <section id="palvelut" className="section-padding section-bg-alt" data-testid="services-section">
          <div className="container-custom">
            <div className="mb-10 text-center md:mb-16">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-primary">MITÄ TEEMME</p>
              <h2 className="section-title">Palvelumme</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
              {services.map((service) => {
                const Icon = iconMap[service.icon] || Building2;
                return (
                  <Link key={service.id} href={`/${createSlugFromServiceTitle(service.title)}`} className="block h-full transition-shadow hover:shadow-lg">
                    <article className="service-card group flex h-full flex-col overflow-hidden">
                      {service.image_url ? (
                        <div className="-mx-6 -mt-6 mb-4 aspect-[16/10] overflow-hidden md:-mx-8 md:-mt-8 md:mb-6">
                          <img
                            src={withApiUrl(service.image_url)}
                            alt={service.image_alt || service.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : null}
                      <div className="mb-3 flex items-center gap-3 md:mb-4">
                        <div className="icon-box">
                          <Icon size={18} className="text-primary" />
                        </div>
                        <h3 className="card-title line-clamp-2">{service.title}</h3>
                      </div>
                      <p className="card-text flex-grow">{service.description}</p>
                      <span className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                        Lue lisää <ArrowRight size={14} className="ml-1" />
                      </span>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="meista" className="section-padding" data-testid="about-section">
          <div className="container-custom">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-20">
              <div className="relative order-2 lg:order-1">
                <img src={aboutImage} alt={settings.about_title || settings.company_name} className="h-[300px] w-full object-cover md:h-[400px] lg:h-[500px]" />
                <div className="absolute -bottom-4 -right-4 hidden bg-primary p-4 text-white sm:block md:-bottom-6 md:-right-6 md:p-6">
                  <p className="text-2xl font-bold md:text-3xl">{settings.about_year || "2018"}</p>
                  <p className="text-xs opacity-80 md:text-sm">vuodesta alkaen</p>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-primary">{settings.about_subtitle || "TIETOA MEISTÄ"}</p>
                <h2 className="section-title mb-4 md:mb-6">{settings.about_title}</h2>
                <div className="space-y-3 text-sm leading-relaxed text-[#64748B] md:space-y-4 md:text-base">
                  {[settings.about_text_1, settings.about_text_2, settings.about_text_3].filter(Boolean).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div className="mt-6 border-l-4 border-primary bg-primary-light p-4 md:mt-8 md:p-6">
                  <p className="mb-2 text-sm font-medium text-[#0F172A] md:text-base">{settings.about_info_title || "Muista kotitalousvähennys!"}</p>
                  <p className="text-xs text-[#64748B] md:text-sm">{settings.about_info_text}</p>
                  <a
                    href="https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/kotitalousvahennys/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline md:text-sm"
                  >
                    Lue lisää <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {stats.length > 0 ? (
            <div className="mt-12 bg-primary p-6 md:mt-16 md:p-10" data-testid="company-stats-bar">
              <div className="container-custom">
                <div className={`grid grid-cols-2 gap-6 md:gap-8 ${stats.length >= 4 ? "md:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                  {stats.map((stat) => (
                    <div key={`${stat.value}-${stat.label}`} className="text-center">
                      <p className="mb-1 text-2xl font-bold text-white sm:text-3xl md:text-4xl">{stat.value}</p>
                      <p className="text-xs text-white/70 sm:text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section id="referenssit" className="section-padding bg-white" data-testid="references-section">
          <div className="container-custom">
            <div className="mb-6 text-center md:mb-8">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-primary">{settings.references_subtitle || "TYÖNÄYTTEITÄ"}</p>
              <h2 className="section-title">{settings.references_title || "Referenssit"}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-[#64748B] md:text-base">{settings.references_description}</p>
              <div className="mt-6">
                <Link href="/referenssit" className="btn-secondary inline-flex items-center gap-2 px-6 py-3">
                  Katso kaikki referenssit ({references.length})
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {references.slice(0, 4).map((reference) => (
                <article key={reference.id} className="reference-card-full group flex h-full flex-col">
                  <div className="reference-card-image-container">
                    <img
                      src={withApiUrl(reference.cover_image_url) || "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=800"}
                      alt={reference.cover_image_alt || reference.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="mb-2 text-base font-bold text-[#0F172A] transition-colors group-hover:text-primary md:text-lg">{reference.name}</h3>
                    <p className="mb-3 text-sm font-medium text-primary">{reference.type}</p>
                    {reference.description ? <p className="mb-3 text-sm leading-relaxed text-[#64748B]">{reference.description}</p> : null}
                    <div className="flex-1" />
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-sm text-[#64748B]">
                      {reference.main_contractor ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-primary" />
                          <span>{reference.main_contractor}</span>
                        </div>
                      ) : null}
                      {reference.location ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-primary" />
                          <span>{reference.location}</span>
                        </div>
                      ) : null}
                      {reference.year ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary" />
                          <span>{reference.year}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {partners?.length ? (
          <section className="section-padding bg-[#F8FAFC]">
            <div className="container-custom">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-6">
                {partners.map((partner) => (
                  <div key={partner.id} className="quality-logo flex min-h-24 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-4">
                    <img src={withApiUrl(partner.image_url)} alt={partner.name || "Partner"} className="max-h-14 w-auto object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="yhteystiedot" className="section-padding" data-testid="contact-section">
          <div className="container-custom">
            <div className="space-y-10 md:space-y-14">
              <div>
                <div className="mb-8 text-center md:mb-10">
                  <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-primary">{settings.contact_subtitle || "OTA YHTEYTTÄ"}</p>
                  <h2 className="section-title mb-4 md:mb-6">{settings.contact_title || "Yhteystiedot"}</h2>
                  <p className="mx-auto max-w-2xl text-sm text-[#64748B] md:text-base">{settings.contact_description}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                  <address className="not-italic rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-4 md:p-6">
                    <div className="flex items-start gap-3">
                      <div className="icon-box flex-shrink-0">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A] md:text-base">Päätoimisto</p>
                        <p className="mt-1 text-sm text-[#64748B]">{settings.company_address || settings.contact_address}</p>
                      </div>
                    </div>
                  </address>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-4 md:p-6">
                    <div className="flex items-start gap-3">
                      <div className="icon-box flex-shrink-0">
                        <Mail size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A] md:text-base">Sähköposti</p>
                        <a href={`mailto:${settings.company_email || settings.contact_email}`} className="mt-1 block text-sm text-primary hover:underline">
                          {settings.company_email || settings.contact_email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-4 md:p-6">
                    <div className="flex items-start gap-3">
                      <div className="icon-box flex-shrink-0">
                        <Phone size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A] md:text-base">Puhelin</p>
                        <div className="mt-1 space-y-2 text-sm text-[#64748B]">
                          <div>
                            <p className="text-xs text-[#94A3B8]">{settings.contact_phone_1_name}</p>
                            <a href={`tel:${formatPhone(settings.contact_phone_1)}`} className="whitespace-nowrap text-primary hover:underline">
                              {settings.contact_phone_1}
                            </a>
                          </div>
                          {settings.contact_phone_2 ? (
                            <div>
                              <p className="text-xs text-[#94A3B8]">{settings.contact_phone_2_name}</p>
                              <a href={`tel:${formatPhone(settings.contact_phone_2)}`} className="whitespace-nowrap text-primary hover:underline">
                                {settings.contact_phone_2}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-4 md:p-6">
                    <p className="mb-2 text-sm font-medium text-[#0F172A] md:text-base">{settings.contact_jobs_title}</p>
                    <p className="text-xs text-[#64748B] md:text-sm">{settings.contact_jobs_text}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mx-auto max-w-4xl rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] p-6 md:p-10">
                  <h3 className="mb-6 text-center text-xl font-bold text-[#0F172A] md:mb-8 md:text-2xl">Lähetä tarjouspyyntö</h3>
                  <QuoteRequestForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooterLegacy settings={settings} servicePages={servicePages} />
    </div>
  );
}
