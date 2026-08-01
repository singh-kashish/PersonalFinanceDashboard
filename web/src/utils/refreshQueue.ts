// src/utils/refreshQueue.ts
type PendingRequestCallback = (token: string | null) => void;

let isRefreshing = false;
let pendingRequests: PendingRequestCallback[] = [];

export const refreshQueue = {
  get isRefreshing() {
    return isRefreshing;
  },
  setRefreshing(value: boolean) {
    isRefreshing = value;
  },
  push(cb: PendingRequestCallback) {
    pendingRequests.push(cb);
  },
  process(token: string | null) {
    pendingRequests.forEach((cb) => cb(token));
    pendingRequests = [];
  },
};
