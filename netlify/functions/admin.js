import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.TOKEN_SECRET;
const TOKEN_TTL = 1000 * 60 * 60 * 12;
const store = () => getStore({ name: "luantech", consistency: "strong" });

const json = (statusCode, body, extra = {}) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  body: JSON.stringify(body)
});

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}
function makeToken() {
  const payload = `admin.${Date.now()}.${crypto.randomUUID()}`;
  return `${payload}.${sign(payload)}`;
}
function validToken(token) {
  try {
    if (!SECRET || !token) return false;
    const parts = token.split(".");
    if (parts.length !== 4 || parts[0] !== "admin") return false;
    const payload = parts.slice(0, 3).join(".");
    const expected = sign(payload);
    const a = Buffer.from(parts[3]);
    const b = Buffer.from(expected);
    const issued = Number(parts[1]);
    return a.length === b.length && crypto.timingSafeEqual(a, b) && Number.isFinite(issued) && Date.now() - issued < TOKEN_TTL;
  } catch { return false; }
}
function bearer(event) {
  return (event.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim();
}
async function getProducts() {
  return (await store().get("products", { type: "json" })) || [];
}
function cleanProduct(p) {
  return {
    id: String(p.id || crypto.randomUUID()).slice(0, 80),
    name: String(p.name || "").trim().slice(0, 100),
    price: Math.max(0, Number(p.price) || 0),
    category: String(p.category || "General").trim().slice(0, 60),
    description: String(p.description || "").trim().slice(0, 600),
    image: String(p.image || "").slice(0, 1_600_000),
    featured: Boolean(p.featured),
    badge: String(p.badge || "").trim().slice(0, 30),
    stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
    updatedAt: new Date().toISOString()
  };
}

export const handler = async (event) => {
  const action = event.queryStringParameters?.action || "check";
  try {
    if (action === "login" && event.httpMethod === "POST") {
      if (!PASSWORD || !SECRET) return json(500, { error: "Faltan ADMIN_PASSWORD o TOKEN_SECRET en Netlify." });
      const body = JSON.parse(event.body || "{}");
      const password = String(body.password || "");
      if (password.length === 0 || password !== PASSWORD) return json(401, { error: "Contraseña incorrecta." });
      return json(200, { token: makeToken(), expiresIn: TOKEN_TTL });
    }

    if (!validToken(bearer(event))) return json(401, { error: "Sesión no autorizada o vencida." });

    if (action === "check") return json(200, { ok: true, expiresIn: TOKEN_TTL });
    if (action === "list") return json(200, await getProducts());

    if (action === "save" && event.httpMethod === "POST") {
      const p = cleanProduct(JSON.parse(event.body || "{}"));
      if (!p.name || !p.price || !p.category || !p.image) return json(400, { error: "Completa nombre, precio, categoría e imagen." });
      if (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(p.image) && !/^https?:\/\//i.test(p.image)) return json(400, { error: "La imagen debe ser una URL HTTPS o una imagen válida." });
      let all = await getProducts();
      const index = all.findIndex(x => x.id === p.id);
      if (index >= 0) all[index] = p; else all.unshift(p);
      await store().setJSON("products", all);
      return json(200, p);
    }

    if (action === "delete" && event.httpMethod === "POST") {
      const { id } = JSON.parse(event.body || "{}");
      const all = (await getProducts()).filter(x => x.id !== String(id));
      await store().setJSON("products", all);
      return json(200, { ok: true });
    }

    if (action === "import" && event.httpMethod === "POST") {
      const incoming = JSON.parse(event.body || "{}");
      if (!Array.isArray(incoming)) return json(400, { error: "El archivo JSON debe contener una lista de productos." });
      const all = incoming.slice(0, 500).map(cleanProduct).filter(p => p.name && p.price && p.image);
      await store().setJSON("products", all);
      return json(200, { ok: true, count: all.length });
    }

    if (action === "clear" && event.httpMethod === "POST") {
      await store().setJSON("products", []);
      return json(200, { ok: true });
    }

    return json(400, { error: "Acción inválida." });
  } catch (error) {
    console.error("LuanTech admin error:", error);
    return json(500, { error: "Error interno de la función. Revisa los logs de Netlify." });
  }
};
                                         
