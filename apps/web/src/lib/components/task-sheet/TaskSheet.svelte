<script lang="ts">
    import { writable } from "svelte/store";
    import Sheet from "../sheet/Sheet.svelte";
    import TasksIcon from "../icons/TasksIcon.svelte";
    import ItalicsIcon from "../icons/ItalicsIcon.svelte";
    import CalIcon from "../icons/CalIcon.svelte";
    import SpinnerIcon from "../icons/SpinnerIcon.svelte";
    import fetcher from "$lib/fetcher";
    import { contacts, selectedContact } from "$lib/store/contacts";

    export let contactId: string;
    export let open = false;
    export let close = () => {};
    export let isEdit = false;

    const addTaskLoading = writable(false);
    const createTaskRecord = writable<{
        name: string;
        dueAt: Date;
        description?: string;
    }>({
        name: "",
        dueAt: new Date(),
        description: "",
    });

    async function handleCreateTask() {
        addTaskLoading.set(true);
        try {
            const newContact = await fetcher<Contact>(
                `/contacts/${contactId}/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify($createTaskRecord),
                }
            );

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

            createTaskRecord.set({
                name: "",
                dueAt: new Date(),
                description: "",
            });
            selectedContact.set(newContact);
            close();
            addTaskLoading.set(false);
        } catch (e) {
            addTaskLoading.set(false);
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
                <TasksIcon class="w-4 h-4" />
            </div>
            <span class="text-2xl font-bold">
                {isEdit ? "Edit" : "Create"} Task
            </span>
        </div>
        <hr class="border-zinc-400/20" />
        <form class="grid gap-4" on:submit|preventDefault={handleCreateTask}>
            <div class="flex flex-col gap-1">
                <label
                    for="name"
                    class="text-sm text-zinc-700/70 flex items-center justify-between"
                >
                    Name
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
                        name="name"
                        id="name"
                        class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
                        placeholder="Task Name"
                        bind:value={$createTaskRecord.name}
                    />
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <label
                    for="due-at"
                    class="text-sm text-zinc-700/70 flex items-center justify-between"
                >
                    Due At
                    <span class="text-xs text-red-800 mr-2"> Required </span>
                </label>
                <div class="relative rounded-lg shadow-sm w-full">
                    <div
                        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                    >
                        <CalIcon class="h-5 w-5 text-zinc-400" />
                    </div>
                    <input
                        type="datetime-local"
                        required
                        name="due-at"
                        id="due-at"
                        class="block rounded-lg border-0 py-2.5 pl-10 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full"
                        placeholder="Due At"
                        bind:value={$createTaskRecord.dueAt}
                    />
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <label for="description" class="text-sm text-zinc-700/70"
                    >Description</label
                >
                <textarea
                    name="description"
                    id="description"
                    class="block rounded-lg border-0 p-2.5 text-zinc-800 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 w-full resize-none"
                    placeholder="task description..."
                    rows="5"
                    bind:value={$createTaskRecord.description}
                />
            </div>
            <div class="flex items-center gap-4 mt-6">
                <button
                    type="submit"
                    class="bg-zinc-50 border border-zinc-400/20 rounded-lg shadow-sm w-fit p-3 hover:opacity-80 flex items-center gap-2 disabled:opacity-50"
                    disabled={$addTaskLoading ||
                        !$createTaskRecord.name ||
                        !$createTaskRecord.dueAt ||
                        $createTaskRecord.name.length < 3}
                >
                    {#if $addTaskLoading}
                        <SpinnerIcon class="w-4 h-4 animate-spin" />
                    {/if}
                    <span class="text-sm text-zinc-700/70 font-semibold">
                        {isEdit ? "Update" : "Create"} Task
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

<style>
    input[type="datetime-local"]::-webkit-inner-spin-button,
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        opacity: 0;
    }
</style>
