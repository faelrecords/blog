import Link from "next/link";
import { getSettings } from "@/lib/db";

export function SiteFooter() {
  const settings = getSettings();
  const brandName = settings.logo_text || "GTChat";

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="brand">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={brandName}
                style={{ height: 42, width: "auto", objectFit: "contain" }}
              />
            ) : (
              <span className="brand-mark">GT</span>
            )}
            {brandName}
          </div>
          <small>{settings.footer_text}</small>
        </div>
        <div>
          © {new Date().getFullYear()} {brandName} · <Link href="/artigos">Artigos</Link> ·{" "}
          <a href={settings.linkedin_url || "#"}>LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
