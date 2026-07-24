const PRODUCTION_SITE_URL = "https://11run.com.br";

function normalizedHttpOrigin(value: string | undefined) {
  if (!value?.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

function isInternalHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "0.0.0.0" ||
    normalized === "::" ||
    normalized === "[::]" ||
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".localhost")
  );
}

export function resolveCheckoutSiteUrl({
  configuredUrl,
  requestUrl,
  nodeEnv = process.env.NODE_ENV
}: {
  configuredUrl?: string;
  requestUrl?: string;
  nodeEnv?: string;
}) {
  const configuredOrigin = normalizedHttpOrigin(configuredUrl);
  if (configuredOrigin) {
    const configured = new URL(configuredOrigin);
    if (nodeEnv !== "production" || !isInternalHostname(configured.hostname)) return configuredOrigin;
  }

  const requestOrigin = normalizedHttpOrigin(requestUrl);
  if (requestOrigin) {
    const request = new URL(requestOrigin);
    if (nodeEnv !== "production" || !isInternalHostname(request.hostname)) return requestOrigin;
  }

  return PRODUCTION_SITE_URL;
}
