export interface SyncStatus {
    status: "pending" | "processing" | "completed" | "failed" | null;
    position: number | null;
    requestedAt: string | null;
    errorMessage: string | null;
}
