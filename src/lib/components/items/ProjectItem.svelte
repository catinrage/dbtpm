<script lang="ts">
  import * as Icon from 'svelte-ionicons';
  import InlineTextInput from '../form/InlineTextInput.svelte';
  import { press } from 'svelte-gestures';
  import type { Prisma, Stage } from '@prisma/client';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function edit() {
    dispatch('edit');
  }

  function deleteProject() {
    dispatch('delete');
  }

  type StageType = Pick<
    Stage,
    | 'id'
    | 'numberOfSetups'
    | 'setupDuration'
    | 'cycleDuration'
    | 'preparationDuration'
    | 'numberOfOutputParts'
    | 'efficiency'
  >;

  let anyThingToSave = false;

  let state: 'OPENED' | 'CLOSED' = 'CLOSED';

  export let project: Prisma.ProjectGetPayload<{
    include: {
      client: true;
      stages: true;
    };
  }>;

  function toggleState() {
    state = state === 'OPENED' ? 'CLOSED' : 'OPENED';
  }

  // load stages from database to here
  let stages: StageType[] = project.stages;
  let lastStagesState = structuredClone(stages);

  async function insertStage() {
    const result = await fetch('/api/stages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: project.id
      })
    });
    if (result.ok) {
      const stage = await result.json();
      stages = [...stages, stage];
      lastStagesState = structuredClone(stages);
    }
  }

  function deleteStage(id: number) {
    const result = fetch('/api/stages/' + id, {
      method: 'DELETE'
    });

    result.then((res) => {
      if (!res.ok) {
        console.log('bad');
      } else {
        // remove stage from stages
        stages = stages.filter((stage) => stage.id !== id);
      }
    });
  }

  function saveStages() {
    lastStagesState = structuredClone(stages);
    anyThingToSave = false;
    // for each stage, update it
    stages.forEach((stage) => {
      const result = fetch('/api/stages/' + stage.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...stage,
          // convert to number
          numberOfSetups: +stage.numberOfSetups,
          setupDuration: +stage.setupDuration,
          cycleDuration: +stage.cycleDuration,
          preparationDuration: +stage.preparationDuration,
          numberOfOutputParts: +stage.numberOfOutputParts,
          efficiency: +stage.efficiency
        })
      });

      result.then((res) => {
        if (!res.ok) {
          console.log('bad');
        }
      });
    });
  }

  $: anyThingToSave = JSON.stringify(stages) !== JSON.stringify(lastStagesState);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div class="rounded-lg shadow-md" class:pb-3={state === 'OPENED'}>
  <div
    class="p-4 w-full text-xs cursor-pointer duration-75 hover:bg-accent/10"
    class:border-b={state === 'OPENED'}
    class:border-dashed={state === 'OPENED'}
    class:mb-1.5={state === 'OPENED'}
    on:click={toggleState}
  >
    <div class="flex flex-col gap-3">
      <div class="flex gap-3">
        <div class="flex gap-1.5 w-1/4">
          <Icon.DocumentTextOutline size="18" />
          <span class="relative top-px text-right">{project.title}</span>
          <div class="bg-accent/80 text-white text-[10px] px-1 pt-0.5 rounded shrink-0 h-fit">
            {project.code}
          </div>
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.PersonOutline size="18" />
          <span class="relative top-px text-right">{project.client.name}</span>
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.AlbumsOutline size="18" />
          <span class="relative top-px text-right">{project.totalQuantity} عدد</span>
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.LayersOutline size="18" />
          <span class="relative top-px text-right">{project.stages.length} مرحله</span>
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.CashOutline size="18" />
          <!-- make price from 1000 to 1,000 -->
          <span class="relative top-px text-right"
            >{project.fee
              .toString()
              .split('')
              .map((char, i) =>
                (project.fee.toString().length - i) % 3 === 0 && i !== 0 ? ',' + char : char
              )
              .join('')} تومان</span
          >
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.CalendarOutline size="18" />
          <span class="relative top-px text-right"
            >{new Date(project.createdAt).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span
          >
        </div>
        <div class="flex gap-3 mr-auto">
          <div class="mr-auto" on:click|stopPropagation={() => {}}>
            <Icon.TrashBinOutline
              class="relative top-px ml-2 cursor-pointer text-black/20 duration-75 hover:text-rose-500"
              size="17"
              on:click={deleteProject}
            />
          </div>
          <div class="mr-auto" on:click|stopPropagation={() => {}}>
            <Icon.CreateOutline
              class="ml-2 cursor-pointer text-black/20 duration-75 hover:text-black"
              size="18"
              on:click={edit}
            />
          </div>
          <div class="mr-auto">
            <Icon.ChevronBack
              class="duration-100"
              style={state === 'OPENED' ? 'rotate: -90deg' : ''}
              size="18"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  {#if state === 'OPENED'}
    <div class="flex flex-col divide-y divide-dashed gap-2 mr-6 text-[10px]">
      {#each stages as stage, index (stage)}
        <div class="flex gap-8 items-center flex-wrap">
          <div class="relative bottom-1 flex gap-1 pt-2 ml-3 font-bold w-20">
            <Icon.ArrowUndoCircleOutline size="15" />
            <span class="relative top-px text-right">مرحله {index + 1}</span>
          </div>
          <InlineTextInput
            label="تعداد ستاپ"
            icon={Icon.SettingsOutline}
            bind:value={stage.numberOfSetups}
          />
          <InlineTextInput
            label="زمان موردنیاز ستاپ"
            postfix="دقیقه"
            icon={Icon.HourglassOutline}
            bind:value={stage.setupDuration}
          />
          <InlineTextInput
            label="مدت هر اجرا"
            postfix="دقیقه"
            icon={Icon.TimeOutline}
            bind:value={stage.cycleDuration}
          />
          <InlineTextInput
            label="زمان بذار/بردار"
            postfix="دقیقه"
            icon={Icon.StopwatchOutline}
            bind:value={stage.preparationDuration}
          />
          <InlineTextInput
            label="تعداد خروجی"
            postfix="عدد"
            icon={Icon.BagCheckOutline}
            bind:value={stage.numberOfOutputParts}
          />
          <InlineTextInput
            label="بازدهی (0-1)"
            icon={Icon.StatsChartOutline}
            bind:value={stage.efficiency}
          />
          <div
            use:press={{ timeframe: 300, triggerBeforeFinished: false }}
            on:press={() => {
              if (stages.length === 1) return;
              deleteStage(stage.id);
            }}
          >
            <Icon.CloseCircleOutline
              class="relative text-rose-500 top-1 mr-2 duration-100 cursor-pointer  hover:scale-125"
              size="13"
            />
          </div>
        </div>
      {/each}
      <div class="flex gap-2 pt-2">
        <div
          class="flex gap-1 w-fit text-accent/70 cursor-pointer duration-75 hover:text-accent/100"
          on:click={insertStage}
        >
          <Icon.AddOutline size="15" />
          <span class="relative top-px text-right">مرحله جدید</span>
        </div>
        {#if anyThingToSave}
          <div
            class="flex gap-1 w-fit text-green-500/70 cursor-pointer duration-75 hover:text-green-500/100"
            on:click={saveStages}
          >
            <Icon.CheckmarkOutline size="15" />
            <span class="relative top-px text-right">ذخیره</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
