import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return salt + ":" + hash;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  return createHash("sha256").update(password + salt).digest("hex") === hash;
}
export function createSession(parentId: string): string {
  const secret = process.env.SESSION_SECRET || "fallback-secret";
  const payload = parentId + ":" + Date.now();
  const sig = createHash("sha256").update(payload + secret).digest("hex");
  return Buffer.from(payload + ":" + sig).toString("base64");
}
export function verifySession(token: string): string | null {
  try {
    const secret = process.env.SESSION_SECRET || "fallback-secret";
    const decoded = Buffer.from(token, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const sig = parts.pop()!;
    const payload = parts.join(":");
    if (createHash("sha256").update(payload + secret).digest("hex") !== sig) return null;
    return parts[0];
  } catch { return null; }
}
export function getParentIdFromCookies(): string | null {
  try { const s = cookies().get("fle_session")?.value; return s ? verifySession(s) : null; } catch { return null; }
}
