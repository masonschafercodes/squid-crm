import { writable } from "svelte/store";

export const contacts = writable<Contact[]>([]);

export const selectedContact = writable<Contact | null>(null);
