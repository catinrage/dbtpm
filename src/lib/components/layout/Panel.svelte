<script lang="ts">
  import type { ComponentType } from 'svelte';

  type TabType = {
    icon: ComponentType;
    title: string;
    view: ComponentType;
  };

  export let tabs: TabType[];

  let selectedTab = tabs[0];
</script>

<div class="flex gap-1 h-full w-full">
  <div class="flex flex-col w-full h-[100%] bg-white rounded text-sm">
    <div class="flex gap-3 px-2 items-center h-12 grow-0 shadow-md shrink-0 z-10">
      {#each tabs as tab}
        <button
          class="flex gap-1.5 bg-black/10 px-5 py-1 h-fit rounded-xl duration-75 hover:-translate-y-0.5"
          class:bg-gray-500={selectedTab === tab}
          class:text-white={selectedTab === tab}
          on:click={() => (selectedTab = tab)}
        >
          <svelte:component this={tab.icon} size="19" />
          <span>{tab.title}</span>
        </button>
      {/each}
    </div>
    <div class="w-full h-full overflow-hidden grow text-xs">
      <svelte:component this={selectedTab.view} />
    </div>
  </div>
</div>
