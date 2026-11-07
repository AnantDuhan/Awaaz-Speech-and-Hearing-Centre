import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { allowSearchIndexing } from "@/content/launch";
import { site } from "@/content/site";
import "./globals.css";

// Nunito (SIL Open Font License, see src/fonts/OFL.txt), bundled so the build
// never needs to reach Google Fonts.
const nunito = localFont({
  src: "../fonts/Nunito-Variable-latin.woff2",
  variable: "--font-nunito",
  weight: "200 1000",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Speech, language & hearing centre in ${site.address.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  // Adds <meta name="robots" content="noindex, nofollow"> to every page until launch.
  robots: allowSearchIndexing ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1b3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <Header />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
