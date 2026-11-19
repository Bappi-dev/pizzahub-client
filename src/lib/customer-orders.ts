export type CustomerOrder = {
  id: string;
  menuItemId: string;
  vendorId?: string;
  vendorName?: string;
  customerName?: string;
  customerEmail?: string;
  name: string;
  image?: string;
  price: number;
  deliveryDate: string;
  deliveryAddress: string;
  specialInstructions?: string;
  createdAt: string;
  status?: "pending" | "accepted" | "rejected";
};

export type NewCustomerOrder = Omit<CustomerOrder, "id" | "createdAt">;

const getStorageKey = (customerId: string) =>
  `pizzahub:customer-orders:${customerId}`;

const getUpdateEventName = (customerId: string) =>
  `pizzahub:customer-orders-updated:${customerId}`;

function isCustomerOrder(value: unknown): value is CustomerOrder {
  if (typeof value !== "object" || value === null) return false;

  const order = value as Record<string, unknown>;

  return (
    typeof order.id === "string" &&
    typeof order.menuItemId === "string" &&
    typeof order.name === "string" &&
    (order.image === undefined || typeof order.image === "string") &&
    typeof order.price === "number" &&
    Number.isFinite(order.price) &&
    typeof order.deliveryDate === "string" &&
    typeof order.deliveryAddress === "string" &&
    (order.specialInstructions === undefined ||
      typeof order.specialInstructions === "string") &&
    typeof order.createdAt === "string" &&
    (order.status === undefined ||
      order.status === "pending" ||
      order.status === "accepted" ||
      order.status === "rejected")
  );
}

export function parseCustomerOrdersResponse(value: unknown): CustomerOrder[] {
  if (
    typeof value !== "object" ||
    value === null ||
    !("orders" in value) ||
    !Array.isArray(value.orders) ||
    !value.orders.every(isCustomerOrder)
  ) {
    throw new Error("The server returned invalid order data.");
  }

  return value.orders;
}

export function parseCustomerOrders(
  storedOrders: string | null,
): CustomerOrder[] {
  if (storedOrders === null) return [];

  let parsedOrders: unknown;
  try {
    parsedOrders = JSON.parse(storedOrders);
  } catch {
    throw new Error("Saved orders could not be read. Clear the damaged order data and try again.");
  }

  if (!Array.isArray(parsedOrders) || !parsedOrders.every(isCustomerOrder)) {
    throw new Error("Saved orders have an invalid format.");
  }

  return parsedOrders;
}

export function getCustomerOrdersSnapshot(customerId: string) {
  return window.localStorage.getItem(getStorageKey(customerId));
}

export function subscribeToCustomerOrders(
  customerId: string,
  onStoreChange: () => void,
) {
  const storageKey = getStorageKey(customerId);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) onStoreChange();
  };
  const updateEventName = getUpdateEventName(customerId);

  window.addEventListener("storage", onStorage);
  window.addEventListener(updateEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(updateEventName, onStoreChange);
  };
}

export function getCustomerOrders(customerId: string): CustomerOrder[] {
  return parseCustomerOrders(getCustomerOrdersSnapshot(customerId));
}

export function saveCustomerOrder(
  customerId: string,
  orderDetails: NewCustomerOrder,
): CustomerOrder {
  const order: CustomerOrder = {
    ...orderDetails,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const orders = getCustomerOrders(customerId);

  window.localStorage.setItem(
    getStorageKey(customerId),
    JSON.stringify([order, ...orders]),
  );
  window.dispatchEvent(new Event(getUpdateEventName(customerId)));

  return order;
}
