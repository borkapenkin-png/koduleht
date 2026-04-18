import FaqPageContent from "@/components/site/FaqPageContent";
import { getFaqData } from "@/lib/site-api";

export const metadata = {
  title: "Usein kysytyt kysymykset | J&B Tasoitus ja Maalaus",
  description: "Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoitustöistä, aikatauluista ja kotitalousvähennyksestä.",
};

export default async function FaqPage() {
  const { settings, services, servicePages, groupedFaqs } = await getFaqData();
  return <FaqPageContent settings={settings} servicePages={servicePages} services={services} groupedFaqs={groupedFaqs} />;
}
