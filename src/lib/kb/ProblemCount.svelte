<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  // One number for a sentence: how many reports in `ticket` belong to `problem`.
  let { ticket, problem }: { ticket: number; problem: Problem } = $props();

  const n = $derived(
    groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove).find((g) => g.problem === problem)?.reports.length ?? 0,
  );
</script>

<strong>{n}</strong>
