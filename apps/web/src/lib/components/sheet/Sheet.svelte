<script lang="ts">
  import { fade, fly, scale, slide } from "svelte/transition";
  import XIcon from "../icons/XIcon.svelte";

  export let open = false;
  export let close = () => {
    open = false;
  };
</script>

{#if open}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50"
    transition:fade={{ duration: 100 }}
    on:click={close}
  ></div>
{/if}

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 flex items-start justify-end z-50 pointer-events-none"
    transition:fly={{ duration: 200, x: 30 }}
  >
    <div
      class="bg-white rounded-l-lg shadow-lg p-8 w-full max-w-2xl h-full pointer-events-auto relative"
    >
      <button
        class="p-2 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-zinc-100 absolute top-4 right-4"
        on:click={close}
      >
        <XIcon class="w-4 h-4 text-zinc-700/70" />
      </button>
      <slot />
    </div>
  </div>
{/if}
