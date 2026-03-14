import { getStore } from "@netlify/blobs";
import { requireAuth } from "../../app/src/auth.js";

export default async function getScan(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key")?.trim();
  const key = keyParam && keyParam.length > 0 ? keyParam : "latest.json";

  const storeName = process.env.SCAN_BLOB_STORE_NAME ?? "scanner-history";
  const store = getStore(storeName);
  const value = await store.get(key, { type: "text" });

  if (value === null) {
    return new Response(
      JSON.stringify({
        error: "Blob not found",
        key,
      }),
      {
        status: 404,
        headers: { "content-type": "application/json" },
      },
    );
  }

  return new Response(value, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "x-scan-key": key,
    },
  });
}
