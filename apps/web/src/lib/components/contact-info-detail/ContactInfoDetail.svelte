<script lang="ts">
  export let label: string;
  export let value: string;
</script>

<div class="flex flex-col">
  <span class="text-sm text-zinc-600/70">
    {label}
  </span>
  <span class="text-sm text-zinc-800/90">
    {value}
  </span>
</div>
