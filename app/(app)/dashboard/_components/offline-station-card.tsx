type OfflineStationCardProps = {
  stationId: number;
};

export function OfflineStationCard({ stationId }: OfflineStationCardProps) {
  return (
    <div className="rounded-2xl border border-[#e6eaf2] bg-white p-4">
      <div className="rounded-xl bg-[#b9bec6] px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold">{stationId}</p>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em]">Status</p>
            <p className="text-xs font-semibold">OFFLINE</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center text-center text-[#a0a7b6]">
        <div className="text-3xl">🚫</div>
        <p className="mt-4 text-sm font-semibold text-[#6b7280]">
          Station Unavailable
        </p>
        <p className="mt-2 text-xs">
          This console is currently under maintenance or switched off.
        </p>
        <button className="mt-6 rounded-lg bg-[#eef1f6] px-4 py-2 text-xs font-semibold text-[#9aa2b1]">
          Enable Station
        </button>
      </div>
    </div>
  );
}
