type QueueOrder = {
  id: number;
  type: "VIP" | "NORMAL";
  status?: "PENDING" | "PROCESSING" | "COMPLETE" | "CANCELLED";
};

function isCancelledOrder(order: QueueOrder): boolean {
  return order.status === "CANCELLED";
}

function getActualInsertIndexForActiveRank<T extends QueueOrder>(
  queue: T[],
  activeRank: number,
): number {
  if (activeRank <= 0) {
    const firstActiveIndex = queue.findIndex((order) => !isCancelledOrder(order));
    return firstActiveIndex === -1 ? queue.length : firstActiveIndex;
  }

  let seenActiveOrders = 0;

  for (let index = 0; index < queue.length; index += 1) {
    if (isCancelledOrder(queue[index])) {
      continue;
    }

    if (seenActiveOrders === activeRank) {
      return index;
    }

    seenActiveOrders += 1;
  }

  return queue.length;
}

export function insertOrderAtPosition<T extends QueueOrder>(
  queue: T[],
  order: T,
  position?: number,
): T[] {
  if (typeof position !== "number" || Number.isNaN(position)) {
    return [...queue, order];
  }

  const clampedPosition = Math.min(Math.max(position, 0), queue.length);

  return [
    ...queue.slice(0, clampedPosition),
    order,
    ...queue.slice(clampedPosition),
  ];
}

export function enqueueOrder<T extends QueueOrder>(queue: T[], order: T): T[] {
  const activeOrders = queue.filter((queuedOrder) => !isCancelledOrder(queuedOrder));

  if (order.type === "NORMAL") {
    return insertOrderAtPosition(
      queue,
      order,
      getActualInsertIndexForActiveRank(queue, activeOrders.length),
    );
  }

  const firstNormalIndex = activeOrders.findIndex(
    (queuedOrder) => queuedOrder.type === "NORMAL",
  );

  if (firstNormalIndex === -1) {
    return insertOrderAtPosition(
      queue,
      order,
      getActualInsertIndexForActiveRank(queue, activeOrders.length),
    );
  }

  return insertOrderAtPosition(
    queue,
    order,
    getActualInsertIndexForActiveRank(queue, firstNormalIndex),
  );
}

export function requeueOrder<T extends QueueOrder>(
  queue: T[],
  order: T,
  originalPosition?: number,
  originalTypePosition?: number,
): T[] {
  if (
    typeof originalTypePosition === "number" &&
    !Number.isNaN(originalTypePosition)
  ) {
    const sameTypeOrders = queue.filter(
      (queuedOrder) =>
        queuedOrder.type === order.type && !isCancelledOrder(queuedOrder),
    );
    const clampedTypePosition = Math.min(
      Math.max(originalTypePosition, 0),
      sameTypeOrders.length,
    );

    const targetActiveRank =
      order.type === "VIP"
        ? clampedTypePosition
        : queue.filter(
            (queuedOrder) =>
              queuedOrder.type === "VIP" && !isCancelledOrder(queuedOrder),
          ).length + clampedTypePosition;

    return insertOrderAtPosition(
      queue,
      order,
      getActualInsertIndexForActiveRank(queue, targetActiveRank),
    );
  }

  if (typeof originalPosition === "number" && !Number.isNaN(originalPosition)) {
    return insertOrderAtPosition(queue, order, originalPosition);
  }

  return enqueueOrder(queue, order);
}

export function getQueuePosition<T extends Pick<QueueOrder, "id">>(
  queue: T[],
  orderId: number,
): number | null {
  const index = queue.findIndex((order) => order.id === orderId);
  return index === -1 ? null : index + 1;
}
