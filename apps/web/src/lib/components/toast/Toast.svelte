<script lang="ts">
  import { toasts } from "$lib/store/toasts";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
</script>

<div class="absolute bottom-3 right-3 z-50 flex flex-col-reverse gap-2">
  {#each $toasts as toast (toast.id)}
    <div
      class="bg-white p-3 rounded-lg border border-zinc-200/90 text-zinc-800/80 shadow-md flex flex-col gap-1 w-[300px]"
      transition:fly={{ duration: 300, x: 10 }}
      animate:flip={{ duration: 300 }}
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full shadow-md"></div>
        <h3 class="font-bold">{toast.title}</h3>
      </div>
      <p class="text-sm text-zinc-500">{toast.message}</p>
    </div>
  {/each}
</div>
