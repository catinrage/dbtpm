<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let label = '';
  export let postfix = '';
  export let value: string | number = '';
  export let icon: ComponentType;
</script>

<div class="flex gap-1 h-2">
  <svelte:component this={icon} size="13" tabindex="-1" />

  <span>{label} : </span>
  <input
    class="relative bottom-[2px] h-4 border-b border-black border-dashed w-6 mx-1 text-center"
    type="text"
    bind:value
  />
  {#if postfix}
    <span>{postfix}</span>
  {/if}
</div>
