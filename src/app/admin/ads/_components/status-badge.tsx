import type { AdStatus } from "../_lib/types";

const styles: Record<AdStatus, string> = {
  active: "bg-[#e040c0]/15 text-[#e040c0] border-[#e040c0]/30",
  paused: "bg-yellow-900/20 text-yellow-400 border-yellow-600/30",
  expired: "bg-red-900/20 text-red-400 border-red-800/30",
};

const labels: Record<AdStatus, string> = {
  active: "ACTIVE",
  paused: "PAUSED",
  expired: "EXPIRED",
};

export function StatusBadge({ status }: { status: AdStatus }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10px] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
