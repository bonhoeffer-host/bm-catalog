import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Bonhoeffer Machines | Industrial Equipment Catalogs",
    template: "%s | Bonhoeffer Machines"
  },
  description: "Browse comprehensive digital catalogs of industrial machinery and equipment from Bonhoeffer Machines. View detailed specifications, technical drawings, and product information in our interactive catalog viewer.",
  keywords: [
    "industrial machinery",
    "equipment catalogs",
    "manufacturing equipment",
    "Bonhoeffer Machines",
    "technical specifications",
    "industrial products",
    "machinery catalog",
    "equipment documentation"
  ],
  authors: [{ name: "Bonhoeffer Machines" }],
  creator: "Bonhoeffer Machines",
  publisher: "Bonhoeffer Machines",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    // Add your verification codes when available
    // google: "your-google-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "Industrial Equipment",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://catalog.bonhoeffermachines.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Bonhoeffer Machines Catalog",
    title: "Bonhoeffer Machines | Industrial Equipment Catalogs",
    description: "Browse comprehensive digital catalogs of industrial machinery and equipment. View detailed specifications and technical information in our interactive catalog viewer.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@bonhoeffermachines", // Replace with actual Twitter handle
    creator: "@bonhoeffermachines",
    title: "Bonhoeffer Machines | Industrial Equipment Catalogs",
    description: "Browse comprehensive digital catalogs of industrial machinery and equipment.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BM Catalog",
  },
  applicationName: "Bonhoeffer Machines Catalog",
  generator: "Next.js",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#989b2e" />
        <meta name="msapplication-TileColor" content="#989b2e" />
        
        {/* Enhanced security headers */}
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Bonhoeffer Machines",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://catalog.bonhoeffermachines.com",
              "description": "Industrial machinery and equipment manufacturer providing comprehensive digital catalogs and technical documentation.",
              "industry": "Industrial Equipment Manufacturing",
              "foundingDate": "1950", // Update with actual founding date
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US" // Update with actual address
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": "English"
              }
            })
          }}
        />
        
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Bonhoeffer Machines Catalog",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://catalog.bonhoeffermachines.com",
              "description": "Digital catalog platform for industrial machinery and equipment specifications.",
              "publisher": {
                "@type": "Organization",
                "name": "Bonhoeffer Machines"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://catalog.bonhoeffermachines.com"}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} font-sans antialiased min-h-screen bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}