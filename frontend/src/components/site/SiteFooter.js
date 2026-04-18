import Link from "@/components/site/RouterLink";
import { withApiUrl } from "@/lib/public-env";

export default function SiteFooterLegacy({ settings = {}, servicePages = [] }) {
  const footerServices = servicePages.filter((page) => page.is_published);
  const companyName = settings.company_name || "J&B Tasoitus ja Maalaus Oy";
  const footerDescription = settings.footer_description || "Tasoitus- ja maalaustyöt Helsingissä ja Uudellamaalla.";
  const footerServiceArea = settings.footer_service_area || "Palvelemme asiakkaita HelsingissÃ¤ ja koko Uudenmaan alueella.";
  const city = settings.company_city || "Helsinki";
  const logo = withApiUrl(settings.logo_url);

  return (
    <footer data-testid="footer" className="footer-bg py-10 text-white md:py-14">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          <div>
            {logo ? (
              <img src={logo} alt={companyName} className="mb-4 h-10 w-auto max-w-[180px] object-contain md:h-12" />
            ) : (
              <h2 className="mb-4 text-2xl font-bold text-white">{companyName}</h2>
            )}
            <p className="mb-2 text-sm font-medium text-white/80">{companyName}</p>
            <p className="text-xs leading-relaxed text-white/60 md:text-sm">{footerDescription}</p>
            <p className="mt-4 text-xs leading-relaxed text-white/50">{footerServiceArea}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white/80">Palvelumme:</p>
            <ul className="grid grid-cols-1 gap-y-2 text-xs text-white/60 md:text-sm">
              {footerServices.map((page) => (
                <li key={page.id || page.slug}>
                  <Link href={`/${page.slug}`} className="transition-colors hover:text-white">
                    {page.hero_title || page.title || page.seo_title || page.slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-white/80">Sivusto</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60 md:text-sm">
              <a href="/#palvelut" className="transition-colors hover:text-white">Palvelut</a>
              <a href="/#meista" className="transition-colors hover:text-white">Meistä</a>
              <Link href="/referenssit" className="transition-colors hover:text-white">Referenssit</Link>
              <Link href="/ukk" className="transition-colors hover:text-white">UKK</Link>
              <Link href="/hintalaskuri" className="transition-colors hover:text-white">Hintalaskuri</Link>
              <a href="/#yhteystiedot" className="transition-colors hover:text-white">Yhteystiedot</a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40 md:mt-10 md:pt-8">
          <p>© {new Date().getFullYear()} {companyName} · {city}, Finland</p>
        </div>
      </div>
    </footer>
  );
}

