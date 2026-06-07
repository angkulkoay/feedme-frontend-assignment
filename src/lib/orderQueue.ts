type QueueOrder = {
  id: number;
  type: "VIP" | "NORMAL";
};

export function enqueueOrder<T extends QueueOrder>(queue: T[], order: T): T[] {
  if (order.type === "NORMAL") {
    return [...queue, order];
  }

  const firstNormalIndex = queue.findIndex(
    (queuedOrder) => queuedOrder.type === "NORMAL",
  );

  if (firstNormalIndex === -1) {
    return [...queue, order];
  }

  return [
    ...queue.slice(0, firstNormalIndex),
    order,
    ...queue.slice(firstNormalIndex),
  ];
}

export function requeueOrder<T extends QueueOrder>(queue: T[], order: T): T[] {
  return enqueueOrder(queue, order);
}

export function getQueuePosition<T extends Pick<QueueOrder, "id">>(
  queue: T[],
  orderId: number,
): number | null {
  const index = queue.findIndex((order) => order.id === orderId);
  return index === -1 ? null : index + 1;
}
