type Listener = (percentage: number) => void;

let listeners: Listener[] = [];

export const addUploadProgressListener = (fn: Listener) => {
  listeners.push(fn);
};

export const removeUploadProgressListener = (fn: Listener) => {
  listeners = listeners.filter((l) => l !== fn);
};

export const notifyUploadProgress = (percentage: number) => {
  listeners.forEach((l) => l(percentage));
};
