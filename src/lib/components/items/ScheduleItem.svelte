<script lang="ts">
  import * as Icon from 'svelte-ionicons';
  import type { Prisma } from '@prisma/client';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  function delayedCall(fn: () => unknown, delay: number) {
    // set type to be timeout timer
    let timer: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn();
      }, delay);
    };
  }

  function onChange() {
    dispatch('change');
  }

  function edit() {
    dispatch('edit', {
      schedule,
      stage,
      project
    });
  }

  async function moveUp() {
    await fetch('/api/schedules/prev', {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(schedule.id),
        direction: 'UP'
      })
    });
    onChange();
  }
  async function moveDown() {
    await fetch('/api/schedules/prev', {
      method: 'PUT',
      body: JSON.stringify({
        id: Number(schedule.id),
        direction: 'DOWN'
      })
    });
    onChange();
  }

  function deleteProject() {
    dispatch('delete');
  }

  let state: 'OPENED' | 'CLOSED' = 'OPENED';

  export let schedule: Prisma.ScheduleGetPayload<{
    include: {
      stage: {
        include: {
          project: {
            include: {
              client: true;
              stages: true;
            };
          };
        };
      };
    };
  }> & {
    endDate: Date;
  };

  export let prev: Prisma.ScheduleGetPayload<{
    include: {
      stage: {
        include: {
          project: {
            include: {
              client: true;
              stages: true;
            };
          };
        };
      };
    };
  }> & {
    endDate: Date;
  };

  if (!schedule.stage) throw new Error('Schedule must have a stage');
  const stage = schedule.stage;
  if (!stage.project) throw new Error('Stage must have a project');
  const project = stage.project;

  let interruptions = schedule.interruptions as {
    title: string;
    duration: string;
  }[];

  const caller = delayedCall(onChange, 1000);

  onMount(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        caller();
      });
    });
  });

  $: if (
    !interruptions.at(-1) ||
    (interruptions.at(-1)?.title !== '' && interruptions.at(-1)?.duration)
  ) {
    interruptions = [
      ...interruptions,
      {
        title: '',
        duration: ''
      }
    ];
  }

  // remove any empty interruption that is not the last one
  $: {
    interruptions = interruptions.filter((interruption, index) => {
      if (index === interruptions.length - 1) return true;
      return interruption.title || interruption.duration;
    });
  }

  $: saveInterruptions(interruptions);

  async function saveInterruptions(interruptions: { title: string; duration: string }[]) {
    await fetch('/api/schedules/interruptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scheduleId: schedule.id,
        interruptions: interruptions.filter((interruption) => {
          return interruption.title && interruption.duration;
        })
      })
    });
  }

  function getStagesNumberOrder() {
    return project.stages.findIndex((s) => s.id === stage.id) + 1;
  }

  function toggleState() {
    state = state === 'OPENED' ? 'CLOSED' : 'OPENED';
  }

  let interruptionsTime = 0;
  $: interruptionsTime = interruptions
    .filter((i) => {
      return i.title && i.duration;
    })
    .reduce((acc, interruption) => {
      return acc + Number(interruption.duration);
    }, 0);

  let startDate = schedule.startDate;
  if (prev) {
    startDate = prev.endDate;
  }

  const efficiencyInPercentage = Math.round(stage.efficiency * 100);
  const timePerPart = stage.cycleDuration + stage.preparationDuration;
  const timePerPartInMilliseconds = timePerPart * 60 * 1000;
  const totalTime = timePerPart * (schedule.processQuantity / stage.numberOfOutputParts);
  $: totalTimeWithEfficiency = totalTime / stage.efficiency + interruptionsTime;
  $: totalTimeWithEfficiencyInMilliseconds = totalTimeWithEfficiency * 60 * 1000;
  $: totalTimeWithEfficiencyInHours = (totalTimeWithEfficiency - interruptionsTime) / 60;

  let readyParts = Number(localStorage.getItem(`readyParts-${schedule.id}`)) || 1;

  $: localStorage.setItem(`readyParts-${schedule.id}`, readyParts.toString());

  const elapsedTime =
    new Date().getTime() - new Date(schedule.startDate).getTime() + stage.setupDuration * 60 * 1000;

  $: secondaryEfficiency =
    ((readyParts / stage.numberOfOutputParts) * timePerPartInMilliseconds) /
    (elapsedTime - interruptionsTime * 60 * 1000);
  $: secondaryEfficiencyInPercentage = Math.round(secondaryEfficiency * 100);
  $: remainingPartsTimeWithSecondaryEfficiencyInMilliseconds =
    (((schedule.processQuantity - readyParts) / stage.numberOfOutputParts) *
      timePerPartInMilliseconds) /
    secondaryEfficiency;
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
          <span class="text-[11px] font-bold px-2 whitespace-nowrap leading-5 bg-black/10 rounded"
            >{'مرحله ' + getStagesNumberOrder()}</span
          >
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.PersonOutline size="18" />
          <span class="relative top-px text-right">{project.client.name}</span>
        </div>
        <div class="flex gap-1.5 w-1/12">
          <Icon.HammerOutline size="18" />
          <span class="relative top-px text-right">{schedule.processQuantity} عدد</span>
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.AlarmOutline size="18" />
          <span class="relative top-px text-right"
            >{new Date(startDate).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span
          >
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.CheckmarkDoneCircleOutline size="18" />
          <span class="relative top-px text-right"
            >{new Date(
              new Date(startDate).getTime() + totalTimeWithEfficiencyInMilliseconds
            ).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span
          >
        </div>
        <div class="flex gap-1.5 w-1/6">
          <Icon.TimeOutline size="18" />
          <span class="relative top-px text-right"
            >{Math.ceil(totalTimeWithEfficiencyInHours) + ' ساعت'}</span
          >
        </div>
        <div class="flex gap-3 mr-auto">
          <div on:click|stopPropagation={() => {}}>
            <Icon.CaretUp
              class="relative top-px ml-2 cursor-pointer text-black/20 duration-75 hover:text-accent"
              size="17"
              on:click={moveUp}
            />
          </div>
          <div on:click|stopPropagation={() => {}}>
            <Icon.CaretDown
              class="relative top-px ml-2 cursor-pointer text-black/20 duration-75 hover:text-accent"
              size="17"
              on:click={moveDown}
            />
          </div>
          <div on:click|stopPropagation={() => {}}>
            <Icon.TrashBinOutline
              class="relative top-px ml-2 cursor-pointer text-black/20 duration-75 hover:text-rose-500"
              size="17"
              on:click={deleteProject}
            />
          </div>
          <div on:click|stopPropagation={() => {}}>
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
    <div class="flex flex-col gap-3 mr-6">
      <div class="flex gap-2 text-[10px] py-3">
        <div class="flex gap-8 items-center flex-wrap">
          <div class="flex gap-1 h-2">
            <Icon.SettingsOutline size="13" tabindex="-1" />
            <span>تعداد ستاپ : </span>
            <span>{stage.numberOfSetups}</span>
          </div>
          <div class="flex gap-1 h-2">
            <Icon.HourglassOutline size="13" tabindex="-1" />
            <span>زمان موردنیاز ستاپ : </span>
            <span>{stage.setupDuration}</span>
            <span>دقیقه</span>
          </div>
          <div class="flex gap-1 h-2">
            <Icon.TimeOutline size="13" tabindex="-1" />
            <span>مدت هر اجرا : </span>
            <span>{stage.cycleDuration}</span>
            <span>دقیقه</span>
          </div>
          <div class="flex gap-1 h-2">
            <Icon.StopwatchOutline size="13" tabindex="-1" />
            <span>زمان بذار/بردار : </span>
            <span>{stage.preparationDuration}</span>
            <span>دقیقه</span>
          </div>
          <div class="flex gap-1 h-2">
            <Icon.BagCheckOutline size="13" tabindex="-1" />
            <span>تعداد خروجی : </span>
            <span>{stage.numberOfOutputParts}</span>
            <span>عدد</span>
          </div>
          <div class="flex gap-1 h-2">
            <Icon.StatsChartOutline size="13" tabindex="-1" />
            <span>بازدهی : </span>
            <span>{stage.efficiency}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2 text-[10px]">
        {#each interruptions as interruption, index (interruption)}
          <div class="flex gap-2">
            <div class="flex gap-1 items-center">
              <Icon.ClipboardOutline class="relative bottom-px" size="13" />
              <span>عنوان کار مابین : </span>
              <input
                class="px-3 py-0.5 w-80 mr-1 border border-dashed rounded-md"
                type="text"
                bind:value={interruption.title}
              />
            </div>
            <div class="flex gap-1 items-center">
              <Icon.PauseCircleOutline class="relative bottom-px" size="13" />
              <span>مدت زمان (به دقیقه) : </span>
              <input
                class="px-3 pl-0 py-0.5 w-20 mr-px border border-dashed rounded-md"
                type="number"
                min="1"
                bind:value={interruption.duration}
              />
            </div>
            {#if index !== interruptions.length - 1}
              <span
                class="flex items-center"
                on:click={() => {
                  interruptions = interruptions.filter((_, i) => i !== index);
                }}
              >
                <Icon.TrashBinOutline
                  class="text-black/30 mr-1 cursor-pointer duration-75 hover:text-rose-500"
                  size="12"
                />
              </span>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex gap-2 items-center">
          <Icon.CalculatorOutline size="18" tabindex="-1" />
          <span>محاسبات :</span>
        </div>
        <div class="flex gap-2 items-center text-[10px]">
          <span>قطعات آماده شده : </span>
          <input
            class="border w-20 pr-2 py-0.5 rounded-md border-dashed"
            bind:value={readyParts}
            type="number"
            min="1"
          />
          <span>بازدهی ثانویه : </span>
          <span class="bg-gray-100 rounded px-2 py-0.5 ltr flex gap-2">
            <span
              class="text-green-600"
              class:!text-rose-600={secondaryEfficiencyInPercentage - efficiencyInPercentage < 0}
              >{(secondaryEfficiencyInPercentage - efficiencyInPercentage).toLocaleString('en-US', {
                signDisplay: 'always'
              })}%</span
            >
            <span>{secondaryEfficiencyInPercentage}%</span>
          </span>
          <span>زمان پایان براساس بازدهی ثانویه : </span>
          <span class="bg-gray-100 rounded px-2 py-0.5"
            >{new Date(
              new Date().getTime() + remainingPartsTimeWithSecondaryEfficiencyInMilliseconds
            ).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span
          >
        </div>
      </div>
    </div>
  {/if}
</div>
