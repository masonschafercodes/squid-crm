import { derived, writable } from "svelte/store";

export const payments = writable<LSPayment[]>([]);

export const currentPayment = derived(payments, ($payments) => $payments[0]);
