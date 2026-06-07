export const ORDER_PROCESSING_SECONDS = 10;
export const ORDER_PROCESSING_MS = ORDER_PROCESSING_SECONDS * 1000;

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function getRemainingSeconds(
  startedAt?: number,
  now: number = Date.now(),
): number {
  if (typeof startedAt !== "number") {
    return ORDER_PROCESSING_SECONDS;
  }

  const elapsedSeconds = Math.floor((now - startedAt) / 1000);
  return Math.min(
    ORDER_PROCESSING_SECONDS,
    Math.max(0, ORDER_PROCESSING_SECONDS - elapsedSeconds),
  );
}
