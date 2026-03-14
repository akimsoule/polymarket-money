import { executeScan } from "../../app/src/scan-service.js";
import { loadScannerConfigFromEnv } from "../../app/src/scan-config.js";
import { saveScanSnapshot } from "../../app/src/scan-history.js";
import { requireAuth } from "../../app/src/auth.js";
import type { ScannerConfig } from "../../app/src/types.js";

export default async function scan(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const payload = (await req.json().catch(() => ({}))) as {
      topN?: number;
      marketLimit?: number;
      config?: Partial<ScannerConfig>;
    };

    const defaults = loadScannerConfigFromEnv();
    const mergedConfig: ScannerConfig = {
      ...defaults,
      ...payload.config,
    };

    const result = await executeScan({
      config: mergedConfig,
      marketLimit: payload.marketLimit,
    });

    const topN =
      typeof payload.topN === "number" && !Number.isNaN(payload.topN)
        ? Math.max(1, Math.floor(payload.topN))
        : 20;

    const generatedAt = new Date().toISOString();
    const shouldPersist = result.opportunities.length > 0;
    const blobKey = shouldPersist
      ? await saveScanSnapshot({
          ...result,
          generatedAt,
          source: "api",
          totalOpportunities: result.opportunities.length,
          config: mergedConfig,
          topN,
          marketLimit: payload.marketLimit,
        })
      : null;

    return new Response(
      JSON.stringify({
        marketsCount: result.marketsCount,
        diagnostics: result.diagnostics,
        opportunities: result.opportunities.slice(0, topN),
        totalOpportunities: result.opportunities.length,
        config: mergedConfig,
        generatedAt,
        blobKey,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
