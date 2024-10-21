<script>
  import "../index.css";
  import { userStore } from "$lib/store/user";
  import { loading } from "$lib/store/loader";
  import { afterNavigate, beforeNavigate } from "$app/navigation";

  /** @type {import('./$types').LayoutData} */
  export let data;

  $: userStore.set(data.user);

  beforeNavigate(() => {
    loading.set(true);
  });

  afterNavigate(() => {
    loading.set(false);
  });
</script>

<div
  class="w-screen h-screen overflow-hidden antialiased font-main bg-zinc-50 text-zinc-800"
>
  <slot />
</div>
