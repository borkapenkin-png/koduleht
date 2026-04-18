import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { withApiUrl } from "@/lib/site-api";

export default function PublicPageHero({ title, description, imageUrl, backHref = "/", backLabel = "Takaisin etusivulle" }) {
  return (
    <section className="relative flex min-h-[38vh] items-end pt-24 md:min-h-[42vh] md:pt-32">
      <div className="absolute inset-0">
        <img
          src={withApiUrl(imageUrl) || "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      <div className="container-custom relative z-10 pb-10 md:pb-14">
        <Link href={backHref} className="mb-5 inline-flex items-center gap-2 text-sm text-[#64748B] transition-colors hover:text-primary">
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-[#0F172A] md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-[#64748B] md:text-lg">{description}</p> : null}
      </div>
    </section>
  );
}
