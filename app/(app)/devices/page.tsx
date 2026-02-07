"use client";

import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api/client";

type Device = {
  id: string;
  name: string;
  model: string;
  status: "Active" | "Maintenance" | "Offline";
  rate: string;
  service: string;
};

type DeviceType = {
  id: string;
  name: string;
  code: string;
  hourlyRate: string;
  serviceInterval: string;
  isActive: boolean;
};

type ModalMode = "create" | "edit" | "view" | "delete" | null;

const modelTonePalette = [
  "bg-[#eaf0ff] text-[#4f5bff]",
  "bg-[#f1f3f8] text-[#6b7280]",
  "bg-[#e7f7f4] text-[#14b8a6]",
  "bg-[#fff4d9] text-[#f59e0b]",
];


export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState<"devices" | "types">("devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<Device>({
    id: "",
    name: "",
    model: "",
    status: "Active",
    rate: "",
    service: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [typeModalMode, setTypeModalMode] = useState<ModalMode>(null);
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState<DeviceType>({
    id: "",
    name: "",
    code: "",
    hourlyRate: "",
    serviceInterval: "",
    isActive: true,
  });
  const [typeFormError, setTypeFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [deviceData, typeData] = await Promise.all([
          apiFetch<Device[]>("/api/devices"),
          apiFetch<DeviceType[]>("/api/device-types"),
        ]);
        if (!isMounted) return;
        setDevices(deviceData);
        setDeviceTypes(typeData);
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeDevice = useMemo(
    () => devices.find((device) => device.id === activeId) ?? null,
    [activeId, devices]
  );
  const activeType = useMemo(
    () => deviceTypes.find((type) => type.id === activeTypeId) ?? null,
    [activeTypeId, deviceTypes]
  );

  const statusToneMap: Record<Device["status"], string> = {
    Active: "bg-[#e7f7ee] text-[#22c55e]",
    Maintenance: "bg-[#fff4d9] text-[#f59e0b]",
    Offline: "bg-[#feecec] text-[#f04747]",
  };

  const statusOptions: Device["status"][] = [
    "Active",
    "Maintenance",
    "Offline",
  ];

  const modelToneMap = useMemo(() => {
    return deviceTypes.reduce<Record<string, string>>((acc, type, index) => {
      acc[type.name] = modelTonePalette[index % modelTonePalette.length];
      return acc;
    }, {});
  }, [deviceTypes]);

  const modelOptions = useMemo(() => {
    const names = deviceTypes.map((type) => type.name);
    if (form.model && !names.includes(form.model)) {
      return [...names, form.model];
    }
    return names;
  }, [deviceTypes, form.model]);

  const typeStatusToneMap: Record<"active" | "inactive", string> = {
    active: "bg-[#e7f7ee] text-[#22c55e]",
    inactive: "bg-[#feecec] text-[#f04747]",
  };

  const formatRate = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "Rp 0";
    const numberValue = Number(digits);
    const formatted = new Intl.NumberFormat("id-ID").format(numberValue);
    return `Rp ${formatted}`;
  };

  const formatServiceForInput = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const normalizeService = (value: string) => {
    const trimmed = value.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("/");
      return `${year}-${month}-${day}`;
    }
    return trimmed;
  };

  const normalizeInterval = (value: string) =>
    value.replace(/[^\d]/g, "").trim();

  const getNextId = () => {
    const max = devices.reduce((acc, device) => {
      const match = device.id.match(/\d+/g);
      const value = match ? Number(match.join("")) : 0;
      return value > acc ? value : acc;
    }, 0);
    return `DEV-${String(max + 1).padStart(3, "0")}`;
  };

  const getNextTypeId = () => {
    const max = deviceTypes.reduce((acc, type) => {
      const match = type.id.match(/\d+/g);
      const value = match ? Number(match.join("")) : 0;
      return value > acc ? value : acc;
    }, 0);
    return `TYPE-${String(max + 1).padStart(3, "0")}`;
  };

  const resetModal = () => {
    setModalMode(null);
    setActiveId(null);
    setFormError(null);
  };

  const resetTypeModal = () => {
    setTypeModalMode(null);
    setActiveTypeId(null);
    setTypeFormError(null);
  };

  const handleTabChange = (nextTab: "devices" | "types") => {
    if (nextTab === activeTab) return;
    resetModal();
    resetTypeModal();
    setActiveTab(nextTab);
  };

  const openCreate = () => {
    const defaultModel =
      deviceTypes.find((type) => type.isActive)?.name ??
      deviceTypes[0]?.name ??
      "PlayStation 5";
    setForm({
      id: "",
      name: "",
      model: defaultModel,
      status: "Active",
      rate: "",
      service: "",
    });
    setFormError(null);
    setModalMode("create");
  };

  const openView = (device: Device) => {
    setActiveId(device.id);
    setForm({
      ...device,
      rate: device.rate.replace(/[^\d]/g, ""),
      service: formatServiceForInput(device.service),
    });
    setFormError(null);
    setModalMode("view");
  };

  const openEdit = (device: Device) => {
    setActiveId(device.id);
    setForm({
      ...device,
      rate: device.rate.replace(/[^\d]/g, ""),
      service: formatServiceForInput(device.service),
    });
    setFormError(null);
    setModalMode("edit");
  };

  const openDelete = (device: Device) => {
    setActiveId(device.id);
    setFormError(null);
    setModalMode("delete");
  };

  const openTypeCreate = () => {
    setTypeForm({
      id: "",
      name: "",
      code: "",
      hourlyRate: "",
      serviceInterval: "",
      isActive: true,
    });
    setTypeFormError(null);
    setTypeModalMode("create");
  };

  const openTypeView = (type: DeviceType) => {
    setActiveTypeId(type.id);
    setTypeForm({ ...type });
    setTypeFormError(null);
    setTypeModalMode("view");
  };

  const openTypeEdit = (type: DeviceType) => {
    setActiveTypeId(type.id);
    setTypeForm({ ...type });
    setTypeFormError(null);
    setTypeModalMode("edit");
  };

  const openTypeDelete = (type: DeviceType) => {
    setActiveTypeId(type.id);
    setTypeFormError(null);
    setTypeModalMode("delete");
  };

  const handleCreate = async () => {
    const trimmedName = form.name.trim();
    const trimmedId = form.id.trim();
    const computedId = trimmedId || getNextId();
    if (!trimmedName) {
      setFormError("Device name is required.");
      return;
    }
    if (!form.rate.trim()) {
      setFormError("Hourly rate is required.");
      return;
    }
    if (devices.some((device) => device.id === computedId)) {
      setFormError("Device ID already exists.");
      return;
    }
    const payload = {
      ...form,
      id: computedId,
      name: trimmedName,
      rate: form.rate.trim(),
      service:
        normalizeService(form.service) ||
        new Date().toISOString().slice(0, 10),
    };
    try {
      const created = await apiFetch<Device>("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDevices((prev) => [created, ...prev]);
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create");
    }
  };

  const handleUpdate = async () => {
    if (!activeDevice) return;
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setFormError("Device name is required.");
      return;
    }
    if (!form.rate.trim()) {
      setFormError("Hourly rate is required.");
      return;
    }
    const { id: _id, ...rest } = form;
    const payload = {
      ...rest,
      name: trimmedName,
      rate: form.rate.trim(),
      service: normalizeService(form.service) || activeDevice.service,
    };
    try {
      const updated = await apiFetch<Device>(`/api/devices/${activeDevice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDevices((prev) =>
        prev.map((device) => (device.id === updated.id ? updated : device))
      );
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!activeDevice) return;
    try {
      await apiFetch(`/api/devices/${activeDevice.id}`, { method: "DELETE" });
      setDevices((prev) =>
        prev.filter((device) => device.id !== activeDevice.id)
      );
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleTypeCreate = async () => {
    const trimmedName = typeForm.name.trim();
    const trimmedCode = typeForm.code.trim().toUpperCase();
    const trimmedId = typeForm.id.trim();
    const computedId = trimmedId || getNextTypeId();
    if (!trimmedName) {
      setTypeFormError("Type name is required.");
      return;
    }
    if (!trimmedCode) {
      setTypeFormError("Type code is required.");
      return;
    }
    if (!typeForm.hourlyRate.trim()) {
      setTypeFormError("Hourly rate is required.");
      return;
    }
    if (!typeForm.serviceInterval.trim()) {
      setTypeFormError("Service interval is required.");
      return;
    }
    if (deviceTypes.some((type) => type.id === computedId)) {
      setTypeFormError("Type ID already exists.");
      return;
    }
    if (
      deviceTypes.some(
        (type) => type.code.toLowerCase() === trimmedCode.toLowerCase()
      )
    ) {
      setTypeFormError("Type code already exists.");
      return;
    }
    const payload = {
      ...typeForm,
      id: computedId,
      name: trimmedName,
      code: trimmedCode,
      hourlyRate: typeForm.hourlyRate.trim(),
      serviceInterval: normalizeInterval(typeForm.serviceInterval),
    };
    try {
      const created = await apiFetch<DeviceType>("/api/device-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDeviceTypes((prev) => [created, ...prev]);
      resetTypeModal();
    } catch (err) {
      setTypeFormError(err instanceof Error ? err.message : "Failed to create");
    }
  };

  const handleTypeUpdate = async () => {
    if (!activeType) return;
    const trimmedName = typeForm.name.trim();
    const trimmedCode = typeForm.code.trim().toUpperCase();
    if (!trimmedName) {
      setTypeFormError("Type name is required.");
      return;
    }
    if (!trimmedCode) {
      setTypeFormError("Type code is required.");
      return;
    }
    if (!typeForm.hourlyRate.trim()) {
      setTypeFormError("Hourly rate is required.");
      return;
    }
    if (!typeForm.serviceInterval.trim()) {
      setTypeFormError("Service interval is required.");
      return;
    }
    if (
      deviceTypes.some(
        (type) =>
          type.id !== activeType.id &&
          type.code.toLowerCase() === trimmedCode.toLowerCase()
      )
    ) {
      setTypeFormError("Type code already exists.");
      return;
    }
    const { id: _typeId, ...typeRest } = typeForm;
    const payload = {
      ...typeRest,
      name: trimmedName,
      code: trimmedCode,
      hourlyRate: typeForm.hourlyRate.trim(),
      serviceInterval: normalizeInterval(typeForm.serviceInterval),
    };
    try {
      const updated = await apiFetch<DeviceType>(
        `/api/device-types/${activeType.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setDeviceTypes((prev) =>
        prev.map((type) => (type.id === updated.id ? updated : type))
      );
      if (activeType.name !== updated.name) {
        setDevices((prev) =>
          prev.map((device) =>
            device.model === activeType.name
              ? { ...device, model: updated.name }
              : device
          )
        );
      }
      resetTypeModal();
    } catch (err) {
      setTypeFormError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleTypeDelete = async () => {
    if (!activeType) return;
    try {
      await apiFetch(`/api/device-types/${activeType.id}`, {
        method: "DELETE",
      });
      setDeviceTypes((prev) =>
        prev.filter((type) => type.id !== activeType.id)
      );
      resetTypeModal();
    } catch (err) {
      setTypeFormError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1f2433]">
            Device Management
          </h1>
          <p className="text-xs text-[#8a93a5]">
            Master data for game consoles fleet
          </p>
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
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eaf2] bg-[#f4f6fb] text-sm font-semibold text-[#6b7280]">
            A
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-[#e6eaf2] bg-white p-1 text-xs font-semibold text-[#9aa2b1]">
          <button
            onClick={() => handleTabChange("devices")}
            className={`rounded-full px-4 py-1.5 transition ${
              activeTab === "devices"
                ? "bg-[#f3f5ff] text-[#4f5bff]"
                : "text-[#9aa2b1]"
            }`}
          >
            Devices
          </button>
          <button
            onClick={() => handleTabChange("types")}
            className={`rounded-full px-4 py-1.5 transition ${
              activeTab === "types"
                ? "bg-[#f3f5ff] text-[#4f5bff]"
                : "text-[#9aa2b1]"
            }`}
          >
            Device Types
          </button>
        </div>
        <span className="text-xs text-[#9aa2b1]">
          {activeTab === "devices"
            ? `${devices.length} devices in fleet`
            : `${deviceTypes.length} types configured`}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#9aa2b1]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="4.5" stroke="#9aa2b1" strokeWidth="1.2" />
            <path d="M9.5 9.5L12.2 12.2" stroke="#9aa2b1" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            className="w-full bg-transparent text-xs text-[#6b7280] outline-none placeholder:text-[#c0c6d4]"
            placeholder={
              activeTab === "devices"
                ? "Search device by ID or name..."
                : "Search type by ID or name..."
            }
          />
        </div>
        <button
          onClick={activeTab === "devices" ? openCreate : openTypeCreate}
          className="flex items-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
        >
          <span className="text-base leading-none">+</span>
          {activeTab === "devices" ? "Add New Device" : "Add Device Type"}
        </button>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading data...
        </div>
      ) : null}

      {activeTab === "devices" ? (
        <section className="rounded-2xl border border-[#e6eaf2] bg-white">
          <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-[#eef1f6] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            <span>Device Name</span>
            <span>Model</span>
            <span>Status</span>
            <span>Hourly Rate</span>
            <span>Last Service</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[#eef1f6]">
            {devices.map((device, index) => (
              <div
                key={device.id}
                className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-5 py-4 text-xs text-[#6b7280]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                      index % 2 === 0
                        ? "bg-[#eef3ff] text-[#4f5bff]"
                        : "bg-[#feecec] text-[#f04747]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2433]">
                      {device.name}
                    </p>
                    <p className="text-[11px] text-[#9aa2b1]">
                      ID: {device.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      modelToneMap[device.model] ?? modelTonePalette[0]
                    }`}
                  >
                    {device.model}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusToneMap[device.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {device.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-[#6b7280]">
                  {formatRate(device.rate)}
                </div>
                <div className="flex items-center text-sm text-[#6b7280]">
                  {device.service}
                </div>
                <div className="flex items-center gap-3 text-[#4f5bff]">
                  <button
                    onClick={() => openEdit(device)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 9.6L9.6 3L11 4.4L4.4 11H3V9.6Z"
                        stroke="#4f5bff"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => openView(device)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="4.5"
                        stroke="#9aa2b1"
                        strokeWidth="1.2"
                      />
                      <circle cx="7" cy="7" r="1.5" fill="#9aa2b1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDelete(device)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 1.5V7M10 3.5C11.2 4.6 12 6.2 12 8C12 10.5 9.8 12.5 7 12.5C4.2 12.5 2 10.5 2 8C2 6.2 2.8 4.6 4 3.5"
                        stroke="#9aa2b1"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-xs text-[#9aa2b1]">
            <span>
              Showing {devices.length ? 1 : 0} to {devices.length} of{" "}
              {devices.length} results
            </span>
            <div className="flex items-center overflow-hidden rounded-lg border border-[#e6eaf2] bg-white text-xs">
              <button className="flex h-8 w-8 items-center justify-center text-[#9aa2b1]">
                ‹
              </button>
              {["1", "2", "3"].map((page) => (
                <button
                  key={page}
                  className={`flex h-8 w-8 items-center justify-center ${
                    page === "1"
                      ? "bg-[#f3f5ff] text-[#4f5bff]"
                      : "text-[#9aa2b1]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="flex h-8 w-8 items-center justify-center text-[#9aa2b1]">
                ›
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#e6eaf2] bg-white">
          <div className="grid grid-cols-[1.1fr_0.6fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-4 border-b border-[#eef1f6] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            <span>Type Name</span>
            <span>Code</span>
            <span>Hourly Rate</span>
            <span>Service Cycle</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[#eef1f6]">
            {deviceTypes.map((type, index) => (
              <div
                key={type.id}
                className="grid grid-cols-[1.1fr_0.6fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-4 px-5 py-4 text-xs text-[#6b7280]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                      index % 2 === 0
                        ? "bg-[#eef3ff] text-[#4f5bff]"
                        : "bg-[#feecec] text-[#f04747]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2433]">
                      {type.name}
                    </p>
                    <p className="text-[11px] text-[#9aa2b1]">ID: {type.id}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4f5bff]">
                    {type.code}
                  </span>
                </div>
                <div className="flex items-center text-sm text-[#6b7280]">
                  {formatRate(type.hourlyRate)}
                </div>
                <div className="flex items-center text-sm text-[#6b7280]">
                  {type.serviceInterval
                    ? `${type.serviceInterval} days`
                    : "—"}
                </div>
                <div className="flex items-center">
                  <span
                    className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      type.isActive
                        ? typeStatusToneMap.active
                        : typeStatusToneMap.inactive
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {type.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#4f5bff]">
                  <button
                    onClick={() => openTypeEdit(type)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 9.6L9.6 3L11 4.4L4.4 11H3V9.6Z"
                        stroke="#4f5bff"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => openTypeView(type)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="4.5"
                        stroke="#9aa2b1"
                        strokeWidth="1.2"
                      />
                      <circle cx="7" cy="7" r="1.5" fill="#9aa2b1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openTypeDelete(type)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 1.5V7M10 3.5C11.2 4.6 12 6.2 12 8C12 10.5 9.8 12.5 7 12.5C4.2 12.5 2 10.5 2 8C2 6.2 2.8 4.6 4 3.5"
                        stroke="#9aa2b1"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-xs text-[#9aa2b1]">
            <span>
              Showing {deviceTypes.length ? 1 : 0} to {deviceTypes.length} of{" "}
              {deviceTypes.length} results
            </span>
            <div className="flex items-center overflow-hidden rounded-lg border border-[#e6eaf2] bg-white text-xs">
              <button className="flex h-8 w-8 items-center justify-center text-[#9aa2b1]">
                ‹
              </button>
              {["1", "2", "3"].map((page) => (
                <button
                  key={page}
                  className={`flex h-8 w-8 items-center justify-center ${
                    page === "1"
                      ? "bg-[#f3f5ff] text-[#4f5bff]"
                      : "text-[#9aa2b1]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="flex h-8 w-8 items-center justify-center text-[#9aa2b1]">
                ›
              </button>
            </div>
          </div>
        </section>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
          <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
            <div className="flex items-center justify-between border-b border-[#eef1f6] px-7 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ffecec] text-[#f04747]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 10.2L9.9 2.8L12.7 5.6L5.3 13H2.5V10.2Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h2 className="text-sm font-semibold text-[#1f2433]">
                  {modalMode === "create"
                    ? "Add Device"
                    : modalMode === "edit"
                      ? "Edit Device"
                      : modalMode === "view"
                        ? "Device Details"
                        : "Delete Device"}
                </h2>
              </div>
              <button
                onClick={resetModal}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
                aria-label="Close modal"
              >
                X
              </button>
            </div>

            {modalMode === "delete" ? (
              <div className="space-y-6 px-6 py-6">
                <p className="text-sm text-[#6b7280]">
                  This will permanently remove the device from your fleet.
                  <span className="text-[#1f2433]">
                    {" "}
                    ID: {activeDevice?.id}
                  </span>
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={resetModal}
                    className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3.5 px-7 py-4">
                  {formError && (
                    <div className="rounded-md border border-[#feecec] bg-[#fff5f5] px-4 py-2 text-xs text-[#f04747]">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Device Name
                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        disabled={modalMode === "view"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="Station 03"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Device ID
                      <input
                        value={form.id}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            id: event.target.value,
                          }))
                        }
                        disabled={modalMode !== "create"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="DEV-003"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Model
                      <select
                        value={form.model}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            model: event.target.value,
                          }))
                        }
                        disabled={modalMode === "view"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                      >
                        {modelOptions.length === 0 && (
                          <option value="" disabled>
                            No device types yet
                          </option>
                        )}
                        {modelOptions.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Hourly Rate (Rp)
                      <div className="flex h-9 items-center gap-2 rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433]">
                        <span className="text-[#9aa2b1]">Rp</span>
                        <input
                          value={form.rate}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              rate: event.target.value,
                            }))
                          }
                          disabled={modalMode === "view"}
                          className="w-full bg-transparent text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:text-[#9aa2b1]"
                          placeholder="12000"
                        />
                      </div>
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Last Service Date
                      <div className="relative">
                        <input
                          value={form.service}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              service: event.target.value,
                            }))
                          }
                          disabled={modalMode === "view"}
                          className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 pr-9 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                          placeholder="01/04/2026"
                        />
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa2b1]"
                          aria-hidden="true"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="10"
                            height="9"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M4 2V4M10 2V4M2 5.5H12"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </label>
                  </div>

                  <div className="border-t border-[#eef1f6] pt-3.5">
                    <p className="text-xs font-semibold text-[#6b7280]">
                      Device Status
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-[#6b7280]">
                      {statusOptions.map((status) => {
                        const isSelected = form.status === status;
                        const tone =
                          status === "Active"
                            ? "text-[#22c55e] border-[#22c55e]"
                            : status === "Maintenance"
                              ? "text-[#f59e0b] border-[#f59e0b]"
                              : "text-[#f04747] border-[#f04747]";
                        return (
                          <label
                            key={status}
                            className={`flex items-center gap-2 ${
                              modalMode === "view"
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="radio"
                              name="device-status"
                              value={status}
                              checked={isSelected}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  status: event.target.value as Device["status"],
                                }))
                              }
                              disabled={modalMode === "view"}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-3 w-3 items-center justify-center rounded-full border ${
                                isSelected
                                  ? tone
                                  : "border-[#d7dbe5] text-[#d7dbe5]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected ? "bg-current" : "bg-transparent"
                                }`}
                              />
                            </span>
                            {status}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 rounded-md border border-[#ffe1a6] bg-[#fff7e6] px-3 py-2 text-[11px] text-[#f59e0b]">
                      <span className="font-semibold">Note:</span> Setting
                      status to Maintenance will prevent cashiers from assigning
                      this station.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#eef1f6] px-7 py-4">
                  {modalMode !== "create" ? (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 rounded-md bg-[#fff1f1] px-3 py-2 text-xs font-semibold text-[#f04747]"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 3.5H9.5M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H7C7.28 2 7.5 2.22 7.5 2.5V3.5M4.5 5.5V8.5M7.5 5.5V8.5M3.5 3.5L4 9.5C4 9.78 4.22 10 4.5 10H7.5C7.78 10 8 9.78 8 9.5L8.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Delete Device
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetModal}
                      className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                    >
                      Cancel
                    </button>
                    {modalMode === "create" && (
                      <button
                        onClick={handleCreate}
                        className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                      >
                        Add Device
                      </button>
                    )}
                    {modalMode === "edit" && (
                      <button
                        onClick={handleUpdate}
                        className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                      >
                        Update Changes
                      </button>
                    )}
                    {modalMode === "view" && (
                      <button
                        onClick={() => activeDevice && openEdit(activeDevice)}
                        className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                      >
                        Edit Device
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {typeModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
          <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
            <div className="flex items-center justify-between border-b border-[#eef1f6] px-7 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef3ff] text-[#4f5bff]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 4.5H13M5 8H11M6.5 11.5H9.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <h2 className="text-sm font-semibold text-[#1f2433]">
                  {typeModalMode === "create"
                    ? "Add Device Type"
                    : typeModalMode === "edit"
                      ? "Edit Device Type"
                      : typeModalMode === "view"
                        ? "Device Type Details"
                        : "Delete Device Type"}
                </h2>
              </div>
              <button
                onClick={resetTypeModal}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
                aria-label="Close modal"
              >
                X
              </button>
            </div>

            {typeModalMode === "delete" ? (
              <div className="space-y-6 px-6 py-6">
                <p className="text-sm text-[#6b7280]">
                  This will remove the device type configuration.
                  <span className="text-[#1f2433]">
                    {" "}
                    ID: {activeType?.id}
                  </span>
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={resetTypeModal}
                    className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTypeDelete}
                    className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3.5 px-7 py-4">
                  {typeFormError && (
                    <div className="rounded-md border border-[#feecec] bg-[#fff5f5] px-4 py-2 text-xs text-[#f04747]">
                      {typeFormError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Type Name
                      <input
                        value={typeForm.name}
                        onChange={(event) =>
                          setTypeForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        disabled={typeModalMode === "view"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="PlayStation 5"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Type ID
                      <input
                        value={typeForm.id}
                        onChange={(event) =>
                          setTypeForm((prev) => ({
                            ...prev,
                            id: event.target.value,
                          }))
                        }
                        disabled={typeModalMode !== "create"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="TYPE-004"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Type Code
                      <input
                        value={typeForm.code}
                        onChange={(event) =>
                          setTypeForm((prev) => ({
                            ...prev,
                            code: event.target.value,
                          }))
                        }
                        disabled={typeModalMode === "view"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="PS5"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Default Hourly Rate (Rp)
                      <div className="flex h-9 items-center gap-2 rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433]">
                        <span className="text-[#9aa2b1]">Rp</span>
                        <input
                          value={typeForm.hourlyRate}
                          onChange={(event) =>
                            setTypeForm((prev) => ({
                              ...prev,
                              hourlyRate: event.target.value,
                            }))
                          }
                          disabled={typeModalMode === "view"}
                          className="w-full bg-transparent text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:text-[#9aa2b1]"
                          placeholder="16000"
                        />
                      </div>
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Service Cycle (days)
                      <input
                        value={typeForm.serviceInterval}
                        onChange={(event) =>
                          setTypeForm((prev) => ({
                            ...prev,
                            serviceInterval: normalizeInterval(
                              event.target.value
                            ),
                          }))
                        }
                        disabled={typeModalMode === "view"}
                        inputMode="numeric"
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="180"
                      />
                    </label>
                  </div>

                  <div className="border-t border-[#eef1f6] pt-3.5">
                    <p className="text-xs font-semibold text-[#6b7280]">
                      Type Status
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-[#6b7280]">
                      {["active", "inactive"].map((status) => {
                        const isSelected =
                          typeForm.isActive === (status === "active");
                        const tone =
                          status === "active"
                            ? "text-[#22c55e] border-[#22c55e]"
                            : "text-[#f04747] border-[#f04747]";
                        return (
                          <label
                            key={status}
                            className={`flex items-center gap-2 ${
                              typeModalMode === "view"
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="radio"
                              name="type-status"
                              value={status}
                              checked={isSelected}
                              onChange={(event) =>
                                setTypeForm((prev) => ({
                                  ...prev,
                                  isActive:
                                    event.target.value === "active",
                                }))
                              }
                              disabled={typeModalMode === "view"}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-3 w-3 items-center justify-center rounded-full border ${
                                isSelected
                                  ? tone
                                  : "border-[#d7dbe5] text-[#d7dbe5]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected ? "bg-current" : "bg-transparent"
                                }`}
                              />
                            </span>
                            {status === "active" ? "Active" : "Inactive"}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 rounded-md border border-[#ffe1a6] bg-[#fff7e6] px-3 py-2 text-[11px] text-[#f59e0b]">
                      <span className="font-semibold">Note:</span> Inactive
                      types cannot be assigned to new devices.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#eef1f6] px-7 py-4">
                  {typeModalMode !== "create" ? (
                    <button
                      onClick={handleTypeDelete}
                      className="flex items-center gap-2 rounded-md bg-[#fff1f1] px-3 py-2 text-xs font-semibold text-[#f04747]"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 3.5H9.5M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H7C7.28 2 7.5 2.22 7.5 2.5V3.5M4.5 5.5V8.5M7.5 5.5V8.5M3.5 3.5L4 9.5C4 9.78 4.22 10 4.5 10H7.5C7.78 10 8 9.78 8 9.5L8.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Delete Type
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetTypeModal}
                      className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                    >
                      Cancel
                    </button>
                    {typeModalMode === "create" && (
                      <button
                        onClick={handleTypeCreate}
                        className="rounded-md bg-[#4f5bff] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(79,91,255,0.3)]"
                      >
                        Add Type
                      </button>
                    )}
                    {typeModalMode === "edit" && (
                      <button
                        onClick={handleTypeUpdate}
                        className="rounded-md bg-[#4f5bff] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(79,91,255,0.3)]"
                      >
                        Update Type
                      </button>
                    )}
                    {typeModalMode === "view" && (
                      <button
                        onClick={() => activeType && openTypeEdit(activeType)}
                        className="rounded-md bg-[#4f5bff] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(79,91,255,0.3)]"
                      >
                        Edit Type
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
