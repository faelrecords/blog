import { z } from "zod";

export const NEWSLETTER_DEFAULTS = {
  title: "Conteúdos exclusivos no seu e-mail",
  description:
    "Receba novidades, estratégias e materiais da GTChat para transformar cada conversa.",
  button_label: "Quero receber",
  consent_text: "Aceito receber conteúdos e comunicações da GTChat por e-mail.",
  consent_version: "v1",
} as const;

export const newsletterSignupSchema = z.object({
  name: z.string().trim().max(100).default(""),
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
  source: z.string().trim().max(500).default("/"),
  website: z.string().max(200).default(""),
});

export const subscriberUpdateSchema = z
  .object({
    name: z.string().trim().max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export const newsletterSettingsSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(500),
  button_label: z.string().trim().min(2).max(60),
  consent_text: z.string().trim().min(5).max(500),
});

export function normalizeNewsletterSource(value: string) {
  try {
    const parsed = new URL(value, "http://local");
    return `${parsed.pathname}${parsed.search}`.slice(0, 500) || "/";
  } catch {
    return "/";
  }
}

export type SubscriberCsvRow = {
  name: string;
  email: string;
  status: string;
  source_path: string;
  consented_at: string;
};

export function escapeCsvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function subscribersToCsv(rows: SubscriberCsvRow[]) {
  const header = ["Nome", "E-mail", "Status", "Origem", "Consentimento"];
  const lines = rows.map((row) =>
    [row.name, row.email, row.status, row.source_path, row.consented_at]
      .map(escapeCsvCell)
      .join(","),
  );
  return `\uFEFF${header.map(escapeCsvCell).join(",")}\r\n${lines.join("\r\n")}`;
}
