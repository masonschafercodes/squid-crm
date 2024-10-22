<script lang="ts">
    import type { PageData } from "./$types";
    import { AppContainer, fetcher } from "$lib";
    import RightArrowIcon from "$lib/components/icons/RightArrowIcon.svelte";
    import { userStore } from "$lib/store/user";
    import EditIcon from "$lib/components/icons/EditIcon.svelte";
    import PrintIcon from "$lib/components/icons/PrintIcon.svelte";
    import TrashIcon from "$lib/components/icons/TrashIcon.svelte";
    import ActionIcon from "$lib/components/icons/ActionIcon.svelte";
    import SpinnerIcon from "$lib/components/icons/SpinnerIcon.svelte";
    import EmailIcon from "$lib/components/icons/EmailIcon.svelte";
    import PhoneIcon from "$lib/components/icons/PhoneIcon.svelte";
    import ContactInfoDetail from "$lib/components/contact-info-detail/ContactInfoDetail.svelte";
    import { writable } from "svelte/store";
    import ContactSheet from "$lib/components/contact-sheet/ContactSheet.svelte";
    import { selectedContact } from "$lib/store/contacts";
    import PlusIcon from "$lib/components/icons/PlusIcon.svelte";
    import UpdateIcon from "$lib/components/icons/UpdateIcon.svelte";
    import NoteIcon from "$lib/components/icons/NoteIcon.svelte";
    import CheckIcon from "$lib/components/icons/CheckIcon.svelte";
    import ButtonDropdown from "$lib/components/button/ButtonDropdown.svelte";
    import DropdownIcon from "$lib/components/icons/DropdownIcon.svelte";
    import TasksIcon from "$lib/components/icons/TasksIcon.svelte";
    import BookmarkIcon from "$lib/components/icons/BookmarkIcon.svelte";
    import TaskSheet from "$lib/components/task-sheet/TaskSheet.svelte";
    import XIcon from "$lib/components/icons/XIcon.svelte";
    import AddContactGroupSheet from "$lib/components/add-group-sheet/AddContactGroupSheet.svelte";
    import { flip } from "svelte/animate";

    export let data: PageData;
    const note = writable("");

    $: selectedContact.set(data.contact);

    const addContactSheetOpen = writable(false);
    const addTaskSheetOpen = writable(false);
    const addGroupsSheetOpen = writable(false);
    const addingNote = writable(false);
    const dropdownOpen = writable(false);

    async function addNote() {
        if ($note && $note.length > 0) {
            addingNote.set(true);
            try {
                const newContactData = await fetcher<Contact>(
                    `/contacts/${$selectedContact?.id}/notes`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ note: $note }),
                    }
                );

                if (newContactData) {
                    $note = "";
                    selectedContact.set(newContactData);
                    addingNote.set(false);
                }
            } catch (error) {
                console.error(error);
                addingNote.set(false);
            }
        }
    }

    async function updateTaskStatus(
        taskId: string,
        status: "DONE" | "PENDING"
    ) {
        try {
            const newContactData = await fetcher<Contact>(
                `/contacts/${$selectedContact?.id}/tasks/${taskId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ status }),
                }
            );

            if (newContactData) {
                selectedContact.set(newContactData);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteGroup(groupId: string) {
        try {
            const newContactData = await fetcher<Contact>(
                `/contacts/${$selectedContact?.id}/groups/${groupId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                    credentials: "include",
                }
            );

            if (newContactData) {
                selectedContact.set(newContactData);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function getAge(birthday: string) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
</script>

<head>
    <title
        >Contact View | {$selectedContact?.salutation}
        {$selectedContact?.firstName}
        {$selectedContact?.lastName}
        {$selectedContact?.suffix}</title
    >
</head>

{#if $selectedContact}
    <ContactSheet
        open={$addContactSheetOpen}
        close={() => addContactSheetOpen.set(false)}
        defaultContact={$selectedContact}
        isEdit
    />
    <TaskSheet
        open={$addTaskSheetOpen}
        close={() => addTaskSheetOpen.set(false)}
        contactId={$selectedContact.id}
    />
    <AddContactGroupSheet
        open={$addGroupsSheetOpen}
        close={() => addGroupsSheetOpen.set(false)}
    />
{/if}
<AppContainer email={$userStore?.email} title="Contact View">
    <div class="flex item-center gap-2 h-fit">
        <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
        <span class="text-sm text-zinc-700 flex items-center">
            <RightArrowIcon class="w-4 h-4" />
        </span>
        <a href="/app/contacts" class="text-sm text-zinc-700 hover:underline"
            >Contacts</a
        >
        <span class="text-sm text-zinc-700 flex items-center">
            <RightArrowIcon class="w-4 h-4" />
        </span>
        <a
            href="/app/contacts"
            class="text-sm text-blue-500 font-semibold flex items-center justify-center"
            >Contact View (
            {#if $selectedContact}
                {$selectedContact.salutation}
                {$selectedContact.firstName}
                {$selectedContact.lastName}
                {$selectedContact.suffix}
            {:else}
                <SpinnerIcon class="w-4 h-4 text-blue-500 animate-spin" />
            {/if}
            )</a
        >
    </div>
    {#if $selectedContact}
        <div class="flex gap-12 h-full mt-4 relative overflow-hidden">
            <div
                class="w-[15%] h-full overflow-hidden hidden xl:flex flex-col gap-3"
            >
                <!-- contacts sidebar -->
                <div
                    class="w-full divide-y-[1px] divide-zinc-400/20 rounded-lg border border-zinc-400/20 flex flex-col bg-white shadow-sm"
                >
                    <div
                        class="bg-zinc-50 flex items-center justify-between rounded-t-lg p-3"
                    >
                        <span class="text-sm text-zinc-700/90 font-semibold"
                            >Actions</span
                        >
                        <ActionIcon class="w-4 h-4 text-zinc-700/70" />
                    </div>
                    <button
                        class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                        on:click={() => addContactSheetOpen.set(true)}
                    >
                        <span class="text-sm text-zinc-700/90"
                            >Edit Contact</span
                        >
                        <EditIcon class="w-4 h-4 text-zinc-700/60" />
                    </button>
                    <button
                        class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                    >
                        <span class="text-sm text-zinc-700/90">Print</span>
                        <PrintIcon class="w-4 h-4 text-zinc-700/60" />
                    </button>
                    <button
                        class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                    >
                        <span class="text-sm text-zinc-700/90">Delete</span>
                        <TrashIcon class="w-4 h-4 text-zinc-700/60" />
                    </button>
                </div>
            </div>
            <div class="flex-1 h-full flex flex-col gap-3 overflow-y-auto px-1">
                <div class="flex items-center gap-4">
                    <div
                        class="p-2 bg-blue-500/30 text-blue-700 flex items-center justify-center rounded-full w-20 h-20 whitespace-nowrap font-semibold"
                    >
                        <span class="text-3xl">
                            {`${$selectedContact?.firstName.charAt(0)}${$selectedContact?.lastName.charAt(0)}`}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <h1 class="text-2xl text-zinc-700 font-semibold">
                            {$selectedContact?.salutation}
                            {$selectedContact?.firstName}
                            {$selectedContact?.lastName}
                            {$selectedContact?.suffix}
                        </h1>
                        <div class="flex flex-col gap-1">
                            <span
                                class="text-sm text-zinc-700/70 font-semibold"
                            >
                                {$selectedContact?.jobTitle}
                            </span>
                            <div class="flex items-center gap-6">
                                {#if $selectedContact?.workEmail || $selectedContact?.personalEmail}
                                    <div class="flex items-center gap-1">
                                        <EmailIcon
                                            class="w-4 h-4 text-blue-500"
                                        />
                                        <span
                                            class="text-sm text-blue-500 font-semibold"
                                        >
                                            {$selectedContact?.workEmail ||
                                                $selectedContact?.personalEmail}
                                        </span>
                                    </div>
                                {/if}
                                {#if $selectedContact?.workPhone || $selectedContact?.personalPhone}
                                    <div class="flex items-center gap-1">
                                        <PhoneIcon
                                            class="w-4 h-4 text-blue-500"
                                        />
                                        <span
                                            class="text-sm text-blue-500 font-semibold"
                                        >
                                            {$selectedContact?.workPhone ||
                                                $selectedContact?.personalPhone}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3 mt-3 overflow-hidden">
                    <div
                        class="flex flex-col gap-8 w-full h-full overflow-y-auto px-1"
                    >
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center justify-between">
                                <span
                                    class="text-sm text-zinc-700/70 font-semibold"
                                >
                                    Attached Items
                                </span>
                                <ButtonDropdown
                                    showDrowdown={dropdownOpen}
                                    w="w-[200px]"
                                >
                                    <DropdownIcon
                                        class="w-5 h-5 transition-all {$dropdownOpen &&
                                            'rotate-180'} duration-300"
                                        slot="icon"
                                    />
                                    <span slot="button_text"
                                        >Attach an Item</span
                                    >
                                    <div
                                        class="flex flex-col divide-y-[1px] divide-zinc-400/20"
                                        slot="dropdown_content"
                                    >
                                        <button
                                            class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                                            on:click={() => {
                                                addTaskSheetOpen.set(true);
                                                dropdownOpen.set(false);
                                            }}
                                        >
                                            <span
                                                class="text-sm text-zinc-700/90 font-semibold"
                                                >Task</span
                                            >
                                            <TasksIcon
                                                class="w-4 h-4 text-zinc-700/60"
                                            />
                                        </button>
                                        <button
                                            class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                                            on:click={() => {
                                                addGroupsSheetOpen.set(true);
                                                dropdownOpen.set(false);
                                            }}
                                        >
                                            <span
                                                class="text-sm text-zinc-700/90 font-semibold"
                                                >Group</span
                                            >
                                            <BookmarkIcon
                                                class="w-4 h-4 text-zinc-700/60"
                                            />
                                        </button>
                                    </div>
                                </ButtonDropdown>
                            </div>
                            <div
                                class="bg-white border border-zinc-400/20 shadow-sm rounded-lg flex flex-col divide-y-[1px] divide-zinc-400/20"
                            >
                                <div class="p-3 flex items-start gap-4">
                                    <div
                                        class="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center p-1"
                                    >
                                        <CheckIcon
                                            class="w-4 h-4 text-teal-800"
                                        />
                                    </div>
                                    <div
                                        class="flex flex-col gap-2 w-full mt-1.5"
                                    >
                                        <span
                                            class="text-sm text-zinc-700 font-semibold whitespace-nowrap"
                                        >
                                            Upcoming Tasks ({$selectedContact
                                                .tasks.length})
                                        </span>
                                        {#each $selectedContact.tasks as task (task.id)}
                                            <div
                                                class="p-3 bg-zinc-50 border border-zinc-300/30 rounded-lg text-sm shadow-sm text-zinc-800/80 flex gap-3 w-full"
                                                animate:flip={{ duration: 300 }}
                                            >
                                                <input
                                                    id="select-all"
                                                    name="select-all"
                                                    type="checkbox"
                                                    checked={task.status ===
                                                        "DONE"}
                                                    on:change={() =>
                                                        updateTaskStatus(
                                                            task.id,
                                                            task.status ===
                                                                "DONE"
                                                                ? "PENDING"
                                                                : "DONE"
                                                        )}
                                                    aria-describedby="select all contacts"
                                                    class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                                />
                                                <div
                                                    class="flex flex-col gap-2"
                                                >
                                                    <span
                                                        class="text-sm font-semibold {task.status ===
                                                        'DONE'
                                                            ? 'line-through text-zinc-700/50'
                                                            : 'text-zinc-700/70'}"
                                                    >
                                                        {task.name}
                                                    </span>
                                                    <span
                                                        class="text-sm text-zinc-700/70"
                                                    >
                                                        Due {new Date(
                                                            task.dueAt
                                                        ).toLocaleDateString()} @
                                                        {new Date(
                                                            task.dueAt
                                                        ).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                                <div class="p-3 flex items-start gap-4">
                                    <div
                                        class="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center p-1"
                                    >
                                        <BookmarkIcon
                                            class="w-4 h-4 text-orange-800"
                                        />
                                    </div>
                                    <div
                                        class="flex flex-col gap-2 w-full mt-1.5"
                                    >
                                        <span
                                            class="text-sm text-zinc-700 font-semibold whitespace-nowrap"
                                        >
                                            Groups ({$selectedContact.groups
                                                .length})
                                        </span>
                                        <div class="grid grid-cols-5 gap-2">
                                            {#each $selectedContact.groups as group (group.id)}
                                                <div
                                                    class="py-1 px-2 bg-zinc-50 border border-zinc-300/30 rounded-lg text-sm shadow-sm text-zinc-800/80 flex items-center justify-between w-full"
                                                    animate:flip={{
                                                        duration: 300,
                                                    }}
                                                >
                                                    {group.name}
                                                    <button
                                                        type="button"
                                                        class="p-1.5 rounded-lg bg-transparent hover:bg-red-400/20 transition-colors w-8 h-8 flex items-center justify-center"
                                                        on:click={() =>
                                                            deleteGroup(
                                                                group.id
                                                            )}
                                                    >
                                                        <XIcon
                                                            class="w-4 h-4 text-red-500 "
                                                        />
                                                    </button>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span
                                class="text-sm text-zinc-700/70 font-semibold"
                            >
                                History
                            </span>
                            <div
                                class="bg-white border border-zinc-400/20 shadow-sm rounded-lg flex flex-col divide-y-[1px] divide-zinc-400/20"
                            >
                                <form
                                    class="p-3 relative"
                                    on:submit|preventDefault={addNote}
                                >
                                    <textarea
                                        class="w-full h-20 bg-transparent resize-none outline-none text-sm text-zinc-700/70"
                                        placeholder="Add a note..."
                                        rows="3"
                                        bind:value={$note}
                                    />
                                    <button
                                        type="submit"
                                        class="flex items-center gap-2 absolute bottom-3 right-3 bg-blue-500/20 text-blue-500 font-semibold px-3 py-1 rounded-lg hover:opacity-70 transition-opacity disabled:opacity-50"
                                        disabled={!$note || $note.length === 0}
                                    >
                                        {#if $addingNote}
                                            <SpinnerIcon
                                                class="w-4 h-4 text-blue-500 animate-spin"
                                            />
                                        {/if}
                                        <span
                                            class="text-sm text-blue-500 font-semibold"
                                        >
                                            Add Note
                                        </span>
                                    </button>
                                </form>
                                {#if $selectedContact.historyEvents && $selectedContact.historyEvents.length > 0}
                                    {#each $selectedContact.historyEvents as event (event.id)}
                                        <div
                                            class="flex flex-col divide-y-[1px] divide-zinc-400/20"
                                            animate:flip={{ duration: 300 }}
                                        >
                                            {#if event.type === "CREATED"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-center justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <PlusIcon
                                                                class="w-4 h-4 text-orange-800"
                                                            />
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70 flex-1"
                                                        >
                                                            {$selectedContact.firstName}
                                                            was added to the CRM
                                                        </span>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {:else if event.type === "UPDATED"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-center justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <UpdateIcon
                                                                class="w-4 h-4 text-green-800"
                                                            />
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70 flex-1"
                                                        >
                                                            {$selectedContact.firstName}
                                                            was updated
                                                        </span>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {:else if event.type === "NOTE"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-start justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <NoteIcon
                                                                class="w-4 h-4 text-blue-800"
                                                            />
                                                        </div>
                                                        <div
                                                            class="flex flex-col gap-2 flex-1"
                                                        >
                                                            <span
                                                                class="text-sm text-zinc-700/70 flex-1"
                                                            >
                                                                A note was added
                                                                to {$selectedContact.firstName}
                                                            </span>
                                                            <div
                                                                class="p-3 bg-zinc-50 border border-zinc-300/30 rounded-lg text-sm shadow-sm text-zinc-800/80"
                                                            >
                                                                {event.note}
                                                            </div>
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {:else if event.type === "TASK_UPDATED"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-start justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <CheckIcon
                                                                class="w-4 h-4 text-teal-800"
                                                            />
                                                        </div>
                                                        <div
                                                            class="flex flex-col gap-2 flex-1"
                                                        >
                                                            <span
                                                                class="text-sm text-zinc-700/70 flex-1"
                                                            >
                                                                A task was
                                                                updated for {$selectedContact.firstName}
                                                            </span>
                                                            <div
                                                                class="p-3 bg-zinc-50 border border-zinc-300/30 rounded-lg text-sm shadow-sm text-zinc-800/80"
                                                            >
                                                                {event.note}
                                                            </div>
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {:else if event.type === "TASK_CREATED"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-center justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <TasksIcon
                                                                class="w-4 h-4 text-amber-800"
                                                            />
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70 flex-1"
                                                        >
                                                            A new task was
                                                            created for {$selectedContact.firstName}
                                                        </span>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {:else if event.type === "GROUPS_ADDED"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-start justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <BookmarkIcon
                                                                class="w-4 h-4 text-amber-800"
                                                            />
                                                        </div>
                                                        <div
                                                            class="flex flex-col gap-2 flex-1"
                                                        >
                                                            <span
                                                                class="text-sm text-zinc-700/70 flex-1"
                                                            >
                                                                Groups were
                                                                added to {$selectedContact.firstName}
                                                            </span>
                                                            <div
                                                                class="p-3 bg-zinc-50 border border-zinc-300/30 rounded-lg text-sm shadow-sm text-zinc-800/80"
                                                            >
                                                                {event.note}
                                                            </div>
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {:else if event.type === "GROUP_REMOVED"}
                                                <div
                                                    class="flex flex-col gap-2 p-3"
                                                >
                                                    <span
                                                        class="text-sm text-zinc-700/70 font-semibold"
                                                    >
                                                        {new Date(
                                                            event.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <div
                                                        class="flex items-start justify-between gap-3"
                                                    >
                                                        <div
                                                            class="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center p-1"
                                                        >
                                                            <BookmarkIcon
                                                                class="w-4 h-4 text-amber-800"
                                                            />
                                                        </div>
                                                        <div
                                                            class="flex flex-col gap-2 flex-1"
                                                        >
                                                            <span
                                                                class="text-sm text-zinc-700/70 flex-1"
                                                            >
                                                                A group was
                                                                removed from {$selectedContact.firstName}
                                                            </span>
                                                            <div
                                                                class="p-3 bg-zinc-50 border border-zinc-300/30 rounded-lg text-sm shadow-sm text-zinc-800/80"
                                                            >
                                                                {event.note}
                                                            </div>
                                                        </div>
                                                        <span
                                                            class="text-sm text-zinc-700/70"
                                                        >
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                    {/each}
                                {:else}
                                    <div class="p-3">
                                        <span class="text-sm text-zinc-700/70">
                                            No history events
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 w-1/2">
                        <span class="text-sm text-zinc-700/70 font-semibold">
                            Contact Info
                        </span>
                        <div
                            class="p-4 bg-white border border-zinc-400/20 shadow-sm rounded-lg flex flex-col gap-3"
                        >
                            <ContactInfoDetail
                                label="Name"
                                value={`${$selectedContact?.salutation} ${$selectedContact?.firstName} ${$selectedContact?.lastName} ${$selectedContact?.suffix}`}
                            />
                            <ContactInfoDetail
                                label="Job Title"
                                value={$selectedContact?.jobTitle || "N/A"}
                            />
                            <ContactInfoDetail
                                label="Work Email"
                                value={$selectedContact?.workEmail || "N/A"}
                            />
                            <ContactInfoDetail
                                label="Personal Email"
                                value={$selectedContact?.personalEmail || "N/A"}
                            />
                            <ContactInfoDetail
                                label="Work Phone"
                                value={$selectedContact?.workPhone || "N/A"}
                            />
                            <ContactInfoDetail
                                label="Personal Phone"
                                value={$selectedContact?.personalPhone || "N/A"}
                            />
                            <ContactInfoDetail
                                label="Personal Address"
                                value={$selectedContact?.personalAddress ||
                                    "N/A"}
                            />
                            <ContactInfoDetail
                                label="Work Address"
                                value={$selectedContact?.workAddress || "N/A"}
                            />
                            <ContactInfoDetail
                                label="Birthday"
                                value={$selectedContact?.birthday
                                    ? `${new Date($selectedContact?.birthday).toLocaleDateString()} - ${getAge($selectedContact?.birthday)} years old`
                                    : "N/A"}
                            />
                            <ContactInfoDetail
                                label="Background Info"
                                value={$selectedContact?.backgroundInfo ||
                                    "N/A"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="flex items-center justify-center h-full">
            <SpinnerIcon class="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    {/if}
</AppContainer>
