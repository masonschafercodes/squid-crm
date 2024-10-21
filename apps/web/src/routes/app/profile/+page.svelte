<script lang="ts">
  import { AppContainer, fetcher } from "$lib";
  import RightArrowIcon from "$lib/components/icons/RightArrowIcon.svelte";
  import { userStore } from "$lib/store/user";
  import { loading as pageLoadingState } from "$lib/store/loader";
  import SpinnerIcon from "$lib/components/icons/SpinnerIcon.svelte";
  import SaveIcon from "$lib/components/icons/SaveIcon.svelte";
  import { addToast } from "$lib/store/toasts";
  import { goto } from "$app/navigation";
  import { writable } from "svelte/store";
  import type { PageData } from "./$types";

  export let data: PageData;

  let loading = false;
  export const profile = writable<{
    id?: string;
    name: string;
    bio: string;
  } | null>({
    name: data.profile?.name ?? "",
    bio: data.profile?.bio ?? "",
    id: data.profile?.id,
  });

  async function handleUpdateProfile() {
    if (loading) {
      return;
    }
    loading = true;
    try {
      await fetcher<{
        id?: string;
        name: string;
        bio: string;
      } | null>("/profiles", {
        method: "POST",
        body: JSON.stringify($profile),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      loading = false;
      addToast("Profile", "Profile updated successfully");
      goto("/app/dashboard");
    } catch (error) {
      console.error(error);
      loading = false;
    }
  }
</script>

{#if $pageLoadingState}
  <AppContainer title="Profile" email={$userStore?.email}>
    <div class="flex item-center gap-2 h-fit">
      <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
      <span class="text-sm text-zinc-700 flex items-center">
        <RightArrowIcon class="w-4 h-4" />
      </span>
      <a href="/app/profile" class="text-sm text-blue-500 font-semibold"
        >Profile</a
      >
    </div>
    <div class="w-full h-full flex items-center justify-center">
      <SpinnerIcon class="w-8 h-8 animate-spin text-blue-500" />
    </div>
  </AppContainer>
{:else}
  <AppContainer title="Profile" email={$userStore?.email}>
    <div class="flex item-center gap-2">
      <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
      <span class="text-sm text-zinc-700 flex items-center">
        <RightArrowIcon class="w-4 h-4" />
      </span>
      <a href="/app/profile" class="text-sm text-blue-500 font-semibold"
        >Profile</a
      >
    </div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-zinc-800 mt-4">Profile</h1>
    </div>
    {#if $profile}
      <form
        class="grid gap-3 max-w-3xl"
        on:submit|preventDefault={handleUpdateProfile}
      >
        <div class="grid gap-2">
          <label for="name" class="text-sm text-zinc-600">Name</label>
          <input
            bind:value={$profile.name}
            type="text"
            id="name"
            name="name"
            class="p-2 rounded-lg border border-zinc-200/90 text-zinc-800/80 shadow-sm"
          />
        </div>
        <div class="grid gap-2">
          <label for="bio" class="text-sm text-zinc-600">Bio</label>
          <textarea
            bind:value={$profile.bio}
            id="bio"
            name="bio"
            rows="8"
            class="p-2 rounded-lg border border-zinc-200/90 text-zinc-800/80 shadow-sm resize-none"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading ||
            $profile.name === "" ||
            $profile.bio === "" ||
            ($profile.name === data.profile?.name &&
              $profile.bio === data.profile?.bio)}
          class="p-2.5 text-sm bg-blue-400 hover:bg-blue-500 disabled:opacity-50 transition-colors mt-4 rounded-lg text-zinc-50 font-semibold shadow-md flex items-center justify-center gap-2"
        >
          {#if loading}
            <SpinnerIcon class="w-4 h-4 animate-spin" />
          {:else}
            <SaveIcon class="w-4 h-4" />
          {/if}
          Update Profile
        </button>
      </form>
    {/if}
  </AppContainer>
{/if}
