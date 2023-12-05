<script lang="ts">
  import * as Icon from 'svelte-ionicons';
  import Panel from '$components/layout/Panel.svelte';
  import Projects from '$components/tabs/Projects.svelte';
  import Schedule from '$components/tabs/Schedule.svelte';
</script>

<div class="flex flex-col gap-2 h-full">
  <Panel
    tabs={[
      {
        icon: Icon.FileTrayFullOutline,
        title: 'پروژه ها',
        view: Projects
      },
      {
        icon: Icon.CalendarOutline,
        title: 'زمانبندی',
        view: Schedule
      }
    ]}
  />
</div>
