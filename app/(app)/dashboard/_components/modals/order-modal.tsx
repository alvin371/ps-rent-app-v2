import type { MenuItem, OrderItem } from "../types";
import { formatRupiah } from "../format";

type OrderModalProps = {
  stationId: number | null;
  orders: OrderItem[];
  menuItems: MenuItem[];
  menuTabs: { label: string; tone: string }[];
  onAddItem: (item: MenuItem) => void;
  onAdjustQty: (snackId: string, delta: number) => void;
  onRemoveItem: (snackId: string) => void;
  onClose: () => void;
};

export function OrderModal({
  stationId,
  orders,
  menuItems,
  menuTabs,
  onAddItem,
  onAdjustQty,
  onRemoveItem,
  onClose,
}: OrderModalProps) {
  if (stationId === null) {
    return null;
  }

  const orderSubtotal = orders.reduce(
    (total, order) => total + order.price * order.qty,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
      <div className="w-full max-w-[920px] overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffecec] text-[#f04747]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 6.5H16"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M6 4L10 2L14 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 9.5C6 12 8 14 10 14C12 14 14 12 14 9.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M4.5 16H15.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#1f2433]">
                Daftar Pesanan - Station {stationId}
              </h2>
              <p className="mt-1 text-xs text-[#8a93a5]">
                Manage snacks and drinks for this session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div className="border-t border-[#eef1f6]">
          <div className="grid gap-0 md:grid-cols-[1.6fr_1fr]">
            <div className="px-6 py-5">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa2b1]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="4.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M11 11L14 14"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  placeholder="Search menu items..."
                  className="h-10 w-full rounded-lg border border-[#e6eaf2] bg-white pl-9 pr-3 text-xs text-[#6b7280] outline-none placeholder:text-[#b7becb]"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {menuTabs.map((tab) => (
                  <button
                    key={tab.label}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-semibold ${tab.tone}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onAddItem(item)}
                    className="rounded-xl border border-[#eef1f6] bg-white p-3 text-center shadow-[0_6px_16px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#f5b7b7]"
                  >
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${item.tone}`}
                    >
                      {item.label}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#1f2433]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[#f04747]">
                      {formatRupiah(item.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-l border-[#eef1f6] bg-[#fafbfe]">
              <div className="px-6 py-5">
                <h3 className="text-sm font-semibold text-[#1f2433]">
                  Current Order
                </h3>
                <p className="mt-1 text-xs text-[#8a93a5]">
                  Order ID: #ORD-{stationId}-001
                </p>
              </div>
              <div className="border-t border-[#eef1f6] px-6 py-4">
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#e6eaf2] bg-white px-4 py-6 text-center text-xs text-[#9aa2b1]">
                    No items added yet. Click menu items to add them.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.snackId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#eef1f6] bg-white px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-[#1f2433] ${order.tone}`}
                          >
                            {order.name[0]}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[#1f2433]">
                              {order.name}
                            </p>
                            <p className="text-[11px] text-[#8a93a5]">
                              {formatRupiah(order.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-2 rounded-md border border-[#e6eaf2] bg-white px-2 py-1 text-[11px] font-semibold text-[#6b7280]">
                            <button
                              type="button"
                              onClick={() => onAdjustQty(order.snackId, -1)}
                              className="text-[#9aa2b1]"
                            >
                              -
                            </button>
                            <span className="text-[#1f2433]">{order.qty}</span>
                            <button
                              type="button"
                              onClick={() => onAdjustQty(order.snackId, 1)}
                              className="text-[#9aa2b1]"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(order.snackId)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-[#eef1f6] text-[#9aa2b1]"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M6 6V12"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M10 6V12"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M4.5 4H11.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M6 4L6.5 2.5H9.5L10 4"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-[#eef1f6] px-6 py-4">
                <div className="flex items-center justify-between text-xs text-[#8a93a5]">
                  <span>Subtotal</span>
                  <span>{formatRupiah(orderSubtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1f2433]">
                    Total Billing
                  </span>
                  <span className="text-base font-semibold text-[#f04747]">
                    {formatRupiah(orderSubtotal)}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(240,71,71,0.3)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 3.5H12"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.5 6.5H11.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.5 9.5H11.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 12.5H10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Tambahkan ke Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
