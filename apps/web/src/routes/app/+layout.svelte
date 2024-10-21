<script lang="ts">
  import { goto } from "$app/navigation";
  import DashboardIcon from "$lib/components/icons/DashboardIcon.svelte";
  import HamburgerIcon from "$lib/components/icons/HamburgerIcon.svelte";
  import { userStore } from "$lib/store/user";
  import { onMount } from "svelte";
  import type { LayoutData } from "./$types";
  import MainIcon from "$lib/components/icons/MainIcon.svelte";
  import Toast from "$lib/components/toast/Toast.svelte";
  import SettingsIcon from "$lib/components/icons/SettingsIcon.svelte";
  import HelpIcon from "$lib/components/icons/HelpIcon.svelte";
  import ContactsIcon from "$lib/components/icons/ContactsIcon.svelte";
  import CompanyIcon from "$lib/components/icons/CompanyIcon.svelte";
  import ReportsIcon from "$lib/components/icons/ReportsIcon.svelte";

  export let data: LayoutData;
  let onlyIcons = false;

  const appRoutes = [
    {
      href: "/app/dashboard",
      label: "Dashboard",
      icon: DashboardIcon,
    },
    {
      href: "/app/contacts",
      label: "Contacts",
      icon: ContactsIcon,
    },
    {
      href: "/app/reports",
      label: "Reports",
      icon: ReportsIcon,
    },
  ];

  function loadIconOnlyModePreference() {
    const iconOnlyMode = localStorage.getItem("iconOnlyMode");
    if (iconOnlyMode) {
      onlyIcons = JSON.parse(iconOnlyMode);
    }
  }

  onMount(() => {
    if (!$userStore) {
      goto("/login");
    }

    loadIconOnlyModePreference();
  });
</script>

<div class="w-full h-full flex">
  <Toast />
  <div
    class="hidden {onlyIcons
      ? 'w-[73px]'
      : 'md:w-1/3 lg:w-1/3 xl:w-[14%]'} bg-white border-r border-r-zinc-200/30 md:flex flex-col divide-y-2 divide-zinc-200/30 right-shadow z-20 transition-all"
  >
    <div class="flex items-center justify-between p-4">
      <a
        href="/"
        class="h-10 w-10 {onlyIcons && 'hidden opacity-0'} whitespace-nowrap"
      >
        <MainIcon class="w-8 h-8 fill-blue-500" />
      </a>
      <button
        class="w-10 h-10 p-1 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center text-zinc-600 hover:text-zinc-500 hover:bg-zinc-50/90"
        on:click={() => {
          onlyIcons = !onlyIcons;
          localStorage.setItem("iconOnlyMode", JSON.stringify(onlyIcons));
        }}
      >
        <HamburgerIcon class="w-6 h-6" />
      </button>
    </div>
    <div class="flex flex-col gap-2 p-4 flex-1">
      {#each appRoutes as { href, label, icon }, i}
        <a
          {href}
          class="p-2 rounded-lg text-sm transition-colors flex items-center h-10 {onlyIcons &&
            'w-10 justify-center'} gap-2 {data.url.includes(href)
            ? 'text-blue-500 bg-blue-50/90'
            : 'text-zinc-600 hover:text-blue-500 hover:bg-blue-50/90'}"
        >
          <svelte:component this={icon} class="w-5 h-5" />
          <span class="{onlyIcons && 'hidden opacity-0'} whitespace-nowrap"
            >{label}</span
          >
        </a>
      {/each}
    </div>
    <div class="flex flex-col gap-2 p-4">
      <a
        href="/app/settings"
        class="p-2 rounded-lg text-sm transition-colors flex items-center h-10 {onlyIcons &&
          'w-10 justify-center'} gap-2 {data.url.includes('/app/settings')
          ? 'text-blue-500 bg-blue-50/90'
          : 'text-zinc-600 hover:text-blue-500 hover:bg-blue-50/90'}"
      >
        <SettingsIcon class="w-5 h-5" />
        <span class="{onlyIcons && 'hidden opacity-0'} whitespace-nowrap"
          >Settings</span
        >
      </a>
      <a
        href="/help"
        class="p-2 rounded-lg text-sm transition-colors flex items-center h-10 {onlyIcons &&
          'w-10 justify-center'} gap-2 {data.url.includes('/app/help')
          ? 'text-blue-500 bg-blue-50/90'
          : 'text-zinc-600 hover:text-blue-500 hover:bg-blue-50/90'}"
      >
        <HelpIcon class="w-5 h-5" />
        <span class="{onlyIcons && 'hidden opacity-0'} whitespace-nowrap"
          >Help</span
        >
      </a>
    </div>
  </div>
  <slot />
</div>

<style>
  .right-shadow {
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.05);
  }
</style>
