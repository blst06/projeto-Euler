import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes/index.js";

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
// FRONTEND_URL deve ser configurada no Render com a URL do Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173", // dev local do frontend
  "http://localhost:4173", // preview do vite
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin não permitida — ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Logger ───────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// ─── Rotas ────────────────────────────────────────────────────────────────────
registerRoutes(app);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[cartivore] Erro interno:", err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: err.message || "Erro interno do servidor" });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`[cartivore] API rodando em http://0.0.0.0:${PORT}`);
  console.log(`[cartivore] CORS permitido para: ${allowedOrigins.join(", ")}`);
});
