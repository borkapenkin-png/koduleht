import Link from "@/components/site/RouterLink";
import { ArrowRight, Calculator, CheckCircle, Mail, MapPin, Phone } from "lucide-react";
import QuoteRequestForm from "@/components/QuoteRequestFormClean";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getServiceById, getThemeStyle } from "@/lib/site-helpers";
import { withApiUrl } from "@/lib/site-api";

export default function ServicePageContent({
  settings,
  services,
  allPages,
  areas,
  page,
  faqs,
  relatedPages,
  currentArea,
  baseSlug,
  isGeneralPage,
}) {
  const themeStyle = getThemeStyle(settings);
  const service = getServiceById(services, page.service_id);
  const heroImage =
    withApiUrl(page.hero_image_url) ||
    withApiUrl(service?.image_url) ||
    withApiUrl(settings.hero_image_url) ||
    "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
  const phone = settings.company_phone_primary || settings.contact_phone_1 || "+358 40 054 7270";
  const email = settings.company_email || settings.contact_email || "info@jbtasoitusmaalaus.fi";
  const address = settings.company_address || settings.contact_address || "Sienitie 25, 00760 Helsinki";
  const whyItems = page.why_items?.length ? page.why_items : settings.why_choose_us || [];
  const visibleAreas = areas.filter((area) => !currentArea || area.slug !== currentArea.slug);
  const trustItems = [
    {
      title: settings.trust_badge_1_title || "Vuodesta 2018",
      subtitle: settings.trust_badge_1_subtitle || "Luotettava kokemus",
    },
    {
      title: settings.trust_badge_2_title || "Ammattitaitoinen työ",
      subtitle: settings.trust_badge_2_subtitle || "Laadukas lopputulos",
    },
    {
      title: settings.trust_badge_3_title || "Kotitalousvähennys",
      subtitle: settings.trust_badge_3_subtitle || "Hyödynnä veroetu",
    },
    {
      title: settings.trust_badge_4_title || "Tyytyväisyystakuu",
      subtitle: settings.trust_badge_4_subtitle || "100% tyytyväisyys",
    },
  ];

  return (
    <div style={themeStyle}>
      <SiteHeader settings={settings} servicePages={allPages} />

      <main>
        <section className="relative flex min-h-[60vh] items-end pt-24 md:min-h-[68vh] md:pt-32">
          <div className="absolute inset-0">
            <img src={heroImage} alt={page.hero_title || page.seo_title} className="h-full w-full object-cover" />
            <div className="hero-overlay absolute inset-0" />
          </div>

          <div className="container-custom relative z-10 pb-10 md:pb-14">
            <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
              <Link href="/">Etusivu</Link>
              <span>/</span>
              <a href="/#palvelut">Palvelut</a>
              <span>/</span>
              <span className="font-medium text-[#0F172A]">{page.hero_title || page.seo_title}</span>
            </nav>

            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-primary">Palvelumme</p>
              <h1 className="text-4xl font-bold leading-tight text-[#0F172A] md:text-6xl">{page.hero_title || page.seo_title}</h1>
              {page.hero_subtitle ? <p className="mt-5 text-base leading-7 text-[#64748B] md:text-lg md:leading-8">{page.hero_subtitle}</p> : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#tarjouspyynto" className="btn-primary min-w-[180px] inline-flex items-center justify-center gap-2">
                  Pyydä tarjous <ArrowRight size={18} />
                </a>
                <Link href="/hintalaskuri" className="btn-secondary min-w-[155px] inline-flex items-center justify-center gap-2">
                  <Calculator size={18} /> Hintalaskuri
                </Link>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-secondary min-w-[150px] inline-flex items-center justify-center gap-2">
                  <Phone size={18} /> Soita nyt
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[#64748B] md:gap-8 md:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-primary" />
                  <span>{settings.trust_badge_3_title || "Kotitalousvähennys maalaus- ja tasoitustöistä"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-primary" />
                  <span>{settings.trust_badge_4_title || "Tyytyväisyystakuu"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#E8EEF2] bg-[#FAFCFD] py-5">
          <div className="container-custom">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="icon-box !h-8 !w-8">
                    <CheckCircle size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                    <p className="text-xs text-[#94A3B8]">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-custom grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Palvelun kuvaus</p>
              <h2 className="section-title">{page.description_title || "Mitä tarjoamme"}</h2>
              <div className="service-description-content mt-6" dangerouslySetInnerHTML={{ __html: page.description_text || "<p>Ammattitaitoista palvelua.</p>" }} />
            </div>

            <div className="space-y-5 lg:pt-14">
              <div className="overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-[#FAFBFC] shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <img src={heroImage} alt={page.hero_title || page.seo_title} className="h-[320px] w-full object-cover md:h-[360px]" />
              </div>

              <div className="rounded-[28px] border border-[#E2E8F0] bg-[#FAFBFC] p-6">
                <h3 className="text-2xl font-bold text-[#0F172A]">Ota yhteyttä</h3>
                <div className="mt-5 space-y-3 text-sm text-[#334155]">
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-3">
                    <Phone size={16} className="text-primary" />
                    <span>{phone}</span>
                  </a>
                  <a href={`mailto:${email}`} className="flex items-center gap-3">
                    <Mail size={16} className="text-primary" />
                    <span>{email}</span>
                  </a>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-1 text-primary" />
                    <span>{address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {page.features?.length ? (
          <section className="section-padding bg-[#F8FAFC]">
            <div className="container-custom">
              <div className="mb-8 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Palvelun sisältö</p>
                <h2 className="section-title">{page.features_title || "Mitä palvelu sisältää"}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {page.features.map((feature, index) => (
                  <article key={`${feature.title}-${index}`} className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <CheckCircle size={18} className="text-primary" />
                      <h3 className="text-lg font-semibold text-[#0F172A]">{feature.title}</h3>
                    </div>
                    <p className="text-sm leading-7 text-[#64748B]">{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {(whyItems.length || page.why_title) ? (
          <section className="section-padding bg-white">
            <div className="container-custom grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Miksi valita meidät</p>
                <h2 className="section-title">{page.why_title || "Luotettava tekijä pintaremontteihin"}</h2>
                <div className="mt-6 space-y-3">
                  {whyItems.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#FAFBFC] p-4">
                      <CheckCircle size={18} className="mt-0.5 text-primary" />
                      <span className="text-sm leading-7 text-[#0F172A]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="tarjouspyynto" className="rounded-[28px] border border-[#E2E8F0] bg-[#FAFBFC] p-6 md:p-8">
                <h3 className="text-2xl font-bold text-[#0F172A]">Pyydä ilmainen arvio</h3>
                <p className="mt-3 text-sm leading-7 text-[#64748B]">
                  Lähetä projektin tiedot ja saat tarjouksen nopeasti, selkeästi ja ilman turhaa edestakaista viestittelyä.
                </p>
                <div className="mt-6">
                  <QuoteRequestForm preselectedService={service?.id || null} />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {isGeneralPage && baseSlug ? (
          <section className="section-padding bg-[#F8FAFC]">
            <div className="container-custom">
              <div className="mb-8 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Palvelualueet</p>
                <h2 className="section-title">Palvelemme seuraavilla alueilla</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {areas.map((area) => (
                  <Link key={area.slug} href={`/${baseSlug}-${area.slug}`} className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 text-sm font-medium text-[#0F172A] transition-colors hover:border-primary/30 hover:text-primary">
                    {area.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {currentArea || baseSlug ? (
          <section className="section-padding bg-white">
            <div className="container-custom">
              <div className="mb-8 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Muut alueet</p>
                <h2 className="section-title">Katso myös muut palvelualueet</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {baseSlug ? (
                  <Link href={`/${baseSlug}`} className="rounded-full border border-[#E2E8F0] bg-[#FAFBFC] px-4 py-2 text-sm font-medium text-[#0F172A] hover:border-primary/30 hover:text-primary">
                    Kaikki alueet
                  </Link>
                ) : null}
                {visibleAreas.map((area) => (
                  <Link
                    key={area.slug}
                    href={`/${baseSlug || slugFromPage(page.slug, currentArea)}-${area.slug}`.replace("--", "-")}
                    className="rounded-full border border-[#E2E8F0] bg-[#FAFBFC] px-4 py-2 text-sm font-medium text-[#0F172A] hover:border-primary/30 hover:text-primary"
                  >
                    {area.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {faqs?.length ? (
          <section className="section-padding bg-[#F8FAFC]">
            <div className="container-custom max-w-4xl">
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Usein kysytyt kysymykset</p>
                <h2 className="section-title">UKK - {page.hero_title || page.seo_title}</h2>
              </div>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <article key={faq.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                    <h3 className="text-lg font-semibold text-[#0F172A]">{faq.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#64748B]">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {relatedPages.length ? (
          <section className="section-padding bg-white">
            <div className="container-custom">
              <div className="mb-8 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-primary">Muut palvelut</p>
                <h2 className="section-title">Katso myös nämä palvelut</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {relatedPages.map((relatedPage) => (
                  <Link key={relatedPage.id} href={`/${relatedPage.slug}`} className="rounded-2xl border border-[#E2E8F0] bg-[#FAFBFC] p-5 transition-colors hover:border-primary/30">
                    <h3 className="text-lg font-semibold text-[#0F172A]">{relatedPage.hero_title || relatedPage.seo_title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#64748B]">{(relatedPage.seo_description || "").slice(0, 160)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter settings={settings} servicePages={allPages} />
    </div>
  );
}

function slugFromPage(pageSlug = "", currentArea) {
  if (!pageSlug || !currentArea?.slug) return pageSlug;
  return pageSlug.replace(`-${currentArea.slug}`, "");
}

