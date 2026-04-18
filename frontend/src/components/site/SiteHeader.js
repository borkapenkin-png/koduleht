"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { withApiUrl } from "@/lib/public-env";

export default function SiteHeaderLegacy({ settings = {}, isHome = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const logo = withApiUrl(settings.logo_url);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: isHome ? "#palvelut" : "/#palvelut", label: "Palvelut" },
    { href: isHome ? "#meista" : "/#meista", label: "Meistä" },
    { href: "/referenssit", label: "Referenssit" },
    { href: "/ukk", label: "UKK" },
    { href: "/hintalaskuri", label: "Hintalaskuri" },
    { href: isHome ? "#yhteystiedot" : "/#yhteystiedot", label: "Yhteystiedot" },
  ];

  const getHref = (href) => {
    if (!href.startsWith("#")) return href;
    return isHomePage ? href : `/${href}`;
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed inset-x-0 top-0 z-50 border-b border-[#E2E8F0] transition-all duration-300 ${
        isScrolled ? "navbar-glass shadow-sm" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center" data-testid="logo-link">
            {logo ? (
              <img
                src={logo}
                alt={settings.company_name || "J&B Tasoitus ja Maalaus Oy"}
                className="h-10 w-auto max-w-[180px] object-contain md:h-12"
              />
            ) : (
              <span className="text-lg font-bold text-[#0F172A] md:text-xl">
                {settings.company_name || "J&B Tasoitus ja Maalaus Oy"}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("#") || link.href.includes("#") ? (
                <a key={link.href} href={getHref(link.href)} className="nav-link text-sm font-medium transition-colors">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="nav-link text-sm font-medium transition-colors">
                  {link.label}
                </Link>
              ),
            )}
            <a href={getHref("#yhteystiedot")} className="btn-primary px-4 py-2 text-sm">
              Pyydä tarjous
            </a>
          </nav>

          <button type="button" className="p-2 lg:hidden" onClick={() => setIsOpen((value) => !value)} aria-label="Avaa valikko">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-[#E2E8F0] bg-white py-4 lg:hidden">
            <div className="space-y-1">
              {navLinks.map((link) =>
                link.href.startsWith("#") || link.href.includes("#") ? (
                  <a key={link.href} href={getHref(link.href)} className="nav-link-mobile" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className="nav-link-mobile" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ),
              )}
              <div className="px-4 pt-2">
                <a href={getHref("#yhteystiedot")} className="btn-primary block text-center text-sm" onClick={() => setIsOpen(false)}>
                  Pyydä tarjous
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
