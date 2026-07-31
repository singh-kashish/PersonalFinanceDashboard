// refreshQueue.ts
type PendingRequestCallback = (token: string | null) => void;

let isRefreshing = false; // marks whether refresh is happening
let pendingRequests: PendingRequestCallback[] = []; // holds callbacks that failed with 401 while refresh happens

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
  }, // processes failed callbacks with 401 with new token and clears pending request queue.
};

{/*Model - 1st 401 invokes refresh access token call -> later requests with 401 are enqueued(won't invoke refresh call) 
 -> Retried with new token*/}
