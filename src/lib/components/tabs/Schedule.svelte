<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import * as Icon from 'svelte-ionicons';
  import GroupTextInput from '$components/form/GroupTextInput.svelte';
  import GroupDateInput from '$components/form/GroupDateInput.svelte';
  import ScheduleItem from '$components/items/ScheduleItem.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import debounce from 'debounce';

  const delayedChange = debounce(async () => {
    await loadSchedules();
  }, 1000);

  let setTime: (time: number) => void;

  let mode: 'INSERT' | 'EDIT' = 'INSERT';
  let editingSchedule: Prisma.ScheduleGetPayload<{
    include: {
      stage: {
        include: {
          project: true;
        };
      };
    };
  }>;

  let stages: Prisma.StageGetPayload<false>[] = [];
  let projects: Prisma.ProjectGetPayload<{
    include: {
      client: true;
      stages: true;
    };
  }>[] = [];

  let schedules: (Prisma.ScheduleGetPayload<{
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
  }> & { endDate: Date })[] = [];

  const form = {
    project: '',
    stage: '',
    processQuantity: '1',
    startDate: ''
  };

  async function getProjectName(id: number) {
    const project = await fetch('/api/projects/' + id).then((res) => res.json());
    return project.title + ' (' + project.code + ')';
  }

  async function getStageId(name: string) {
    const order = name.replace('مرحله ', '');
    return projects.find((project) => `${project.title} (${project.code})` === form.project)
      ?.stages[Number(order) - 1].id;
  }

  async function getStageName(id: number) {
    const stage = (await fetch('/api/stages/' + id).then((res) =>
      res.json()
    )) as Prisma.StageGetPayload<{
      include: {
        project: {
          include: {
            stages: true;
          };
        };
      };
    }>;
    const project = stage.project as Prisma.ProjectGetPayload<{
      include: {
        stages: true;
      };
    }>;

    const order = project.stages.findIndex((s) => s.id === stage.id) + 1;
    return `مرحله ${order}`;
  }

  async function loadSchedules() {
    schedules = await fetch('/api/schedules').then((res) => res.json());
  }
  async function loadProjects() {
    projects = await fetch('/api/projects').then((res) => res.json());
  }
  async function loadStages() {
    stages =
      projects.find((project) => `${project.title} (${project.code})` === form.project)?.stages ||
      [];
  }

  onMount(async () => {
    await loadSchedules();
    await loadProjects();
  });

  function validateFrom() {
    return (
      form.processQuantity.toString().trim() !== '' &&
      form.project.trim() !== '' &&
      form.stage.trim() !== '' &&
      form.startDate.toString().trim() !== ''
    );
  }

  function deleteSchedule(id: number) {
    const confirmation = confirm('آیا از حذف این زمانبندی اطمینان دارید؟');
    if (!confirmation) return;
    const result = fetch('/api/schedules/' + id, {
      method: 'DELETE'
    });

    result.then((res) => {
      if (res.ok) {
        loadSchedules();
      } else {
        console.log('bad');
      }
    });
  }

  async function editSchedule() {
    if (!validateFrom()) {
      alert('لطفا تمامی فیلد ها را پر کنید');
      return;
    }
    const result = fetch('/api/schedules/' + editingSchedule.id, {
      method: 'PATCH',
      body: JSON.stringify({
        stageId: await getStageId(form.stage),
        processQuantity: Number(form.processQuantity),
        startDate: new Date(form.startDate)
      })
    });

    result.then((res) => {
      if (res.ok) {
        loadSchedules();
        for (const key in form) {
          form[key as keyof typeof form] = '';
        }
        mode = 'INSERT';
      } else {
        console.log('bad');
      }
    });
  }

  async function createNewSchedule() {
    if (!validateFrom()) {
      alert('لطفا تمامی فیلد ها را پر کنید');
      return;
    }
    const result = fetch('/api/schedules', {
      method: 'POST',
      body: JSON.stringify({
        stageId: await getStageId(form.stage),
        processQuantity: Number(form.processQuantity),
        startDate: new Date(form.startDate)
      })
    });

    result.then((res) => {
      if (res.ok) {
        loadSchedules();
        for (const key in form) {
          form[key as keyof typeof form] = '';
        }
      } else {
        console.log('bad');
      }
    });
  }
