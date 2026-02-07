import type { StationView } from "./types";

type StationCardProps = {
  station: StationView;
  onOpenOrderModal: (stationId: number) => void;
};

export function StationCard({
  station,
  onOpenOrderModal,
}: StationCardProps) {
  const orderItems = station.orders ?? [];
  const orderCount = orderItems.length;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white ${station.cardBorder} ${station.cardShadow}`}
    >
      <div className={`${station.headerBg} px-4 py-3 ${station.headerText}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">{station.id}</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                Status
              </p>
              <p className={`text-xs font-semibold ${station.statusColor}`}>
                {station.status}
              </p>
              {station.statusDetail ? (
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                  {station.statusDetail.map((line) => (
                    <div key={line} className="leading-4">
                      {line}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm">{station.time}</p>
            <p className="text-[10px] text-white/60">
              {station.lastSession}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[#9aa2b1]">
          <span className="uppercase tracking-[0.2em]">Daftar Pesanan</span>
          <span className={station.orderTotalColor}>{station.orderTotal}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenOrderModal(station.id)}
            disabled={!station.isOrderable}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
              station.isOrderable
                ? "bg-[#f8f9fc] text-[#f04747]"
                : "cursor-not-allowed bg-[#f3f5f9] text-[#c7cdd8]"
            }`}
          >
            +
          </button>
          {orderItems.map((order) => (
            <div
              key={order.label}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[10px] font-semibold uppercase text-[#1f2433] shadow-[0_0_0_1px_#e6eaf2]"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md text-white ${order.tone}`}
              >
                {order.label[0]}
              </span>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f04747] text-[9px] font-semibold text-white">
                {order.count}
              </span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - orderCount) }).map(
            (_, index) => (
              <div
                key={`slot-${index}`}
                className="h-8 w-8 rounded-lg border border-dashed border-[#d9dee8] bg-white"
              />
            )
          )}
        </div>
        <div className="space-y-2 text-xs text-[#9aa2b1]">
          <div className="flex items-center justify-between">
            <span>Rental Cost</span>
            <span className="text-[#6b7280]">{station.rentalCost}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Snacks Total</span>
            <span className="text-[#6b7280]">{station.snacksTotal}</span>
          </div>
          {station.rate ? (
            <div className="text-[10px] font-semibold text-[#f04747]">
              {station.rate}
            </div>
          ) : null}
        </div>
        <div
          className={`rounded-xl px-4 py-3 text-center ${station.totalVariant}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9aa2b1]">
            Total Keseluruhan
          </p>
          <p className={`mt-2 text-lg font-semibold ${station.totalTextColor}`}>
            {station.total}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {station.actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                action.variant
              } ${action.disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
