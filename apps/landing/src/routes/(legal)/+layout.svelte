<script lang="ts">
  const { children } = $props();
</script>

<div class="prose dark:prose-invert mt-20 mx-auto max-w-prose px-4">
  {@render children()}
</div>
