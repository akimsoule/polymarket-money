import type { Config } from "@netlify/functions";
import { executeScan } from "../../app/src/scan-service.js";
import { loadScannerConfigFromEnv } from "../../app/src/scan-config.js";
import { saveScanSnapshot } from "../../app/src/scan-history.js";

const cronScanner = async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as { next_run?: string };
  const nextRun = body.next_run ?? "unknown";

  try {
    const config = loadScannerConfigFromEnv();
    const result = await executeScan({ config });
    const generatedAt = new Date().toISOString();
    const shouldPersist = result.opportunities.length > 0;
    const blobKey = shouldPersist
      ? await saveScanSnapshot({
          ...result,
          generatedAt,
          source: "cron",
          totalOpportunities: result.opportunities.length,
          config,
        })
      : null;

    console.log("Scheduled scan executed", {
      nextRun,
      marketsCount: result.marketsCount,
      totalOpportunities: result.opportunities.length,
      blobKey,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        nextRun,
        marketsCount: result.marketsCount,
        totalOpportunities: result.opportunities.length,
        blobKey,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Scheduled scan failed";

    console.error("Scheduled scan error", { nextRun, error: message });

    return new Response(
      JSON.stringify({
        ok: false,
        nextRun,
        error: message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
};
export default cronScanner;

export const config: Config = {
  schedule: "*/15 * * * *",
};
