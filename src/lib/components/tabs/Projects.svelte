<script lang="ts">
  import type { Client, Prisma } from '@prisma/client';
  import * as Icon from 'svelte-ionicons';
  import GroupTextInput from '$components/form/GroupTextInput.svelte';
  import ProjectItem from '$components/items/ProjectItem.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let mode: 'INSERT' | 'EDIT' = 'INSERT';
  let editingProject: Prisma.ProjectGetPayload<{
    include: {
      client: true;
      stages: true;
    };
  }>;

  let clients: Client[] = [];
  let projects: Prisma.ProjectGetPayload<{
    include: {
      client: true;
      stages: true;
    };
  }>[] = [];

  const form = {
    title: '',
    code: '',
    client: '',
    fee: '',
    totalQuantity: ''
  };

  async function loadProjects() {
    projects = await fetch('/api/projects').then((res) => res.json());
  }

  async function loadClients() {
    clients = await fetch('/api/clients').then((res) => res.json());
  }

  onMount(async () => {
    await loadProjects();
    await loadClients();
  });

  function validateFrom() {
    return (
      form.title.trim() !== '' &&
      form.code.trim() !== '' &&
      form.client.trim() !== '' &&
      form.fee.toString().trim() !== '' &&
      form.totalQuantity.toString().trim() !== ''
    );
  }

  function deleteProject(id: number) {
    const confirmation = confirm('آیا از حذف این پروژه اطمینان دارید؟');
    if (!confirmation) return;
    const result = fetch('/api/projects/' + id, {
      method: 'DELETE'
    });

    result.then((res) => {
      if (res.ok) {
        loadProjects();
        loadClients();
      } else {
        console.log('bad');
      }
    });
  }

  function editProject() {
    if (!validateFrom()) {
      alert('لطفا تمامی فیلد ها را پر کنید');
      return;
    }
    const result = fetch('/api/projects/' + editingProject.id, {
      method: 'PATCH',
      body: JSON.stringify({
        ...form,
        fee: Number(form.fee),
        totalQuantity: Number(form.totalQuantity)
      })
    });

    result.then((res) => {
      if (res.ok) {
        loadProjects();
        loadClients();
        for (const key in form) {
          form[key as keyof typeof form] = '';
        }
        mode = 'INSERT';
      } else {
        console.log('bad');
      }
    });
  }

  function createNewProject() {
    if (!validateFrom()) {
      alert('لطفا تمامی فیلد ها را پر کنید');
      return;
    }
    const result = fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        fee: Number(form.fee),
        totalQuantity: Number(form.totalQuantity)
      })
    });

    result.then((res) => {
      if (res.ok) {
        loadProjects();
        loadClients();
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
        {mode === 'INSERT' ? 'افزودن پروژه ی جدید' : `ویرایش ${editingProject.title}`}
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <GroupTextInput icon={Icon.DocumentTextOutline} label="عنوان پروژه" bind:value={form.title} />
      <GroupTextInput icon={Icon.BarcodeOutline} label="کد پروژه" bind:value={form.code} />
      <GroupTextInput
        icon={Icon.PersonOutline}
        label="مشتری"
        suggestions={clients.map((client) => client.name)}
        bind:value={form.client}
      />
      <GroupTextInput
        icon={Icon.CashOutline}
        label="قیمت واحد (تومان)"
        type="number"
        bind:value={form.fee}
      />
      <GroupTextInput
        icon={Icon.AlbumsOutline}
        label="تعداد کل"
        type="number"
        bind:value={form.totalQuantity}
      />
      {#if mode === 'EDIT'}
        <div class="flex gap-2">
          <button
            class="flex gap-2 bg-accent/80 text-white px-3 py-2 rounded-md w-fit duration-75 hover:bg-accent active:scale-95"
            on:click={editProject}
          >
            <Icon.CheckmarkOutline size="15" />
            <span>ویرایش پروژه</span>
          </button>
          <!-- create a cancel button -->
          <button
            class="flex gap-2 bg-black/40 text-white px-3 py-2 rounded-md w-fit duration-75 hover:bg-black/60 active:scale-95"
            on:click={() => {
              mode = 'INSERT';
              form.client = '';
              form.code = '';
              form.fee = '';
              form.title = '';
              form.totalQuantity = '';
            }}
          >
            <Icon.CloseOutline size="15" />
            <span>لغو</span>
          </button>
        </div>
      {:else}
        <button
          class="flex gap-2 bg-accent/80 text-white px-3 py-2 rounded-md w-fit duration-75 hover:bg-accent active:scale-95"
          on:click={createNewProject}
        >
          <Icon.AddOutline size="15" />
          <span>افزودن پروژه</span>
        </button>
      {/if}
    </div>
  </div>
  <div class="flex flex-col p-4 gap-2 grow h-[calc(100vh-3rem)] overflow-auto">
    {#each projects as project (project)}
      <ProjectItem
        {project}
        on:edit={() => {
          mode = 'EDIT';
          editingProject = project;
          form.client = editingProject.client.name;
          form.code = editingProject.code;
          form.fee = editingProject.fee.toString();
          form.title = editingProject.title;
          form.totalQuantity = editingProject.totalQuantity.toString();
        }}
        on:delete={() => {
          deleteProject(project.id);
        }}
      />
    {:else}
      <div class="text-center py-2 text-xs">موردی یافت نشد !</div>
    {/each}
  </div>
</div>
