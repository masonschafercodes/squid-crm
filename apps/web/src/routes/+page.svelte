<script>
  import MainIcon from "$lib/components/icons/MainIcon.svelte";
</script>

<div class="w-full h-full flex justify-center">
  <div class="flex flex-col max-w-7xl w-full gap-4">
    <div class="flex items-center justify-between p-6">
      <nav class="flex items-center gap-2">
        <a href="/" class="h-10 w-10 whitespace-nowrap">
          <MainIcon class="w-8 h-8 fill-blue-500" />
        </a>
        <ul class="hidden md:flex items-center gap-4 ml-12">
          <li>
            <a
              href="/"
              class="py-1.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 text-zinc-600 hover:text-blue-500"
            >
              about
            </a>
          </li>
          <li>
            <a
              href="/"
              class="py-1.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 text-zinc-600 hover:text-blue-500"
            >
              pricing
            </a>
          </li>
          <li>
            <a
              href="/"
              class="py-1.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 text-zinc-600 hover:text-blue-500"
            >
              docs
            </a>
          </li>
        </ul>
      </nav>
      <a
        href="/register"
        class="py-1.5 px-3 rounded-lg shadow-md bg-white hover:bg-white/60 text-sm border border-zinc-200/90 font-semibold transition-colors flex items-center gap-1 text-zinc-600 hover:text-zinc-700"
      >
        Get Started
      </a>
    </div>
    <div class="px-6">
      <h1 class="text-4xl font-bold text-zinc-800">Welcome to SaaS-Starter</h1>
      <p class="text-zinc-600">
        A simple, secure, and scalable SaaS starter kit built with SvelteKit and
        Fastify.
      </p>
    </div>
  </div>
</div>
