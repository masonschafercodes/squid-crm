<script lang="ts">
    import { derived, writable } from "svelte/store";
    import Sheet from "../sheet/Sheet.svelte";
    import SpinnerIcon from "../icons/SpinnerIcon.svelte";
    import fetcher from "$lib/fetcher";
    import { selectedContact } from "$lib/store/contacts";
    import BookmarkIcon from "../icons/BookmarkIcon.svelte";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import { flip } from "svelte/animate";

    const allGroups = writable<{ id: string; name: string }[]>([]);
    const selectedGroups = writable<string[]>([]);
    const newGroupName = writable<string>("");
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
    const createGroupLoading = writable(false);

    async function getAllGroups() {
        loadingAllGroups.set(true);
        try {
            const groups = await fetcher<{ id: string; name: string }[]>(
                "/groups",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

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

    async function createGroup() {
        createGroupLoading.set(true);
        try {
            const newGroup = await fetcher<{ id: string; name: string }>(
                "/groups",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: $newGroupName }),
                }
            );
            allGroups.update((groups) => [...groups, newGroup]);
            createGroupLoading.set(false);
            newGroupName.set("");
        } catch (error) {
            createGroupLoading.set(false);
            console.error(error);
        }
    }
</script>

<Sheet {close} {open}>
    <div class="flex flex-col gap-6">
        <div class="flex items-center gap-3">
            <div
                class="p-2 bg-amber-500/30 text-amber-700 flex items-center justify-center rounded-full w-10 h-10"
            >
                <BookmarkIcon class="w-4 h-4" />
            </div>
            <span class="text-2xl font-bold">
                Attach a group to {$selectedContact?.firstName}
            </span>
        </div>
        <hr class="border-zinc-400/20" />
        <form class="grid gap-4" on:submit|preventDefault={addGroups}>
            <div class="flex flex-col gap-6">
                <h3 class="text-lg text-zinc-700 font-semibold">
                    Select from Existing Groups
                </h3>
                <div class="grid grid-cols-4 gap-3">
                    {#if $loadingAllGroups}
                        <div
                            class="col-span-4 flex items-center justify-center"
                        >
                            <SpinnerIcon class="w-6 h-6 animate-spin" />
                        </div>
                    {:else}
                        {#each $allGroupsNotInContact as group (group.id)}
                            <div
                                class="flex items-center gap-2"
                                animate:flip={{ duration: 300 }}
                                transition:fade={{ duration: 300 }}
                            >
                                <input
                                    id={`group-${group.id}`}
                                    name="groups"
                                    type="checkbox"
                                    aria-describedby="select all contacts"
                                    class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                    on:change={() => {
                                        if (
                                            $selectedGroups.includes(group.id)
                                        ) {
                                            selectedGroups.update((groups) =>
                                                groups.filter(
                                                    (id) => id !== group.id
                                                )
                                            );
                                        } else {
                                            selectedGroups.update((groups) => [
                                                ...groups,
                                                group.id,
                                            ]);
                                        }
                                    }}
                                />
                                <span class="text-zinc-700 text-sm">
                                    {group.name}
                                </span>
                            </div>
                        {/each}
                    {/if}
                </div>
                <hr class="border-zinc-400/20" />
                {#if $selectedGroups.length === 0}
                    <form
                        class="flex flex-col gap-2"
                        transition:slide={{ duration: 300 }}
                        on:submit|preventDefault={createGroup}
                    >
                        <h3 class="text-lg text-zinc-700 font-semibold">
                            Create a new group
                        </h3>
                        <div class="flex flex-col gap-1">
                            <label
                                for="group-name"
                                class="text-sm text-zinc-700/70 flex items-center justify-between"
                            >
                                Group Name
                            </label>
                            <div class="relative rounded-lg shadow-sm w-full">
                                <div
                                    class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                                >
                                    {#if $createGroupLoading}
                                        <SpinnerIcon
                                            class="h-5 w-5 text-zinc-400 animate-spin"
                                        />
                                    {:else}
                                        <BookmarkIcon
                                            class="h-5 w-5 text-zinc-400"
                                        />
                                    {/if}
                                </div>
                                <input
                                    type="text"
                                    required
                                    name="group-name"
                                    id="group-name"
                                    class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
                                    placeholder="New Group Name"
                                    bind:value={$newGroupName}
                                    disabled={$createGroupLoading}
                                />
                            </div>
                        </div>
                        <button
                            class="underline text-sm text-zinc-700/70 hover:text-zinc-700 font-semibold mt-3 mr-3 self-end transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-zinc-700/70"
                            type="submit"
                            disabled={!$newGroupName ||
                                $newGroupName === "" ||
                                $addGroupsLoading ||
                                $selectedGroups.length > 0 ||
                                $createGroupLoading}
                        >
                            + Create New Group
                        </button>
                    </form>
                {/if}
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
