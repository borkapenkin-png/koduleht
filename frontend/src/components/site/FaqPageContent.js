import { ChevronDown, HelpCircle, Phone } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PublicPageHero from "@/components/site/PublicPageHero";
import { getThemeStyle } from "@/lib/site-helpers";

export default function FaqPageContent({ settings, servicePages, services, groupedFaqs }) {
  const themeStyle = getThemeStyle(settings);
  const phone = (settings.company_phone_primary || settings.contact_phone_1 || "+358 40 054 7270").replace(/\s/g, "");

  return (
    <div style={themeStyle}>
      <SiteHeader settings={settings} servicePages={servicePages} />

      <main>
        <PublicPageHero
          title="Usein kysytyt kysymykset"
          description="Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoituspalveluistamme. UKK käsittelee hinnoittelua, kotitalousvähennystä, työaikoja ja materiaaleja."
          imageUrl={settings.hero_image_url}
        />

        <section className="section-padding bg-white">
          <div className="container-custom max-w-4xl">
            {groupedFaqs.general?.length ? (
              <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">Yleiset kysymykset</h2>
                <div className="space-y-4">
                  {groupedFaqs.general.map((faq) => (
                    <details key={faq.id} className="group rounded-2xl border border-[#E2E8F0] bg-[#FAFBFC] p-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <span className="flex items-center gap-3 text-lg font-semibold text-[#0F172A]">
                          <HelpCircle size={18} className="text-primary" />
                          {faq.question}
                        </span>
                        <ChevronDown size={18} className="text-primary transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="pt-4 text-sm leading-7 text-[#64748B]">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}

            {Object.entries(groupedFaqs.by_service || {}).map(([serviceId, serviceGroup]) => {
              const service = services.find((item) => item.id === serviceId);
              return (
                <div key={serviceId} className="mb-12">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#0F172A]">{serviceGroup.service_title || service?.title || "Palvelu"}</h2>
                    <p className="mt-2 text-sm text-[#64748B]">{serviceGroup.faqs.length} kysymystä</p>
                  </div>

                  <div className="space-y-4">
                    {serviceGroup.faqs.map((faq) => (
                      <details key={faq.id} className="group rounded-2xl border border-[#E2E8F0] bg-[#FAFBFC] p-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                          <span className="flex items-center gap-3 text-lg font-semibold text-[#0F172A]">
                            <HelpCircle size={18} className="text-primary" />
                            {faq.question}
                          </span>
                          <ChevronDown size={18} className="text-primary transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="pt-4 text-sm leading-7 text-[#64748B]">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section-padding bg-[#F8FAFC]">
          <div className="container-custom">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-8 text-center md:p-12">
              <h2 className="text-3xl font-bold text-[#0F172A]">Etkö löytänyt vastausta?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#64748B] md:text-base">
                Ota yhteyttä ja vastaamme kysymyksiin nopeasti. Tarvittaessa tulemme myös paikan päälle arvioimaan kohteen.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="/#yhteystiedot" className="btn-primary">
                  Ota yhteyttä
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
