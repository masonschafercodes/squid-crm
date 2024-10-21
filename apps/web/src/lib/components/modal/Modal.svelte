<script lang="ts">
  import XIcon from "../icons/XIcon.svelte";

  export let showModal: boolean;
  export let modalId: string | undefined = "modal-dialog";
  export let w: string | undefined = undefined;
  let dialog: HTMLDialogElement;

  $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  id={modalId || "modal-dialog"}
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
  class="border border-zinc-200/20 bg-zinc-50 shadow-lg rounded-lg relative {w ===
  'lg'
    ? 'w-[48em]'
    : 'w-[32em]'}"
>
  <button
    class="w-10 h-10 p-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center text-zinc-600 hover:text-zinc-500 hover:bg-zinc-200/90 absolute top-2 right-2"
    aria-label="Close modal"
    type="button"
    on:click={() => {
      dialog.close();
      showModal = false;
    }}
  >
    <XIcon class="w-6 h-6" />
  </button>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <slot name="header" />
    <slot />
  </div>
</dialog>

<style>
  dialog {
    padding: 0.5rem;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
