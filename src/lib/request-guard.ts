type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function assertRateLimit(request: Request, namespace: string, limit: number, windowMs: number) {
  const key = `${namespace}:${clientIp(request)}`;
  const timestamp = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= timestamp) {
    buckets.set(key, { count: 1, resetAt: timestamp + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
}