</script>

<div class="flex gap-2" out:fade={{ duration: 200 }} in:fade={{ duration: 200, delay: 300 }}>
  <div class="flex flex-col gap-6 p-6 w-72 text-xs bg-gray-100">
    <div class="flex gap-3 items-center grow-0 shrink-0">
      <div class="font-bold text-sm">
        {mode === 'INSERT'
          ? 'افزودن زمانبندی جدید'
          : `ویرایش زمانبندی ${editingSchedule.stage.project?.title} - ${editingSchedule.stage.id}`}
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <GroupTextInput
        icon={Icon.DocumentTextOutline}
        label="پروژه"
        suggestions={projects.map((project) => `${project.title} (${project.code})`)}
        onlySuggestions
        bind:value={form.project}
        on:change={async () => {
          form.stage = '';
          await loadStages();
        }}
      />
      <GroupTextInput
        icon={Icon.LayersOutline}
        label="مرحله"
        suggestions={stages.map((_, index) => `مرحله ${index + 1}`)}
        onlySuggestions
        bind:value={form.stage}
      />
      <GroupTextInput
        icon={Icon.HammerOutline}
        label="تعداد"
        type="number"
        min={1}
        bind:value={form.processQuantity}
      />
      <GroupDateInput
        icon={Icon.CalendarOutline}
        label="تاریخ شروع ثابت"
        bind:value={form.startDate}
        bind:setTime
      />

      {#if mode === 'EDIT'}
        <div class="flex gap-2">
          <button
            class="flex gap-2 bg-accent/80 text-white px-3 py-2 rounded-md w-fit duration-75 hover:bg-accent active:scale-95"
            on:click={editSchedule}
          >
            <Icon.CheckmarkOutline size="15" />
            <span>ویرایش زمانبندی</span>
          </button>
          <!-- create a cancel button -->
          <button
            class="flex gap-2 bg-black/40 text-white px-3 py-2 rounded-md w-fit duration-75 hover:bg-black/60 active:scale-95"
            on:click={() => {
              mode = 'INSERT';
              form.project = '';
              form.stage = '';
              form.processQuantity = '';
            }}
          >
            <Icon.CloseOutline size="15" />
            <span>لغو</span>
          </button>
        </div>
      {:else}
        <button
          class="flex gap-2 bg-accent/80 text-white px-3 py-2 rounded-md w-fit duration-75 hover:bg-accent active:scale-95"
          on:click={createNewSchedule}
        >
          <Icon.AddOutline size="15" />
          <span>افزودن زمانبندی</span>
        </button>
      {/if}
    </div>
  </div>
  <div class="flex flex-col p-4 gap-2 grow h-[calc(100vh-3rem)] overflow-auto">
    <button
      class="flex gap-2 bg-accent text-white w-fit p-2 rounded-md"
      on:click={() => {
        loadSchedules();
      }}
    >
      <span>بروزرسانی</span>
      <Icon.CloudDownloadOutline size="15" />
    </button>
    {#each schedules as schedule, i (schedule)}
      <ScheduleItem
        prev={schedules[i - 1]}
        {schedule}
        on:edit={() => {
          mode = 'EDIT';
          editingSchedule = schedule;
          form.startDate = editingSchedule.startDate?.toString() || '';
          editingSchedule.startDate && setTime(new Date(editingSchedule.startDate).getTime());
          form.processQuantity = editingSchedule.processQuantity.toString();
          getStageName(schedule.stageId).then((name) => {
            form.stage = name;
          });
          getProjectName(schedule.stage.projectId || 1).then((name) => {
            form.project = name;
            loadStages();
          });
        }}
        on:delete={() => {
          deleteSchedule(schedule.id);
        }}
        on:change={async () => {
          await delayedChange();
        }}
      />
    {:else}
      <div class="text-center py-2 text-xs">موردی یافت نشد !</div>
    {/each}
  </div>
</div>
