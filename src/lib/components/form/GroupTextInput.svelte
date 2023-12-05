<script lang="ts">
  import type { ComponentType } from 'svelte';
  import * as Icon from 'svelte-ionicons';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function change() {
    dispatch('change', {
      value
    });
    if (onlySuggestions) {
      error = suggestions?.includes(value) ? false : true;
    }
  }

  let input: HTMLInputElement;

  export let error = false;

  export let label: string = '';
  export let icon: ComponentType;
  export let value: string = '';
  export let placeholder: string = '';
  export let type: 'text' | 'number' = 'text';
  export let suggestions: string[] | undefined = undefined;
  export let onlySuggestions: boolean = false;

  export let min: number = 0;
  export let max: number = -1;
  export let step = 1;

  export let state: 'FOCUSED' | 'BLURRED' = 'BLURRED';
</script>

<div class="relative flex flex-col gap-3">
  <div class="flex gap-1">
    <svelte:component this={icon} size="15" tabindex="-1" />
    <span>{label} : </span>
  </div>
  {#if type === 'text'}
    <Icon.CloseOutline
      class="absolute left-2 top-1/2 translate-y-1.5 text-gray-300 cursor-pointer duration-75 hover:text-black"
      size="15"
      on:click={function () {
        value = '';
        change();
        input.focus();
      }}
    />
    {#if !onlySuggestions && !suggestions?.includes(value) && value && suggestions?.length}
      <span class="absolute left-7 top-1/2 translate-y-1.5 text-[9px] text-accent/90">جدید</span>
    {/if}
    <input
      class="p-2 px-4 text-black/50 text-xs rounded-lg"
      class:text-rose-500={error}
      class:rounded-b-none={state === 'FOCUSED'}
      type="text"
      {placeholder}
      bind:value
      bind:this={input}
      on:focus={() => {
        state = 'FOCUSED';
      }}
      on:blur={() => {
        state = 'BLURRED';
      }}
      on:input={change}
      on:change={change}
    />
  {:else}
    <input
      class="p-2 px-4 text-black/50 text-xs rounded-lg ltr text-left"
      type="number"
      {step}
      {min}
      max={max === -1 ? undefined : max}
      pattern="[0-9]*"
      bind:value
    />
  {/if}
  {#if suggestions !== undefined && state === 'FOCUSED'}
    <div
      class="absolute flex flex-col top-full bg-white w-full px-3 py-2 border-t border-gray-200 border-dashed rounded-b-lg shadow-md divide-y bordeda z-10"
    >
      {#each suggestions
        .slice(0, 10)
        .filter((suggestion) => suggestion
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase())) as suggestion}
        <button
          class="flex gap-1 py-2 border-dashed text-right text-black/60 cursor-pointer duration-75 hover:text-black"
          on:mousedown={() => {
            value = suggestion;
            change();
          }}
        >
          <svelte:component this={icon} size="13" tabindex="-1" />
          <span>{suggestion}</span>
        </button>
      {:else}
        <div class="text-center py-2 text-xs">موردی یافت نشد !</div>
      {/each}
      {#if suggestions.length > 10}
        <div class="text-center py-2 text-xs">...</div>
      {/if}
    </div>
  {/if}
</div>
