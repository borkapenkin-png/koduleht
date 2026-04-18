import { Building2, Calendar, MapPin, Phone } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PublicPageHero from "@/components/site/PublicPageHero";
import { getThemeStyle } from "@/lib/site-helpers";
import { withApiUrl } from "@/lib/site-api";

export default function ReferencesPageContent({ settings, servicePages, references }) {
  const themeStyle = getThemeStyle(settings);
  const phone = (settings.company_phone_primary || settings.contact_phone_1 || "+358 40 054 7270").replace(/\s/g, "");

  return (
    <div style={themeStyle}>
      <SiteHeader settings={settings} servicePages={servicePages} />

      <main>
        <PublicPageHero
          title="Referenssit"
          description="Tutustu J&B Tasoitus ja Maalaus Oy:n toteuttamiin kohteisiin. Laadukkaita maalaus- ja tasoitustöitä Helsingissä ja Uudellamaalla."
          imageUrl={settings.hero_image_url}
          backHref="/"
          backLabel="Takaisin etusivulle"
          contentClassName="max-w-[860px]"
        />

        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {references.map((reference) => (
                <article key={reference.id} className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-[#FAFBFC]">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={withApiUrl(reference.cover_image_url) || "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=800"}
                      alt={reference.cover_image_alt || reference.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5 md:p-6">
                    <h2 className="text-xl font-semibold text-[#0F172A]">{reference.name}</h2>
                    {reference.type ? <p className="mt-2 text-sm font-medium text-primary">{reference.type}</p> : null}
                    {reference.description ? <p className="mt-3 text-sm leading-7 text-[#64748B]">{reference.description}</p> : null}

                    <div className="mt-5 space-y-2 border-t border-[#E2E8F0] pt-4 text-sm text-[#64748B]">
                      {reference.main_contractor ? (
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-primary" />
                          <span>{reference.main_contractor}</span>
                        </div>
                      ) : null}
                      {reference.location ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary" />
                          <span>{reference.location}</span>
                        </div>
                      ) : null}
                      {reference.year ? (
                        <div className="flex items-center gap-2">
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

        <section className="section-padding bg-[#F8FAFC]">
          <div className="container-custom">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-8 text-center md:p-12">
              <h2 className="text-3xl font-bold text-[#0F172A]">Haluatko samanlaisen lopputuloksen?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#64748B] md:text-base">
                Ota yhteyttä ja pyydä ilmainen arvio. Käymme kohteen läpi nopeasti ja ehdotamme sopivan toteutustavan.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="/#yhteystiedot" className="btn-primary">
                  Pyydä tarjous
                </a>
                <a href={`tel:${phone}`} className="btn-secondary inline-flex items-center justify-center gap-2">
                  <Phone size={16} /> Soita nyt
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} servicePages={servicePages} />
    </div>
  );
}

