<script lang="ts">
  import { onMount, type ComponentType } from 'svelte';

  export let label: string = '';
  export let icon: ComponentType;
  export let value: string = '';
  value = new Date().getTime().toString();

  export let setTime: (time: number) => void = () => {};

  let element: HTMLInputElement;
  onMount(async () => {
    // @ts-expect-error omg
    const { model } = window.$(element).pDatepicker({
      timePicker: {
        enabled: true,
        second: {
          enabled: false
        }
      },
      calendar: {
        persian: {
          locale: 'fa',
          showHint: true,
          leapYearMode: 'algorithmic' // "astronomical"
        },
        gregorian: {
          locale: 'en',
          showHint: true
        }
      },
      navigator: {
        text: {
          btnNextText: '🠜',
          btnPrevText: '🠞'
        }
      }
    });
    model.options.onSelect =
      model.options.onHide =
      model.options.onSet =
        () => {
          value = model.state.selected.unixDate;
        };

    setTime = (time: number) => {
      model.api.setDate(time);
    };
  });
</script>

<div class="relative flex flex-col gap-3">
  <div class="flex gap-1">
    <svelte:component this={icon} size="15" tabindex="-1" />
    <span>{label} : </span>
  </div>

  <input class="p-2 px-4 text-black/50 text-xs rounded-lg" bind:this={element} />
</div>
