import ReferencesPageContent from "@/components/site/ReferencesPageContent";
import { getReferencesData } from "@/lib/site-api";

export const metadata = {
  title: "Referenssit | J&B Tasoitus ja Maalaus",
  description: "Tutustu J&B Tasoitus ja Maalaus toteuttamiin referenssikohteisiin Helsingissä ja Uudellamaalla.",
};

export default async function ReferencesPage() {
  const { settings, servicePages, references } = await getReferencesData();
  return <ReferencesPageContent settings={settings} servicePages={servicePages} references={references} />;
}
