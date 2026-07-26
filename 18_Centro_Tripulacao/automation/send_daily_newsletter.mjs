#!/usr/bin/env node

/*
 * Template server-side. Dry-run por padrão.
 * Nunca importe este arquivo no frontend e nunca registre destinatários.
 */

const sendMode = process.argv.includes("--send");
const requiredBase = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SITE_URL",
  "NEWSLETTER_FROM",
  "UNSUBSCRIBE_BASE_URL"
];
const requiredSend = [
  "EMAIL_PROVIDER_ENDPOINT",
  "EMAIL_PROVIDER_ALLOWED_HOSTS",
  "EMAIL_PROVIDER_API_KEY",
  "NEWSLETTER_SUBJECT",
  "NEWSLETTER_TEXT"
];

function requireEnvironment(names) {
  const missing = names.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) {
    throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(", ")}`);
  }
}

function httpsUrl(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${label} deve usar HTTPS.`);
  return url;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function safeText(value, maximum) {
  return String(value || "").trim().replace(/\u0000/g, "").slice(0, maximum);
}

async function loadConsentedRecipients() {
  const base = httpsUrl(process.env.SUPABASE_URL, "SUPABASE_URL");
  const endpoint = new URL(
    "/rest/v1/subscriptions?select=id,email,frequency,consent_at,unsubscribe_token&status=eq.active&frequency=eq.daily&consent_at=not.is.null&unsubscribed_at=is.null&limit=5000",
    base
  );
  const response = await fetch(endpoint, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer"
  });
  if (!response.ok) {
    throw new Error(`Falha ao consultar assinaturas consentidas (${response.status}).`);
  }
  const rows = await response.json();
  return Array.isArray(rows)
    ? rows.filter((row) =>
        row &&
        validEmail(row.email) &&
        row.frequency === "daily" &&
        row.consent_at &&
        row.unsubscribe_token
      )
    : [];
}

function providerEndpoint() {
  const endpoint = httpsUrl(process.env.EMAIL_PROVIDER_ENDPOINT, "EMAIL_PROVIDER_ENDPOINT");
  const allowedHosts = new Set(
    String(process.env.EMAIL_PROVIDER_ALLOWED_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean)
  );
  if (!allowedHosts.has(endpoint.hostname.toLowerCase())) {
    throw new Error("Host do provedor não está na allowlist.");
  }
  return endpoint;
}

async function deliver(recipient, endpoint) {
  const unsubscribeBase = httpsUrl(
    process.env.UNSUBSCRIBE_BASE_URL,
    "UNSUBSCRIBE_BASE_URL"
  );
  unsubscribeBase.searchParams.set("token", recipient.unsubscribe_token);
  const siteUrl = httpsUrl(process.env.SITE_URL, "SITE_URL").toString();
  const payload = {
    from: safeText(process.env.NEWSLETTER_FROM, 254),
    to: recipient.email,
    subject: safeText(process.env.NEWSLETTER_SUBJECT, 180),
    text: `${safeText(process.env.NEWSLETTER_TEXT, 12000)}\n\nPortal: ${siteUrl}\nCancelar: ${unsubscribeBase}`
  };
  const date = new Date().toISOString().slice(0, 10);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `antigravity-${recipient.id}-${date}`
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer"
  });
  if (!response.ok) {
    throw new Error(`Provedor recusou um envio (${response.status}).`);
  }
}

async function main() {
  requireEnvironment(requiredBase);
  if (!validEmail(process.env.NEWSLETTER_FROM)) {
    throw new Error("NEWSLETTER_FROM inválido.");
  }
  const recipients = await loadConsentedRecipients();
  process.stdout.write(
    `[dry-run=${String(!sendMode)}] ${recipients.length} assinatura(s) ativa(s) e consentida(s).\n`
  );
  if (!sendMode) {
    process.stdout.write("Nenhum e-mail enviado. Use --send após a revisão humana.\n");
    return;
  }
  requireEnvironment(requiredSend);
  if (process.env.CONFIRM_NEWSLETTER_SEND !== "YES") {
    throw new Error("Envio bloqueado: defina CONFIRM_NEWSLETTER_SEND=YES.");
  }
  const endpoint = providerEndpoint();
  let sent = 0;
  for (const recipient of recipients) {
    await deliver(recipient, endpoint);
    sent += 1;
  }
  process.stdout.write(`${sent} envio(s) concluído(s); endereços não foram exibidos.\n`);
}

main().catch((error) => {
  process.stderr.write(`Newsletter bloqueada: ${safeText(error.message, 300)}\n`);
  process.exitCode = 1;
});
