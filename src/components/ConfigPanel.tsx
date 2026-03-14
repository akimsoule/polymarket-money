import type { ScannerConfig } from "../data/types";

type SpecialKey = "topN" | "marketLimit";
type ConfigKey = keyof ScannerConfig;

interface FieldDef {
  label: string;
  key: ConfigKey | SpecialKey;
  step: number;
  min: number;
}

interface Props {
  topN: number;
  marketLimit: number;
  config: ScannerConfig;
  onTopNChange: (v: number) => void;
  onMarketLimitChange: (v: number) => void;
  onConfigChange: (key: ConfigKey, value: number) => void;
}

const FIELDS: FieldDef[] = [
  { label: "Top N", key: "topN", step: 1, min: 1 },
  { label: "Market limit", key: "marketLimit", step: 10, min: 10 },
  { label: "Min volume ($)", key: "minVolume", step: 1000, min: 0 },
  { label: "Min liquidity ($)", key: "minLiquidity", step: 500, min: 0 },
  { label: "Min ROI", key: "minExpectedROI", step: 0.01, min: 0 },
  { label: "Max spread", key: "maxSpread", step: 0.01, min: 0 },
  { label: "Arb min spread", key: "arbMinSpread", step: 0.01, min: 0 },
  { label: "Mispricing min", key: "mispricingMin", step: 0.01, min: 0 },
];

export function ConfigPanel({
  topN,
  marketLimit,
  config,
  onTopNChange,
  onMarketLimitChange,
  onConfigChange,
}: Readonly<Props>) {
  function getValue(key: ConfigKey | SpecialKey): number {
    if (key === "topN") return topN;
    if (key === "marketLimit") return marketLimit;
    return config[key];
  }

  function handleChange(key: ConfigKey | SpecialKey, raw: string) {
    const v = Number.parseFloat(raw);
    if (!Number.isFinite(v)) return;
    if (key === "topN") {
      onTopNChange(v);
      return;
    }
    if (key === "marketLimit") {
      onMarketLimitChange(v);
      return;
    }
    onConfigChange(key, v);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {FIELDS.map(({ label, key, step, min }) => (
        <div key={key} className="flex flex-col gap-1">
          <span className="text-xs text-base-content/50">{label}</span>
          <input
            type="number"
            className="input input-bordered input-sm w-full font-mono"
            value={getValue(key)}
            step={step}
            min={min}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
