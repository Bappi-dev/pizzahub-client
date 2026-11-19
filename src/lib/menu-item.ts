type UnknownRecord = Record<string, unknown>;

export type MenuItemDetails = {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  location?: string;
  category?: string;
  status?: string;
  approvalStatus?: string;
  vendorId?: string;
  vendorName?: string;
  rating?: number;
  reviewCount?: number;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const readString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export function parseMenuItemDetails(
  value: unknown,
): MenuItemDetails | null {
  if (!isRecord(value)) return null;

  const id = readString(value._id) ?? readString(value.id);
  const name = readString(value.name);
  if (
    (typeof value.price !== "number" && typeof value.price !== "string") ||
    (typeof value.price === "string" && !value.price.trim())
  ) {
    return null;
  }
  const price = Number(value.price);

  if (!id || !name || !Number.isFinite(price) || price < 0) return null;

  const vendor = isRecord(value.vendor)
    ? value.vendor
    : isRecord(value.vendorInfo)
      ? value.vendorInfo
      : undefined;
  const imageValues = [
    value.itemImage,
    ...(Array.isArray(value.images) ? value.images : []),
    ...(Array.isArray(value.itemImages) ? value.itemImages : []),
  ];
  const images = Array.from(
    new Set(
      imageValues
        .map(readString)
        .filter((image): image is string => !!image),
    ),
  );
  const locationRecord = isRecord(value.location) ? value.location : undefined;
  const location =
    readString(value.location) ??
    (locationRecord
      ? [
          readString(locationRecord.address),
          readString(locationRecord.city),
          readString(locationRecord.state),
        ]
          .filter(Boolean)
          .join(", ") || undefined
      : undefined);
  const approvalStatus =
    readString(value.approvalStatus) ??
    readString(value.reviewStatus) ??
    (value.isApproved === true ? "approved" : undefined);
  const status =
    readString(value.status) ??
    (value.isActive === true
      ? "active"
      : value.isActive === false
        ? "inactive"
        : undefined);
  const rating =
    typeof value.rating === "number" && Number.isFinite(value.rating)
      ? value.rating
      : undefined;
  const reviewCount =
    typeof value.reviewCount === "number" &&
    Number.isInteger(value.reviewCount) &&
    value.reviewCount >= 0
      ? value.reviewCount
      : undefined;

  return {
    id,
    name,
    price,
    images,
    description: readString(value.description),
    location,
    category: readString(value.category),
    status,
    approvalStatus,
    vendorId:
      readString(value.vendorId) ??
      readString(vendor?._id) ??
      readString(vendor?.id),
    vendorName:
      readString(value.vendorName) ??
      readString(vendor?.name) ??
      readString(value.vendor),
    rating,
    reviewCount,
  };
}
