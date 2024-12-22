import { randomBytes } from "crypto";

export function generateHash(len: number) {
  return randomBytes(len).toString("hex").slice(0, len);
}
