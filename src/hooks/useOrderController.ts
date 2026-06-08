"use client";

import { useCallback, useEffect, useState } from "react";
import { enqueueOrder, requeueOrder } from "@/lib/orderQueue";
import { ORDER_PROCESSING_MS } from "@/lib/time";

export type OrderType = "VIP" | "NORMAL";
export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETE" | "CANCELLED";

export type Order = {
  id: number;
  type: OrderType;
  status: OrderStatus;
  createdAt: number;
  lastPendingIndex?: number;
  lastPendingTypeIndex?: number;
  startedAt?: number;
  completedAt?: number;
};

export type BotStatus = "IDLE" | "PROCESSING";

export type Bot = {
  id: number;
  status: BotStatus;
  currentOrderId?: number;
  startedAt?: number;
};

export type LogEntry = {
  id: number;
  message: string;
  timestamp: number;
};

type ControllerState = {
  pendingOrders: Order[];
  processingOrders: Order[];
  completedOrders: Order[];
  bots: Bot[];
  logs: LogEntry[];
  nextOrderId: number;
  nextBotId: number;
  nextLogId: number;
};

function createInitialState(): ControllerState {
  return {
    pendingOrders: [],
    processingOrders: [],
    completedOrders: [],
    bots: [],
    logs: [],
    nextOrderId: 1,
    nextBotId: 1,
    nextLogId: 1,
  };
}

function appendLog(
  state: ControllerState,
  message: string,
  timestamp: number,
): ControllerState {
  return {
    ...state,
    logs: [
      {
        id: state.nextLogId,
        message,
        timestamp,
      },
      ...state.logs,
    ],
    nextLogId: state.nextLogId + 1,
  };
}

function appendLogs(
  state: ControllerState,
  messages: string[],
  timestamp: number,
): ControllerState {
  return messages.reduce(
    (currentState, message) => appendLog(currentState, message, timestamp),
    state,
  );
}

function assignPendingToIdleBots(
  state: ControllerState,
  now: number,
): { state: ControllerState; assignedBotIds: number[] } {
  const pendingOrderSnapshot = [...state.pendingOrders];
  const pendingOrders = [...state.pendingOrders];
  const processingOrders = [...state.processingOrders];
  const bots = [...state.bots];
  const logMessages: string[] = [];
  const assignedBotIds: number[] = [];

  for (let index = 0; index < bots.length && pendingOrders.length > 0; index += 1) {
    const bot = bots[index];

    if (bot.status !== "IDLE") {
      continue;
    }

    const nextOrderIndex = pendingOrders.findIndex(
      (order) => order.status === "PENDING",
    );

    if (nextOrderIndex === -1) {
      break;
    }

    const [nextOrder] = pendingOrders.splice(nextOrderIndex, 1);

    if (!nextOrder) {
      break;
    }

    const originalPendingIndex = pendingOrderSnapshot.findIndex(
      (order) => order.id === nextOrder.id,
    );
    const originalPendingTypeIndex = pendingOrderSnapshot
      .filter(
        (order) =>
          order.type === nextOrder.type && order.status !== "CANCELLED",
      )
      .findIndex((order) => order.id === nextOrder.id);

    processingOrders.push({
      ...nextOrder,
      lastPendingIndex:
        originalPendingIndex === -1 ? nextOrderIndex : originalPendingIndex,
      lastPendingTypeIndex:
        originalPendingTypeIndex === -1 ? 0 : originalPendingTypeIndex,
      status: "PROCESSING",
      startedAt: now,
      completedAt: undefined,
    });

    bots[index] = {
      ...bot,
      status: "PROCESSING",
      currentOrderId: nextOrder.id,
      startedAt: now,
    };

    assignedBotIds.push(bot.id);
    logMessages.push(
      `Bot #${bot.id} started processing order #${nextOrder.id} (${nextOrder.type}).`,
    );
  }

  if (assignedBotIds.length === 0) {
    return { state, assignedBotIds };
  }

  const nextState = appendLogs(
    {
      ...state,
      pendingOrders,
      processingOrders,
      bots,
    },
    logMessages,
    now,
  );

  return {
    state: nextState,
    assignedBotIds,
  };
}

function processCompletedOrders(
  state: ControllerState,
  now: number,
): ControllerState {
  const processingOrders = [...state.processingOrders];
  const bots = [...state.bots];
  let completedOrders = [...state.completedOrders];
  const completionLogs: string[] = [];
  const freedBotIds: number[] = [];

  for (let index = 0; index < bots.length; index += 1) {
    const bot = bots[index];

    if (
      bot.status !== "PROCESSING" ||
      typeof bot.startedAt !== "number" ||
      now - bot.startedAt < ORDER_PROCESSING_MS
    ) {
      continue;
    }

    const processingIndex = processingOrders.findIndex(
      (order) => order.id === bot.currentOrderId,
    );

    if (processingIndex !== -1) {
      const [completedOrder] = processingOrders.splice(processingIndex, 1);
      completedOrders = [
        {
          ...completedOrder,
          status: "COMPLETE",
          lastPendingIndex: undefined,
          lastPendingTypeIndex: undefined,
          completedAt: now,
        },
        ...completedOrders,
      ];
      completionLogs.push(
        `Order #${completedOrder.id} (${completedOrder.type}) completed by bot #${bot.id}.`,
      );
    }

    bots[index] = {
      id: bot.id,
      status: "IDLE",
    };
    freedBotIds.push(bot.id);
  }

  if (freedBotIds.length === 0) {
    return state;
  }

  let nextState = appendLogs(
    {
      ...state,
      processingOrders,
      completedOrders,
      bots,
    },
    completionLogs,
    now,
  );

  const assignment = assignPendingToIdleBots(nextState, now);
  nextState = assignment.state;

  const idleLogs = freedBotIds
    .filter((botId) => !assignment.assignedBotIds.includes(botId))
    .map((botId) => `Bot #${botId} became idle and is waiting for work.`);

  if (idleLogs.length > 0) {
    nextState = appendLogs(nextState, idleLogs, now);
  }

  return nextState;
}

