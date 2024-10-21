<script lang="ts">
    import { goto } from "$app/navigation";
    import fetcher from "$lib/fetcher";
    import { userStore } from "$lib/store/user";
    import { writable } from "svelte/store";
    import ButtonDropdown from "../button/ButtonDropdown.svelte";
    import DropdownIcon from "../icons/DropdownIcon.svelte";
    import XIcon from "../icons/XIcon.svelte";
    import UserIcon from "../icons/UserIcon.svelte";
    import LogoutIcon from "../icons/LogoutIcon.svelte";

    export let title: string = "Dashboard";
    let dropdownOpen = writable(false);
    export let email: string = "";

    async function logout() {
        try {
            const data = await fetcher("/users/logout", {
                method: "DELETE",
                credentials: "include",
            });

            if (data) {
                userStore.set(null);
                goto("/");
            }
        } catch (error) {
            console.error(error);
        }
    }
</script>

<div class="flex-1 flex flex-col w-full">
    <div
        class="bg-white border-b border-b-zinc-200/30 py-[19px] px-12 shadow-sm flex items-center justify-between"
    >
        <h1 class="text-lg font-semibold text-zinc-800">{title}</h1>
        {#if email && email !== ""}
            <ButtonDropdown showDrowdown={dropdownOpen} w="w-[200px]">
                <DropdownIcon
                    class="w-5 h-5 transition-all {$dropdownOpen &&
                        'rotate-180'} duration-300"
                    slot="icon"
                />
                <span slot="button_text">{email}</span>
                <div
                    class="flex flex-col divide-y-[1px] divide-zinc-400/20"
                    slot="dropdown_content"
                >
                    <button
                        class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                        on:click={() => goto("/app/profile")}
                    >
                        <span class="text-sm text-zinc-700/90 font-semibold"
                            >Profile</span
                        >
                        <UserIcon class="w-4 h-4 text-zinc-700/60" />
                    </button>
                    <button
                        on:click={logout}
                        class="p-3 flex items-center justify-between hover:bg-zinc-100/40"
                    >
                        <span class="text-sm text-zinc-700/90 font-semibold">
                            Logout
                        </span>
                        <LogoutIcon class="w-4 h-4 text-zinc-700/60" />
                    </button>
                </div>
            </ButtonDropdown>
        {/if}
    </div>
    <div
        class="flex-1 overflow-y-auto py-4 px-12 bg-zinc-200/20 flex flex-col gap-2"
    >
        <slot />
    </div>
</div>
