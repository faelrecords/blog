"use client";

import { FormEvent, useId, useState } from "react";
import { Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { NEWSLETTER_DEFAULTS } from "@/lib/newsletter";

export type NewsletterSignupContent = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  consentText?: string;
};

export function NewsletterSignup({
  content = {},
  compact = false,
}: {
  content?: NewsletterSignupContent;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const formId = useId().replaceAll(":", "");
  const [state, setState] = useState<"idle" | "busy" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "busy") return;
    setState("busy");
    setMessage("Enviando...");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        consent: data.get("consent") === "on",
        website: data.get("website"),
        source: pathname,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setState("success");
      setMessage(
        result.message ||
          "Cadastro realizado. Obrigado por acompanhar a GTChat!",
      );
      form.reset();
    } else {
      setState("error");
      setMessage(result.error || "Não foi possível concluir o cadastro.");
    }
  }

  return (
    <section
      className={`newsletter-signup ${compact ? "newsletter-compact" : ""}`}
      aria-labelledby={`newsletter-title-${formId}`}
    >
      <div className="newsletter-copy">
        <span className="newsletter-icon" aria-hidden="true">
          <Mail />
        </span>
        <div>
          <h2 id={`newsletter-title-${formId}`}>
            {content.title || NEWSLETTER_DEFAULTS.title}
          </h2>
          <p>{content.description || NEWSLETTER_DEFAULTS.description}</p>
        </div>
      </div>
      <form className="newsletter-form" onSubmit={submit} noValidate>
        <div className="newsletter-fields">
          <div className="field">
            <label htmlFor={`newsletter-name-${formId}`}>
              Nome <small>(opcional)</small>
            </label>
            <input
              className="input"
              id={`newsletter-name-${formId}`}
              name="name"
              autoComplete="name"
              maxLength={100}
            />
          </div>
          <div className="field">
            <label htmlFor={`newsletter-email-${formId}`}>E-mail</label>
            <input
              className="input"
              id={`newsletter-email-${formId}`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
            />
          </div>
        </div>
        <div className="newsletter-honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="newsletter-consent">
          <input name="consent" type="checkbox" required />
          <span>{content.consentText || NEWSLETTER_DEFAULTS.consent_text}</span>
        </label>
        <button className="btn btn-primary" disabled={state === "busy"}>
          {state === "busy"
            ? "Enviando..."
            : content.buttonLabel || NEWSLETTER_DEFAULTS.button_label}
        </button>
        <p
          className={`newsletter-message newsletter-message-${state}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </form>
    </section>
  );
}
