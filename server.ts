import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { ApiError, negotiateWithGemini } from "./src/server/negotiateHandler";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable("x-powered-by");

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    next();
  });

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  const allowlist = new Set(
    (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  allowlist.add("http://localhost:5173");
  allowlist.add("http://localhost:3000");

  app.use(
    cors({
      origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin) return callback(null, true);
        if (allowlist.has(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  // API Routes - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mkulima Smart API is running" });
  });

  // API Routes - Gemini negotiation (local dev parity with Vercel function)
  app.post("/api/negotiate", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: { code: "missing_server_config", message: "Server is missing GEMINI_API_KEY." },
      });
      return;
    }

    try {
      const parsed = await negotiateWithGemini(req.body ?? {}, apiKey);
      res.json(parsed);
    } catch (err: any) {
      if (err instanceof ApiError) {
        res.status(err.status).json({ error: { code: err.code, message: err.message } });
        return;
      }

      const isTimeout = err?.name === "TimeoutError";
      res.status(isTimeout ? 504 : 502).json({
        error: {
          code: isTimeout ? "upstream_timeout" : "upstream_error",
          message: isTimeout ? "AI request timed out. Please try again." : "AI request failed. Please try again.",
        },
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
