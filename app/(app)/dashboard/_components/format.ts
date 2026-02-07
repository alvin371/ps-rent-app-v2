export const formatRupiah = (value: number) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const padTwo = (value: number) => value.toString().padStart(2, "0");

export const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${padTwo(hours)}:${padTwo(minutes)}:${padTwo(seconds)}`;
};

export const formatClock = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
};

export const formatClockWithSeconds = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}:${padTwo(
    date.getSeconds()
  )}`;
};
