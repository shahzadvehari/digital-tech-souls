import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let title = "Digital Tech Souls | Premium Hosting & Digital Solutions";
  let description = "Fast, Secure and Affordable Hosting with Professional Web Development, Digital Marketing and Graphic Design Services.";
  let keywords = "web hosting, cpanel, wordpress, digital marketing, web development";
  let favicon = "/favicon.ico";
  let author = "Digital Tech Souls";
  let robots = "index, follow";
  let canonicalUrl = "";
  let ogImage = "/images/hero-hosting.png";

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const settings = await res.json();
      const seoTitle = settings.find((s: any) => s.key === 'seo_title')?.value;
      const seoDesc = settings.find((s: any) => s.key === 'seo_description')?.value;
      const seoKeywords = settings.find((s: any) => s.key === 'seo_keywords')?.value;
      const siteFavicon = settings.find((s: any) => s.key === 'siteFavicon')?.value;
      const seoAuthor = settings.find((s: any) => s.key === 'seo_author')?.value;
      const seoRobots = settings.find((s: any) => s.key === 'seo_robots')?.value;
      const seoCanonical = settings.find((s: any) => s.key === 'seo_canonical_url')?.value;
      const seoOgImage = settings.find((s: any) => s.key === 'seo_og_image')?.value;
      
      if (seoTitle) title = seoTitle;
      if (seoDesc) description = seoDesc;
      if (seoKeywords) keywords = seoKeywords;
      if (siteFavicon) favicon = siteFavicon;
      if (seoAuthor) author = seoAuthor;
      if (seoRobots) robots = seoRobots;
      if (seoCanonical) canonicalUrl = seoCanonical;
      if (seoOgImage) ogImage = seoOgImage;
    }
  } catch (error) {
    console.error("Failed to fetch SEO settings", error);
  }

  const meta: Metadata = {
    title,
    description,
    keywords,
    authors: [{ name: author }],
    robots: {
      index: robots.includes('index') && !robots.includes('noindex'),
      follow: robots.includes('follow') && !robots.includes('nofollow'),
    },
    icons: {
      icon: favicon,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    }
  };

  if (canonicalUrl) {
    meta.alternates = {
      canonical: canonicalUrl,
    };
  }

  return meta;
}

import Script from "next/script";
import LocalTracker from "../components/LocalTracker";
import AdPlacement from "@/components/AdPlacement";
import { CurrencyProvider } from "@/context/CurrencyContext";
import FloatingSupport from "@/components/FloatingSupport";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let gaMeasurementId = null;
  let typography = {
    fontGlobal: 'var(--font-geist-sans), Arial, sans-serif',
    fontHeading: 'var(--font-geist-sans), Arial, sans-serif',
    colorHeading: '#ffffff',
    colorParagraph: '#d1d5db',
    heroTitleSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    heroTitleColor: '#ffffff'
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const settings = await res.json();
      gaMeasurementId = settings.find((s: any) => s.key === 'ga_measurement_id')?.value;
      
      const getVal = (k: string) => settings.find((s: any) => s.key === k)?.value;
      if (getVal('fontGlobal')) typography.fontGlobal = getVal('fontGlobal');
      if (getVal('fontHeading')) typography.fontHeading = getVal('fontHeading');
      if (getVal('colorHeading')) typography.colorHeading = getVal('colorHeading');
      if (getVal('colorParagraph')) typography.colorParagraph = getVal('colorParagraph');
      if (getVal('heroTitleSize')) typography.heroTitleSize = getVal('heroTitleSize');
      if (getVal('heroTitleColor')) typography.heroTitleColor = getVal('heroTitleColor');
    }
  } catch (e) {}

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {gaMeasurementId && (
        <head>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </head>
      )}
      {!gaMeasurementId && <head />}
      <body 
        className="min-h-screen flex flex-col relative"
        style={{
          '--font-global': typography.fontGlobal,
          '--font-heading': typography.fontHeading,
          '--color-heading': typography.colorHeading,
          '--color-paragraph': typography.colorParagraph,
          '--hero-title-size': typography.heroTitleSize,
          '--hero-title-color': typography.heroTitleColor,
        } as React.CSSProperties}
      >
        <CurrencyProvider>
          <ClientNavbarWrapper />
          <AdPlacement placementKey="ad_header_code" className="absolute top-[80px] z-50 pointer-events-none" />
          {children}
          <AdPlacement placementKey="ad_footer_code" />
          <FloatingSupport />
          <FloatingWhatsApp />
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
