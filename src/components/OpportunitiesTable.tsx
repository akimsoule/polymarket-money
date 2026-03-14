import { useState } from "react";
import type { Opportunity } from "../data/types";

interface Props {
  opportunities: Opportunity[];
}

type SortKey = "roi" | "currentPrice" | "expectedValue";

interface SortIconProps {
  col: SortKey;
  sortKey: SortKey;
  desc: boolean;
}

function riskClass(level: Opportunity["riskLevel"]): string {
  if (level === "low") return "badge-success";
  if (level === "medium") return "badge-warning";
  return "badge-error";
}

function SortIcon({ col, sortKey, desc }: Readonly<SortIconProps>) {
  if (col !== sortKey) return <span className="ml-1 opacity-20">⇅</span>;
  return <span className="ml-1 text-primary">{desc ? "↓" : "↑"}</span>;
}

export function OpportunitiesTable({ opportunities }: Readonly<Props>) {
  const [sortKey, setSortKey] = useState<SortKey>("roi");
  const [desc, setDesc] = useState(true);

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-base-content/30 text-5xl">—</p>
        <p className="text-lg font-semibold text-base-content/60">
          No opportunities match
        </p>
        <p className="max-w-xs text-sm text-base-content/40">
          Try lowering Min ROI, Min Volume or Min Liquidity in the config panel.
        </p>
      </div>
    );
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) setDesc((d) => !d);
    else {
      setSortKey(key);
      setDesc(true);
    }
  }

  const sorted = [...opportunities].sort((a, b) =>
    desc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
  );

  const thClass =
    "cursor-pointer select-none hover:text-primary transition-colors";

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/40">
            <th>Market / Reasoning</th>
            <th>Outcome</th>
            <th className={thClass} onClick={() => toggleSort("currentPrice")}>
              Price
              <SortIcon col="currentPrice" sortKey={sortKey} desc={desc} />
            </th>
            <th className={thClass} onClick={() => toggleSort("expectedValue")}>
              EV
              <SortIcon col="expectedValue" sortKey={sortKey} desc={desc} />
            </th>
            <th className={thClass} onClick={() => toggleSort("roi")}>
              ROI
              <SortIcon col="roi" sortKey={sortKey} desc={desc} />
            </th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((opp) => (
            <tr
              key={`${opp.marketId}-${opp.outcome}`}
              className="hover border-base-300"
            >
              <td className="max-w-sm py-3">
                <p className="font-medium leading-snug text-base-content">
                  {opp.question}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-base-content/40">
                  {opp.reasoning}
                </p>
              </td>
              <td className="text-sm font-medium">{opp.outcome}</td>
              <td className="font-mono text-sm">
                {(opp.currentPrice * 100).toFixed(1)}%
              </td>
              <td className="font-mono text-sm">
                {(opp.expectedValue * 100).toFixed(1)}%
              </td>
              <td className="font-mono text-sm font-bold text-success">
                +{(opp.roi * 100).toFixed(2)}%
              </td>
              <td>
                <span className={`badge badge-sm ${riskClass(opp.riskLevel)}`}>
                  {opp.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
