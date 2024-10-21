<script lang="ts">
  import { derived, writable } from "svelte/store";
  import Sheet from "../sheet/Sheet.svelte";
  import SpinnerIcon from "../icons/SpinnerIcon.svelte";
  import fetcher from "$lib/fetcher";
  import { selectedContact } from "$lib/store/contacts";
  import BookmarkIcon from "../icons/BookmarkIcon.svelte";
  import { onMount } from "svelte";

  const allGroups = writable<{ id: string; name: string }[]>([]);
  const selectedGroups = writable<string[]>([]);
  const allGroupsNotInContact = derived(
    [allGroups, selectedContact],
    ([$allGroups, $selectedContact]) => {
      if (!$selectedContact) return $allGroups;
      return $allGroups.filter(
        (group) =>
          !$selectedContact.groups.find(
            (contactGroup) => contactGroup.id === group.id
          )
      );
    }
  );
  export let open = false;
  export let close = () => {};

  const addGroupsLoading = writable(false);
  const loadingAllGroups = writable(false);

  async function getAllGroups() {
    loadingAllGroups.set(true);
    try {
      const groups = await fetcher<{ id: string; name: string }[]>("/groups", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      allGroups.set(groups);
      loadingAllGroups.set(false);
    } catch (error) {
      loadingAllGroups.set(false);
      console.error(error);
    }
  }

  onMount(() => {
    getAllGroups();
  });

  async function addGroups() {
    addGroupsLoading.set(true);
    try {
      const updatedContact = await fetcher<Contact>(
        `/contacts/${$selectedContact?.id}/groups`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupIds: $selectedGroups }),
        }
      );
      addGroupsLoading.set(false);
      selectedContact.set(updatedContact);
      close();
    } catch (error) {
      addGroupsLoading.set(false);
      console.error(error);
    }
  }
</script>

<Sheet {close} {open}>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <div
        class="p-2 bg-blue-500/30 text-blue-700 flex items-center justify-center rounded-full w-10 h-10"
      >
        <BookmarkIcon class="w-4 h-4" />
      </div>
      <span class="text-2xl font-bold">
        Attach a group to {$selectedContact?.firstName}
      </span>
    </div>
    <hr class="border-zinc-400/20" />
    <form class="grid gap-4" on:submit|preventDefault={addGroups}>
      <div class="flex flex-col gap-3">
        <h3 class="text-lg text-zinc-700 font-semibold">
          Select from Existing Groups
        </h3>
        <div class="grid grid-cols-4 gap-3">
          {#if $loadingAllGroups}
            <div class="col-span-4 flex items-center justify-center">
              <SpinnerIcon class="w-6 h-6 animate-spin" />
            </div>
          {:else}
            {#each $allGroupsNotInContact as group}
              <div class="flex items-center gap-2">
                <input
                  id={`group-${group.id}`}
                  name="groups"
                  type="checkbox"
                  aria-describedby="select all contacts"
                  class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  on:change={() => {
                    if ($selectedGroups.includes(group.id)) {
                      selectedGroups.update((groups) =>
                        groups.filter((id) => id !== group.id)
                      );
                    } else {
                      selectedGroups.update((groups) => [...groups, group.id]);
                    }
                  }}
                />
                <span class="text-zinc-700 text-sm"> {group.name} </span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
      <div class="flex items-center gap-4 mt-6">
        <button
          type="submit"
          class="bg-zinc-50 border border-zinc-400/20 rounded-lg shadow-sm w-fit p-3 hover:opacity-80 flex items-center gap-2 disabled:opacity-50"
          disabled={$addGroupsLoading || $selectedGroups.length === 0}
        >
          {#if $addGroupsLoading}
            <SpinnerIcon class="w-4 h-4 animate-spin" />
          {/if}
          <span class="text-sm text-zinc-700/70 font-semibold">
            Attach Groups
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
