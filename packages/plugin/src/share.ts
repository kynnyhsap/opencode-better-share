import { nanoid } from "nanoid";
import type {
  ShareInfo,
  ShareData,
  PresignResponse,
  SyncPresignResponse,
  ApiError,
} from "./types";
import { readFullSession, findProjectForSession } from "./storage";

// API base URL - can be configured via env or hardcoded
const API_BASE_URL = process.env.BETTER_SHARE_API_URL || "https://opncd.com";

/**
 * ShareManager handles all share operations
 * - Creating shares
 * - Syncing updates
 * - Removing shares
 */
export class ShareManager {
  // In-memory map of active shares: sessionID -> ShareInfo
  private activeShares = new Map<string, ShareInfo>();

  // Sync queue for debouncing
  private syncQueue = new Map<string, NodeJS.Timeout>();
  private syncDebounceMs = 1000;

  /**
   * Check if a session is currently shared
   */
  isShared(sessionID: string): boolean {
    return this.activeShares.has(sessionID);
  }

  /**
   * Get share info for a session
   */
  getShareInfo(sessionID: string): ShareInfo | undefined {
    return this.activeShares.get(sessionID);
  }

  /**
   * Create a new share
   * 1. Request presigned URL from API
   * 2. Read session data from local storage
   * 3. Upload to R2 via presigned URL
   * 4. Store share info in memory
   */
  async createShare(
    sessionID: string,
    shareId: string,
  ): Promise<{ url: string; error?: string }> {
    // Find project ID for this session
    const projectID = await findProjectForSession(sessionID);

    if (!projectID) {
      return { url: "", error: "Could not find session" };
    }

    // Request presigned URL from API
    const presignResponse = await this.requestPresignedUrl(shareId, sessionID);

    if ("error" in presignResponse) {
      return { url: "", error: presignResponse.error };
    }

    // Read full session data
    const sessionData = await readFullSession(projectID, sessionID);

    if (!sessionData) {
      return { url: "", error: "Could not read session data" };
    }

    // Build share data
    const shareData: ShareData = {
      shareId,
      sessionId: sessionID,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      session: sessionData.session,
      messages: sessionData.messages,
    };

    // Upload to R2
    const uploadSuccess = await this.uploadToR2(
      presignResponse.presignedUrl,
      shareData,
    );

    if (!uploadSuccess) {
      return { url: "", error: "Failed to upload share data" };
    }

    // Store share info in memory
    const shareInfo: ShareInfo = {
      shareId,
      secret: presignResponse.secret,
      url: presignResponse.url,
      sessionId: sessionID,
      createdAt: Date.now(),
    };

    this.activeShares.set(sessionID, shareInfo);

    return { url: presignResponse.url };
  }

  /**
   * Sync session updates to remote
   * Uses debouncing to batch rapid updates
   */
  queueSync(sessionID: string): void {
    const shareInfo = this.activeShares.get(sessionID);

    if (!shareInfo) {
      return; // Not shared, ignore
    }

    // Clear existing timeout
    const existingTimeout = this.syncQueue.get(sessionID);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new debounced sync
    const timeout = setTimeout(() => {
      this.syncQueue.delete(sessionID);
      this.performSync(sessionID, shareInfo).catch((err) => {
        console.error("[better-share] Sync failed:", err);
      });
    }, this.syncDebounceMs);

    this.syncQueue.set(sessionID, timeout);
  }

  /**
   * Actually perform the sync
   */
  private async performSync(
    sessionID: string,
    shareInfo: ShareInfo,
  ): Promise<void> {
    // Find project ID
    const projectID = await findProjectForSession(sessionID);

    if (!projectID) {
      console.error("[better-share] Could not find project for session");
      return;
    }

    // Get presigned URL for sync
    const presignResponse = await this.requestSyncPresignedUrl(
      shareInfo.shareId,
      shareInfo.secret,
    );

    if ("error" in presignResponse) {
      console.error(
        "[better-share] Failed to get presigned URL:",
        presignResponse.error,
      );
      return;
    }

    // Read full session data
    const sessionData = await readFullSession(projectID, sessionID);

    if (!sessionData) {
      console.error("[better-share] Could not read session data");
      return;
    }

    // Build share data
    const shareData: ShareData = {
      shareId: shareInfo.shareId,
      sessionId: sessionID,
      createdAt: shareInfo.createdAt,
      updatedAt: Date.now(),
      session: sessionData.session,
      messages: sessionData.messages,
    };

    // Upload to R2
    await this.uploadToR2(presignResponse.presignedUrl, shareData);
  }

  /**
   * Remove a share
   * 1. Delete from R2 via API
   * 2. Remove from memory
   */
  async removeShare(sessionID: string): Promise<{ error?: string }> {
    const shareInfo = this.activeShares.get(sessionID);

    if (!shareInfo) {
      return { error: "Session is not shared" };
    }

    // Delete from API (which deletes from R2)
    const success = await this.deleteShare(shareInfo.shareId, shareInfo.secret);

    if (!success) {
      return { error: "Failed to delete share" };
    }

    // Remove from memory
    this.activeShares.delete(sessionID);

    // Cancel any pending sync
    const pendingSync = this.syncQueue.get(sessionID);
    if (pendingSync) {
      clearTimeout(pendingSync);
      this.syncQueue.delete(sessionID);
    }

    return {};
  }

  /**
   * Request presigned URL for new share
   */
  private async requestPresignedUrl(
    shareId: string,
    sessionId: string,
  ): Promise<PresignResponse | ApiError> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/share/presign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shareId, sessionId }),
      });

      const data = await response.json();

      if (!response.ok || "error" in data) {
        return data as ApiError;
      }

      return data as PresignResponse;
    } catch (err) {
      return { error: `Network error: ${err}` };
    }
  }

  /**
   * Request presigned URL for sync
   */
  private async requestSyncPresignedUrl(
    shareId: string,
    secret: string,
  ): Promise<SyncPresignResponse | ApiError> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/share/${shareId}/presign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Share-Secret": secret,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || "error" in data) {
        return data as ApiError;
      }

      return data as SyncPresignResponse;
    } catch (err) {
      return { error: `Network error: ${err}` };
    }
  }

  /**
   * Upload share data to R2 via presigned URL
   */
  private async uploadToR2(
    presignedUrl: string,
    data: ShareData,
  ): Promise<boolean> {
    try {
      const response = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (err) {
      console.error("[better-share] Upload failed:", err);
      return false;
    }
  }

  /**
   * Delete share via API
   */
  private async deleteShare(shareId: string, secret: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/share/${shareId}`, {
        method: "DELETE",
        headers: {
          "X-Share-Secret": secret,
        },
      });

      return response.ok;
    } catch (err) {
      console.error("[better-share] Delete failed:", err);
      return false;
    }
  }
}