export function useOrderController() {
  const [controllerState, setControllerState] = useState<ControllerState>(
    createInitialState,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      setControllerState((previousState) =>
        processCompletedOrders(previousState, now),
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const addNormalOrder = useCallback(() => {
    const now = Date.now();

    setControllerState((previousState) => {
      const order: Order = {
        id: previousState.nextOrderId,
        type: "NORMAL",
        status: "PENDING",
        createdAt: now,
      };

      let nextState: ControllerState = {
        ...previousState,
        pendingOrders: enqueueOrder(previousState.pendingOrders, order),
        nextOrderId: previousState.nextOrderId + 1,
      };

      nextState = appendLog(
        nextState,
        `Normal order #${order.id} created and added to pending.`,
        now,
      );

      return assignPendingToIdleBots(nextState, now).state;
    });
  }, []);

  const addVipOrder = useCallback(() => {
    const now = Date.now();

    setControllerState((previousState) => {
      const order: Order = {
        id: previousState.nextOrderId,
        type: "VIP",
        status: "PENDING",
        createdAt: now,
      };

      let nextState: ControllerState = {
        ...previousState,
        pendingOrders: enqueueOrder(previousState.pendingOrders, order),
        nextOrderId: previousState.nextOrderId + 1,
      };

      nextState = appendLog(
        nextState,
        `VIP order #${order.id} created and added to pending.`,
        now,
      );

      return assignPendingToIdleBots(nextState, now).state;
    });
  }, []);

  const addBot = useCallback(() => {
    const now = Date.now();

    setControllerState((previousState) => {
      const bot: Bot = {
        id: previousState.nextBotId,
        status: "IDLE",
      };

      let nextState: ControllerState = {
        ...previousState,
        bots: [...previousState.bots, bot],
        nextBotId: previousState.nextBotId + 1,
      };

      nextState = appendLog(nextState, `Bot #${bot.id} added.`, now);

      return assignPendingToIdleBots(nextState, now).state;
    });
  }, []);

  const cancelPendingOrder = useCallback((orderId: number) => {
    const now = Date.now();

    setControllerState((previousState) => {
      const orderIndex = previousState.pendingOrders.findIndex(
        (order) => order.id === orderId && order.status === "PENDING",
      );

      if (orderIndex === -1) {
        return previousState;
      }

      const pendingOrders = [...previousState.pendingOrders];
      const targetOrder = pendingOrders[orderIndex];

      pendingOrders[orderIndex] = {
        ...targetOrder,
        status: "CANCELLED",
      };

      return appendLog(
        {
          ...previousState,
          pendingOrders,
        },
        `Order #${targetOrder.id} (${targetOrder.type}) cancelled in pending.`,
        now,
      );
    });
  }, []);

  const removeBot = useCallback(() => {
    const now = Date.now();

    setControllerState((previousState) => {
      if (previousState.bots.length === 0) {
        return previousState;
      }

      const botToRemove = previousState.bots[previousState.bots.length - 1];
      let nextState: ControllerState = {
        ...previousState,
        bots: previousState.bots.slice(0, -1),
      };

      if (botToRemove.status === "PROCESSING" && botToRemove.currentOrderId) {
        const processingIndex = previousState.processingOrders.findIndex(
          (order) => order.id === botToRemove.currentOrderId,
        );

        if (processingIndex !== -1) {
          const processingOrders = [...previousState.processingOrders];
          const [orderToReturn] = processingOrders.splice(processingIndex, 1);
          const pendingOrder: Order = {
            ...orderToReturn,
            status: "PENDING",
            lastPendingIndex: undefined,
            lastPendingTypeIndex: undefined,
            startedAt: undefined,
            completedAt: undefined,
          };

          nextState = {
            ...nextState,
            pendingOrders: requeueOrder(
              previousState.pendingOrders,
              pendingOrder,
              orderToReturn.lastPendingIndex,
              orderToReturn.lastPendingTypeIndex,
            ),
            processingOrders,
          };

          nextState = appendLog(
            nextState,
            `Processing cancelled on bot #${botToRemove.id}; order #${pendingOrder.id} returned to pending.`,
            now,
          );
        }
      }

      nextState = appendLog(nextState, `Bot #${botToRemove.id} removed.`, now);

      return assignPendingToIdleBots(nextState, now).state;
    });
  }, []);

  const reset = useCallback(() => {
    const now = Date.now();
    setCurrentTime(now);
    setControllerState(() =>
      appendLog(createInitialState(), "Demo reset.", now),
    );
  }, []);

  return {
    currentTime,
    pendingOrders: controllerState.pendingOrders,
    processingOrders: controllerState.processingOrders,
    completedOrders: controllerState.completedOrders,
    bots: controllerState.bots,
    logs: controllerState.logs,
    addNormalOrder,
    addVipOrder,
    cancelPendingOrder,
    addBot,
    removeBot,
    reset,
  };
}
