import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const title = settings.site_title || "GTChat Blog";
  const description = settings.site_description || "Conteúdo sobre atendimento inteligente.";
  return { title: { default: title, template: `%s | ${title}` }, description, metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"), icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined, openGraph: { title, description, type: "website", locale: "pt_BR", images: [{ url: "/og.png", width: 1200, height: 630, alt: "GTChat Blog — Ideias para transformar cada conversa" }] }, twitter: { card: "summary_large_image", title, description, images: ["/og.png"] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = getSettings();
  const style = { "--primary": settings.primary_color || "#106e00", "--accent": settings.accent_color || "#006781", "--bg": settings.background_color || "#f8f9ff", "--text": settings.text_color || "#0b1c30", "--heading-font": `\"${settings.heading_font || "Hanken Grotesk"}\"`, "--body-font": `\"${settings.body_font || "Inter"}\"` } as React.CSSProperties;
  return <html lang="pt-BR" style={style}><body>{children}</body></html>;
}
