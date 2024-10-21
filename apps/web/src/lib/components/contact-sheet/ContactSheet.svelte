<script lang="ts">
  import { writable } from "svelte/store";
  import AtSymbolIcon from "../icons/AtSymbolIcon.svelte";
  import ItalicsIcon from "../icons/ItalicsIcon.svelte";
  import LocationMarkerIcon from "../icons/LocationMarkerIcon.svelte";
  import PhoneIcon from "../icons/PhoneIcon.svelte";
  import UserIcon from "../icons/UserIcon.svelte";
  import Sheet from "../sheet/Sheet.svelte";
  import fetcher from "$lib/fetcher";
  import { contacts, selectedContact } from "$lib/store/contacts";
  import SpinnerIcon from "../icons/SpinnerIcon.svelte";

  export let open = false;
  export let close = () => {};
  export let isEdit = false;
  export let defaultContact: Contact = {
    firstName: "",
    lastName: "",
    id: "",
    backgroundInfo: "",
    birthday: "",
    jobTitle: "",
    middleName: "",
    personalAddress: "",
    personalEmail: "",
    personalPhone: "",
    salutation: "",
    suffix: "",
    workAddress: "",
    workEmail: "",
    workPhone: "",
    historyEvents: [],
    tasks: [],
  };

  const addContactLoading = writable(false);
  const createContactRecord = writable<Contact>(defaultContact);

  async function handleCreateContact() {
    addContactLoading.set(true);
    try {
      const newContact = await fetcher<Contact>("/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify($createContactRecord),
      });

      contacts.update((prev) => {
        const newContacts: Contact[] = [];

        prev.map((contact) => {
          if (contact.id === newContact.id) {
            newContacts.push(newContact);
          } else {
            newContacts.push(contact);
          }
        });

        return newContacts;
      });
      selectedContact.set(newContact);
      close();
      addContactLoading.set(false);
    } catch (e) {
      addContactLoading.set(false);
      console.error(e);
    }
  }
</script>

<Sheet {close} {open}>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <div
        class="p-2 bg-blue-500/30 text-blue-700 flex items-center justify-center rounded-full w-10 h-10"
      >
        <UserIcon class="w-4 h-4" />
      </div>
      <span class="text-2xl font-bold">
        {isEdit ? "Edit" : "Create"} Contact
      </span>
    </div>
    <hr class="border-zinc-400/20" />
    <form class="grid gap-4" on:submit|preventDefault={handleCreateContact}>
      <h3
        class="text-lg text-zinc-700/90 font-semibold flex items-center gap-2"
      >
        Contact Information
      </h3>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label
            for="contact-first-name"
            class="text-sm text-zinc-700/70 flex items-center justify-between"
          >
            First Name
            <span class="text-xs text-red-800 mr-2"> Required </span>
          </label>
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <ItalicsIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              required
              name="contact-first-name"
              id="contact-first-name"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="Jane"
              bind:value={$createContactRecord.firstName}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label
            for="contact-last-name"
            class="text-sm text-zinc-700/70 flex items-center justify-between"
          >
            Last Name
            <span class="text-xs text-red-800 mr-2"> Required </span>
          </label>
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <ItalicsIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              required
              name="contact-last-name"
              id="contact-last-name"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="Doe"
              bind:value={$createContactRecord.lastName}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="contact-salutation" class="text-sm text-zinc-700/70"
            >Salutation</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <ItalicsIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              name="contact-salutation"
              id="contact-salutation"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="Ms."
              bind:value={$createContactRecord.salutation}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="contact-email" class="text-sm text-zinc-700/70"
            >Work Email</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <AtSymbolIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="email"
              name="contact-email"
              id="contact-email"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="test@ez-crm.com"
              bind:value={$createContactRecord.workEmail}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="contact-email" class="text-sm text-zinc-700/70"
            >Personal Email</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <AtSymbolIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="email"
              name="contact-email"
              id="contact-email"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="test@ez-crm.com"
              bind:value={$createContactRecord.personalEmail}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="contact-phone" class="text-sm text-zinc-700/70"
            >Work Phone</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <PhoneIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              name="contact-phone"
              id="contact-phone"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="111-111-1111"
              bind:value={$createContactRecord.workPhone}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="contact-phone" class="text-sm text-zinc-700/70"
            >Personal Phone</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <PhoneIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              name="contact-phone"
              id="contact-phone"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="111-111-1111"
              bind:value={$createContactRecord.personalPhone}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="contact-title" class="text-sm text-zinc-700/70"
            >Job Title</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <ItalicsIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              name="contact-title"
              id="contact-title"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="Software Engineer"
              bind:value={$createContactRecord.jobTitle}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label for="contact-address" class="text-sm text-zinc-700/70"
            >Work Address</label
          >
          <div class="relative rounded-lg shadow-sm w-full">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <LocationMarkerIcon class="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              name="contact-address"
              id="contact-address"
              class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
              placeholder="333 Fire Dr. Kansas City, Kansas 11111"
              bind:value={$createContactRecord.workAddress}
            />
          </div>
        </div>
        <div class="flex flex-col gap-1 col-span-2">
          <label for="contact-bg-info" class="text-sm text-zinc-700/70"
            >Background Info</label
          >
          <textarea
            name="contact-bg-info"
            id="contact-bg-info"
            class="block rounded-lg border-0 p-2.5 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full resize-none"
            placeholder="Jane Doe likes eating apples..."
            rows="5"
            bind:value={$createContactRecord.backgroundInfo}
          />
        </div>
      </div>
      <h3
        class="text-lg text-zinc-700/90 font-semibold flex items-center gap-2"
      >
        Custom Fields
      </h3>
      <span class="text-sm text-zinc-700/70 italic">
        Custom fields are coming soon. Stay tuned!
      </span>
      <div class="flex items-center gap-4 mt-6">
        <button
          type="submit"
          class="bg-zinc-50 border border-zinc-400/20 rounded-lg shadow-sm w-fit p-3 hover:opacity-80 flex items-center gap-2"
        >
          {#if $addContactLoading}
            <SpinnerIcon class="w-4 h-4 animate-spin" />
          {/if}
          <span class="text-sm text-zinc-700/70 font-semibold">
            {isEdit ? "Update" : "Create"} Contact
          </span>
        </button>
        <button
          type="button"
          class="text-sm text-zinc-700/70 underline hover:opacity-80"
          on:click={close}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</Sheet>
