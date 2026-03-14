import type { ScanDiagnostics } from "../data/types";

interface Props {
  diagnostics: ScanDiagnostics;
}

interface Row {
  label: string;
  value: number;
  highlight?: boolean;
}

interface Group {
  title: string;
  rows: Row[];
}

export function DiagnosticsPanel({ diagnostics: d }: Readonly<Props>) {
  const groups: Group[] = [
    {
      title: "Market filtering",
      rows: [
        { label: "Analyzed", value: d.marketsAnalyzed, highlight: true },
        {
          label: "Passed filters",
          value: d.marketsPassedFilters,
          highlight: true,
        },
        { label: "Rejected by volume", value: d.rejectedByVolume },
        { label: "Rejected by liquidity", value: d.rejectedByLiquidity },
      ],
    },
    {
      title: "Weather strategy",
      rows: [
        { label: "Markets inspected", value: d.weatherMarkets },
        {
          label: "Opportunities found",
          value: d.weatherOpportunities,
          highlight: d.weatherOpportunities > 0,
        },
        {
          label: "Rejected (price window)",
          value: d.weatherRejectedPriceWindow,
        },
        { label: "Rejected (edge)", value: d.weatherRejectedEdge },
      ],
    },
    {
      title: "Arbitrage strategy",
      rows: [
        { label: "Binary markets", value: d.arbBinaryMarkets },
        {
          label: "Opportunities found",
          value: d.arbOpportunities,
          highlight: d.arbOpportunities > 0,
        },
        { label: "Rejected (spread)", value: d.arbRejectedSpread },
      ],
    },
    {
      title: "Standard mispricing",
      rows: [
        { label: "Outcomes analyzed", value: d.standardOutcomesAnalyzed },
        {
          label: "Opportunities found",
          value: d.standardOpportunities,
          highlight: d.standardOpportunities > 0,
        },
        {
          label: "Rejected (invalid price)",
          value: d.standardRejectedInvalidPrice,
        },
        {
          label: "Rejected (prob range)",
          value: d.standardRejectedProbabilityRange,
        },
        {
          label: "Rejected (min diff)",
          value: d.standardRejectedMinDifference,
        },
        { label: "Rejected (min ROI)", value: d.standardRejectedMinROI },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {groups.map((group) => (
        <div
          key={group.title}
          className="card border border-base-300 bg-base-200"
        >
          <div className="card-body gap-4 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
              {group.title}
            </h3>
            <dl className="flex flex-col gap-2.5">
              {group.rows.map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-sm text-base-content/60">{label}</dt>
                  <dd
                    className={`font-mono text-sm font-semibold tabular-nums ${
                      highlight ? "text-primary" : "text-base-content"
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}
