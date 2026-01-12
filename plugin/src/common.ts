export const BETTER_SHARE_BASE_URL = process.env.BETTER_SHARE_BASE_URL || "https://opncd.com";

export function getShareId(sessionID: string): string {
  return sessionID.slice(-8);
}

export function getShareUrl(sessionID: string): string {
  return `https://opncd.ai/share/${getShareId(sessionID)}`;
}

export function getBetterShareUrl(sessionID: string): string {
  return `${BETTER_SHARE_BASE_URL}/share/${getShareId(sessionID)}`;
}
