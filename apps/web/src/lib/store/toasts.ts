import { writable } from "svelte/store";

export const toasts = writable<Toasts>([]);

export function addToast(title: string, message: string) {
  const id = Math.random();
  toasts.update((t) => [...t, { id, title, message }]);
  setTimeout(() => {
    toasts.update((t) => t.filter((toast) => toast.id !== id));
  }, 5000);
}
