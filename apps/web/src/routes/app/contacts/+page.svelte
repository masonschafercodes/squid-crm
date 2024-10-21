<script lang="ts">
  import { AppContainer, fetcher } from "$lib";
  import EmailIcon from "$lib/components/icons/EmailIcon.svelte";
  import PhoneIcon from "$lib/components/icons/PhoneIcon.svelte";
  import PlusIcon from "$lib/components/icons/PlusIcon.svelte";
  import RightArrowIcon from "$lib/components/icons/RightArrowIcon.svelte";
  import { contacts } from "$lib/store/contacts";
  import { userStore } from "$lib/store/user";
  import { writable } from "svelte/store";
  import type { PageData } from "./$types";
  import SearchIcon from "$lib/components/icons/SearchIcon.svelte";
  import DownloadIcon from "$lib/components/icons/DownloadIcon.svelte";
  import PrintIcon from "$lib/components/icons/PrintIcon.svelte";
  import SortIcon from "$lib/components/icons/SortIcon.svelte";
  import { fly } from "svelte/transition";
  import ActionIcon from "$lib/components/icons/ActionIcon.svelte";
  import ContactSheet from "$lib/components/contact-sheet/ContactSheet.svelte";

  export let data: PageData;
  const selectedContacts = writable<string[]>([]);
  const addContactSheetOpen = writable(false);

  const allSelected = writable(false);

  allSelected.subscribe((isAllSelected) => {
    if (isAllSelected) {
      selectedContacts.update((oldSelected) => {
        let newSelected: string[] = [...oldSelected];
        $contacts.forEach((contact) => {
          if (!oldSelected.includes(contact.id)) {
            newSelected.push(contact.id);
          }
        });

        return newSelected;
      });
    } else {
      selectedContacts.update(() => {
        return [];
      });
    }
  });

  $: contacts.set(data.contacts || []);
</script>

<head>
  <title>Contacts</title>
</head>

<ContactSheet
  open={$addContactSheetOpen}
  close={() => addContactSheetOpen.set(false)}
