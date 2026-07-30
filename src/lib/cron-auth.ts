import { timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_REPOSITORY = "SeitiKatsumi/portal11run";
const GITHUB_WORKFLOW = `${GITHUB_REPOSITORY}/.github/workflows/daily-rankings.yml@refs/heads/main`;
export const DAILY_RANKINGS_AUDIENCE = "https://11run.com.br/api/cron/references/all-rankings";

const githubKeys = createRemoteJWKSet(new URL(`${GITHUB_OIDC_ISSUER}/.well-known/jwks`));

function safeSecretMatch(token: string, expected: string) {
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return tokenBuffer.length === expectedBuffer.length && timingSafeEqual(tokenBuffer, expectedBuffer);
}

async function isTrustedGitHubWorkflow(token: string) {
  try {
    const { payload } = await jwtVerify(token, githubKeys, {
      audience: DAILY_RANKINGS_AUDIENCE,
      issuer: GITHUB_OIDC_ISSUER
    });
    return payload.repository === GITHUB_REPOSITORY
      && payload.ref === "refs/heads/main"
      && payload.workflow_ref === GITHUB_WORKFLOW
      && (payload.event_name === "schedule" || payload.event_name === "workflow_dispatch");
  } catch {
    return false;
  }
}

export async function isCronAuthorized(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return false;

  const configuredSecret = process.env.CRON_SECRET;
  if (configuredSecret && safeSecretMatch(token, configuredSecret)) return true;

  return isTrustedGitHubWorkflow(token);
}
