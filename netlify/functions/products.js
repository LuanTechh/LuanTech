import { getStore } from "@netlify/blobs";

export const handler = async () => {
  try {
    const store = getStore({ name: "luantech", consistency: "strong" });
    const products = (await store.get("products", { type: "json" })) || [];
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      body: JSON.stringify(products)
    };
  } catch (error) {
    console.error("LuanTech products error:", error);
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "No se pudo cargar el catálogo." }) };
  }
};

