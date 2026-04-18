import "../index.css";
import "../App.css";

export const metadata = {
  metadataBase: new URL("https://jbtasoitusmaalaus.fi"),
  title: "J&B Tasoitus ja Maalaus Oy",
  description: "Tasoitus- ja maalaustyöt Helsingissä ja Uudellamaalla.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
