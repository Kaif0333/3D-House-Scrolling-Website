import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Display face — high-contrast, optically sized, with real italics. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const SITE_URL = "https://villa-scroll.vercel.app";
const DESCRIPTION =
  "A cinematic scroll-through of Villa Horizon — a 1,450 m² contemporary residence above Lake Como. Three bespoke suites from $9.8M, private viewings by appointment.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Villa Horizon — A Residence Above Lake Como",
    template: "%s — Villa Horizon",
  },
  description: DESCRIPTION,
  applicationName: "Villa Horizon",
  keywords: [
    "luxury villa",
    "Lake Como property",
    "contemporary architecture",
    "private residence",
    "architectural showcase",
  ],
  authors: [{ name: "Atelier Vermeer" }],
  creator: "Atelier Vermeer",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Villa Horizon",
    title: "Villa Horizon — A Residence Above Lake Como",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Horizon — A Residence Above Lake Como",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Structured data so the listing is legible to search engines. */
const listingSchema = {
  "@context": "https://schema.org",
  "@type": "SingleFamilyResidence",
  name: "Villa Horizon",
  description: DESCRIPTION,
  url: SITE_URL,
  numberOfRooms: 9,
  floorSize: { "@type": "QuantitativeValue", value: 1450, unitCode: "MTK" },
  address: {
    "@type": "PostalAddress",
    addressRegion: "Lombardy",
    addressCountry: "IT",
  },
  geo: { "@type": "GeoCoordinates", latitude: 45.9829, longitude: 9.2585 },
  amenityFeature: [
    "Infinity pool",
    "Thermal spa and sauna",
    "Climate wine vault",
    "Private cinema",
    "Helipad",
  ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="bg-ink text-bone min-h-full flex flex-col">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
