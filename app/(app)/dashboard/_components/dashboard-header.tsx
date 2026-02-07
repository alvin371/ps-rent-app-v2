export function DashboardHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#1f2433]">
          Station Overview
        </h1>
        <p className="text-xs text-[#8a93a5]">Monday, 5 January 2026</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]">
          <svg
            width="16"
            height="18"
            viewBox="0 0 16 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 1.5C6.067 1.5 4.5 3.067 4.5 5V7.7C4.5 8.2 4.3 8.68 3.94 9.04L2.9 10.08C2.28 10.7 2.72 11.75 3.6 11.75H12.4C13.28 11.75 13.72 10.7 13.1 10.08L12.06 9.04C11.7 8.68 11.5 8.2 11.5 7.7V5C11.5 3.067 9.933 1.5 8 1.5Z"
              stroke="#9aa2b1"
              strokeWidth="1.2"
            />
            <path
              d="M6.5 14.5C6.7 15.4 7.48 16 8.4 16C9.32 16 10.1 15.4 10.3 14.5"
              stroke="#9aa2b1"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f04747] px-1 text-[10px] font-semibold text-white">
            2
          </span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eaf2] bg-[#f4f6fb] text-sm font-semibold text-[#6b7280]">
          A
        </div>
      </div>
    </header>
  );
}
