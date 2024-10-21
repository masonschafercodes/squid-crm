<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import { fly } from "svelte/transition";

  export let showDrowdown: Writable<boolean>;
  export let w: string = "w-full";
  let dropdownRef: HTMLDivElement;

  function handleClick(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      showDrowdown.set(false);
    }
  }

  onMount(() => {
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  });
</script>

<div class="flex flex-col gap-2 relative" bind:this={dropdownRef}>
  <button
    class="py-1.5 px-3 rounded-lg shadow-sm bg-white hover:bg-white/60 text-sm border border-zinc-200/90 font-semibold transition-colors flex items-center gap-1 text-zinc-600 hover:text-zinc-700"
    on:click={() => showDrowdown.update((v) => !v)}
  >
    <slot name="icon" />
    <slot name="button_text" />
  </button>
  {#if $showDrowdown}
    <div
      class="absolute top-10 right-0 bg-white shadow-xl rounded-lg border border-zinc-200/90 z-[999] {w}"
      transition:fly={{ duration: 150, y: -10 }}
    >
      <slot name="dropdown_content" />
    </div>
  {/if}
</div>
