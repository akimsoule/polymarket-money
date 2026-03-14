import type { ScanApiResponse } from "../data/types";

interface Props {
  data: ScanApiResponse;
}

export function MetricsCards({ data }: Readonly<Props>) {
  return (
    <div className="grid grid-cols-1 divide-y divide-base-300 border-b border-base-300 bg-base-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-xs font-medium uppercase tracking-widest text-base-content/40">
          Markets scanned
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {data.marketsCount}
        </p>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-xs font-medium uppercase tracking-widest text-base-content/40">
          Opportunities
        </p>
        <p
          className={`mt-1 text-3xl font-bold tabular-nums ${
            data.totalOpportunities > 0
              ? "text-success"
              : "text-base-content/25"
          }`}
        >
          {data.totalOpportunities}
        </p>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-xs font-medium uppercase tracking-widest text-base-content/40">
          Last scan
        </p>
        <p className="mt-2 text-sm text-base-content/70">
          {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