/>
<AppContainer email={$userStore?.email} title="Contacts">
  <div class="flex item-center gap-2 h-fit">
    <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
    <span class="text-sm text-zinc-700 flex items-center">
      <RightArrowIcon class="w-4 h-4" />
    </span>
    <a href="/app/contacts" class="text-sm text-blue-500 font-semibold"
      >Contacts</a
    >
  </div>
  <div class="flex gap-3 h-full mt-4 relative overflow-hidden">
    <div class="w-[15%] h-full overflow-hidden hidden xl:flex flex-col gap-3">
      <!-- contacts sidebar -->
      <div
        class="w-full divide-y-[1px] divide-zinc-400/20 rounded-lg border border-zinc-400/20 flex flex-col bg-white shadow-sm"
      >
        <div
          class="bg-zinc-50 flex items-center justify-between rounded-t-lg p-3"
        >
          <span class="text-sm text-zinc-700/90 font-semibold">Actions</span>
          <ActionIcon class="w-4 h-4 text-zinc-700/70" />
        </div>
        <button
          class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
        >
          <span class="text-sm text-zinc-700/90 font-semibold">Download</span>
          <DownloadIcon class="w-4 h-4 text-zinc-700/60" />
        </button>
        <button
          class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
        >
          <span class="text-sm text-zinc-700/90 font-semibold">Print</span>
          <PrintIcon class="w-4 h-4 text-zinc-700/60" />
        </button>
      </div>
      <div
        class="w-full divide-y-[1px] divide-zinc-400/20 rounded-lg border border-zinc-400/20 flex flex-col bg-white shadow-sm"
      >
        <div
          class="bg-zinc-50 flex items-center justify-between rounded-t-lg p-3"
        >
          <span class="text-sm text-zinc-700/90 font-semibold"
            >Sort and Filter</span
          >
          <SortIcon class="w-4 h-4 text-zinc-700/70" />
        </div>
        <button class="p-3 flex flex-col gap-1 hover:bg-zinc-100/40">
          <span class="text-sm text-zinc-700/80 font-semibold">Sort</span>
          <span class="text-sm text-zinc-700/60">First name (A-Z)</span>
        </button>
        <button class="p-3 flex flex-col gap-1 hover:bg-zinc-100/40">
          <span class="text-sm text-zinc-700/80 font-semibold">Record Type</span
          >
          <span class="text-sm text-zinc-700/60 text-left"
            >Contacts and Companies</span
          >
        </button>
        <button
          class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
        >
          <span class="text-sm text-zinc-700/80 font-semibold"
            >Add a filter</span
          >
          <PlusIcon class="w-4 h-4 text-zinc-700/60" />
        </button>
      </div>
    </div>
    <div class="flex-1 h-full flex flex-col gap-3 overflow-y-auto px-1">
      <div class="flex items-center justify-between gap-2">
        <div class="relative rounded-lg shadow-sm flex-1 w-full">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <SearchIcon class="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            name="contact-search"
            id="contact-search"
            class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
            placeholder="Search for name, email, phone number, etc."
          />
        </div>
        <button
          type="button"
          class="bg-white border border-zinc-400/20 rounded-lg shadow-sm w-fit self-end p-3 flex items-center gap-2 hover:opacity-80"
          on:click={() => addContactSheetOpen.set(true)}
        >
          <span class="text-sm text-zinc-700/90 font-semibold">
            Add Contact
          </span>
          <PlusIcon class="w-3 h-3" />
        </button>
      </div>
      <div
        class="w-full divide-y-[1px] divide-zinc-400/20 rounded-lg border border-zinc-400/20 flex flex-col bg-white shadow-sm relative"
      >
        <div
          class="bg-zinc-50 flex items-center justify-between p-3 rounded-t-lg sticky top-0 z-10"
        >
          <div class="flex items-center gap-2">
            <input
              id="select-all"
              name="select-all"
              type="checkbox"
              aria-describedby="select all contacts"
              class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              on:change={() => allSelected.set(!$allSelected)}
              checked={$contacts &&
                $contacts.length === $selectedContacts.length &&
                $contacts.length > 0}
            />
            <span class="text-zinc-700 text-sm"> Select All </span>
          </div>
          <span class="text-zinc-700/70 text-sm">
            1 - {$contacts?.length} of {$contacts?.length} contacts
          </span>
        </div>
        {#if $contacts}
          {#each $contacts as contact}
            <div class="w-full flex items-center px-3 py-5 gap-6">
              <input
                id="select-contact"
                name="select-contact"
                type="checkbox"
                aria-describedby="select contact"
                class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                checked={$selectedContacts.includes(contact.id)}
                on:change={() => {
                  if ($selectedContacts.includes(contact.id)) {
                    selectedContacts.set(
                      $selectedContacts.filter(
                        (selectedContact) => selectedContact !== contact.id
                      )
                    );
                  } else {
                    selectedContacts.update((oldSelectedContacts) => [
                      ...oldSelectedContacts,
                      contact.id,
                    ]);
                  }
                }}
              />
              <div class="flex items-center gap-2 flex-1">
                <div
                  class="p-2 bg-blue-500/30 text-blue-700 flex items-center justify-center rounded-full w-10 h-10 whitespace-nowrap font-semibold"
                >
                  <span>
                    {`${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <a
                    href={`/app/contacts/${contact.id}`}
                    class="text-zinc-700 font-semibold hover:underline"
                  >
                    {contact?.salutation}
                    {contact?.firstName}
                    {contact?.lastName}
                    {contact?.suffix}
                  </a>
                  <span class="text-zinc-700 text-sm">
                    {#if contact.jobTitle}
                      {contact.jobTitle}
                    {/if}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1 w-1/2 lg:w-1/3 2xl:w-1/4">
                {#if contact.workEmail}
                  <div class="flex items-center gap-2">
                    <div class="flex items-center justify-center w-6 h-6">
                      <EmailIcon class="w-4 h-4 text-blue-500" />
                    </div>
                    <a
                      href={`mailto:${contact.workEmail}`}
                      class="text-sm whitespace-nowrap text-blue-500 hover:underline"
                    >
                      {contact.workEmail}
                    </a>
                  </div>
                {/if}
                {#if contact.workPhone}
                  <div class="flex items-center gap-2">
                    <div class="flex items-center justify-center w-6 h-6">
                      <PhoneIcon class="w-4 h-4 text-blue-500" />
                    </div>
                    <span class="text-zinc-700 text-sm whitespace-nowrap">
                      {contact.workPhone}
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</AppContainer>

{#if $selectedContacts.length > 0}
  <button
    class="px-6 py-2 bg-blue-500 hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center absolute bottom-6 left-1/2 transform -translate-x-1/2 shadow-md z-40 rounded-full text-zinc-50"
    transition:fly={{ duration: 500, y: 20 }}
  >
    Perform bulk action on {$selectedContacts.length} records
  </button>
{/if}
