import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export function generateOrderNumber() {
  return `SZ-${nanoid()}`;
}

export function formatINR(paise) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
