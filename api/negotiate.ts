import {
  ApiError,
  ErrorResponse,
  negotiateWithGemini,
  type NegotiationRequest,
} from "../src/server/negotiateHandler";

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function normalizeOrigin(origin: string) {
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.host}`;
  } catch {
    return origin;
  }
}

function allowOrigin(req: any, res: any) {
  const origin = req.headers?.origin as string | undefined;
  if (!origin) return;

  // Same-origin requests don't need CORS, but browsers still send Origin on some flows.
  const allowed = new Set<string>();
  const fromEnv = process.env.ALLOWED_ORIGINS;
  if (fromEnv) {
    for (const part of fromEnv.split(",").map((s) => s.trim()).filter(Boolean)) {
      allowed.add(normalizeOrigin(part));
    }
  }
  allowed.add("http://localhost:5173");
  allowed.add("http://localhost:3000");

  const normalized = normalizeOrigin(origin);
  if (allowed.has(normalized)) {
    res.setHeader("Access-Control-Allow-Origin", normalized);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  }
}

export default async function handler(req: any, res: any) {
  allowOrigin(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: { code: "method_not_allowed", message: "Use POST." } } satisfies ErrorResponse);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    json(res, 500, {
      error: {
        code: "missing_server_config",
        message: "Server is missing GEMINI_API_KEY.",
      },
    } satisfies ErrorResponse);
    return;
  }

  const body = (req.body ?? {}) as Partial<NegotiationRequest>;

  try {
    const parsed = await negotiateWithGemini(body, apiKey);
    json(res, 200, parsed);
  } catch (err: any) {
    if (err instanceof ApiError) {
      json(res, err.status, { error: { code: err.code, message: err.message } } satisfies ErrorResponse);
      return;
    }

    const isTimeout = err?.name === "TimeoutError";
    json(res, isTimeout ? 504 : 502, {
      error: {
        code: isTimeout ? "upstream_timeout" : "upstream_error",
        message: isTimeout ? "AI request timed out. Please try again." : "AI request failed. Please try again.",
      },
    } satisfies ErrorResponse);
  }
}

