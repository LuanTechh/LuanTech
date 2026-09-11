import { getStore } from "@netlify/blobs";

function getLuanTechStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_BLOBS_TOKEN;

  if (siteID && token) {
    return getStore({ name: "luantech", siteID, token, consistency: "strong" });
  }

  // Normal Netlify Functions path: Blobs can use Netlify's injected runtime credentials.
  return getStore({ name: "luantech", consistency: "strong" });
}

export const handler = async () => {
  try {
    const store = getLuanTechStore();
    const products = (await store.get("products", { type: "json" })) || [];
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify(products)
    };
  } catch (error) {
    console.error("LuanTech products error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "No se pudo cargar el catálogo.",
        code: "BLOBS_ENVIRONMENT_ERROR"
      })
    };
  }
};
