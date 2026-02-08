"use client";

import { AlertTriangle } from "lucide-react";

type TutupBukuModalProps = {
  isOpen: boolean;
  activeStationsCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TutupBukuModal({
  isOpen,
  activeStationsCount,
  onConfirm,
  onCancel,
}: TutupBukuModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-center">
          <div className="rounded-full bg-[#fff4d9] p-3">
            <AlertTriangle className="h-8 w-8 text-[#f59e0b]" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-[#1f2433]">
          Tutup Buku Hari Ini?
        </h2>

        <p className="mb-6 text-center text-sm text-[#6b7280]">
          {activeStationsCount > 0 ? (
            <>
              Terdapat <span className="font-semibold text-[#f04747]">{activeStationsCount} station aktif</span> yang akan dihentikan.
              Semua sesi akan di-checkout dan Anda akan diarahkan ke halaman laporan harian.
            </>
          ) : (
            <>
              Anda akan diarahkan ke halaman laporan harian untuk melihat ringkasan transaksi hari ini.
            </>
          )}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#e6eaf2] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b7280] transition-colors hover:bg-[#f9fafb]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#f04747] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#dc3545]"
          >
            Ya, Tutup Buku
          </button>
        </div>
      </div>
    </div>
  );
}
