<script>
  import favicon from '$lib/assets/favicon.svg';
  import Navbar from '$lib/components/Navbar.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { authStore } from '$lib/stores/auth.js';
  import { themeStore } from '$lib/stores/theme.js';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(() => {
    authStore.initialize();
    themeStore.initialize();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app">
  <Navbar />
  <main class="app__main">
    {@render children()}
  </main>
  <Toast />
</div>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(html) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 16px;
    scroll-behavior: smooth;
  }

  :global(body) {
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(a) {
    color: inherit;
  }

  :global(button) {
    font-family: inherit;
  }

  :global(input) {
    font-family: inherit;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app__main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
