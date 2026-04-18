import PriceCalculatorPage from "@/components/calculator/PriceCalculatorPage";
import { getCalculatorData } from "@/lib/site-api";

export async function generateMetadata() {
  const { pageData } = await getCalculatorData();

  return {
    title: pageData?.seo_title || "Hintalaskuri | J&B Tasoitus ja Maalaus",
    description:
      pageData?.seo_description ||
      "Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Kotitalousvähennys huomioidaan automaattisesti.",
  };
}

export default function HintalaskuriPage() {
  return <PriceCalculatorPage />;
}
