import { Cairo } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/shared/client-providers";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import data from "@/lib/data";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = data.settings[0];
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
  };
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setting = data.settings[0];
  const currencyCookie = (await cookies()).get("currency");
  const currency = currencyCookie ? currencyCookie.value : "EGP";
  
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error:', error);
    session = null;
  }

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`min-h-screen ${cairo.variable} font-cairo antialiased`}
      >
        <ClientProviders session={session}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
