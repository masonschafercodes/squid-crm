<script lang="ts">
  import { AppContainer } from "$lib";
  import RightArrowIcon from "$lib/components/icons/RightArrowIcon.svelte";
  import { userStore } from "$lib/store/user";
</script>

<AppContainer email={$userStore?.email}>
  <div class="flex item-center gap-2 h-fit">
    <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
    <span class="text-sm text-zinc-700 flex items-center">
      <RightArrowIcon class="w-4 h-4" />
    </span>
    <a href="/app/tasks" class="text-sm text-blue-500 font-semibold"
      >Dashboard</a
    >
  </div>
</AppContainer>
