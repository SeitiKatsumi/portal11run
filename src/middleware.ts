import { NextRequest, NextResponse } from "next/server";

function unauthorized(message = "Autenticação obrigatória.") {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="11RUN Admin", charset="UTF-8"'
    }
  });
}

function missingAdminPassword() {
  return new Response("ADMIN_PASSWORD não configurado no servidor.", { status: 503 });
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return {
      user: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return missingAdminPassword();

  const expectedUser = process.env.ADMIN_USER || "admin";
  const credentials = parseBasicAuth(request.headers.get("authorization"));

  if (!credentials) return unauthorized();
  if (credentials.user !== expectedUser || credentials.password !== adminPassword) return unauthorized("Credenciais inválidas.");

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
