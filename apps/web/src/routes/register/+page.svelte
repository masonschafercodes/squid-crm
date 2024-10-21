<script lang="ts">
  import { goto } from "$app/navigation";
  import { BackIcon, fetcher } from "$lib";
  import SpinnerIcon from "$lib/components/icons/SpinnerIcon.svelte";
  import { userStore } from "$lib/store/user";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const confirmPassword = writable("");
  const loginForm = writable({
    email: "",
    password: "",
  });
  const loading = writable(false);

  async function handleSubmit() {
    const { email, password } = $loginForm;
    const confirmPassword = $confirmPassword;

    if (
      !email ||
      !password ||
      email.trim() === "" ||
      password.trim() === "" ||
      password !== confirmPassword
    ) {
      return;
    }

    loading.set(true);
    try {
      const body = JSON.stringify({ email, password });
      await fetcher<{
        id: string;
        email: string;
      }>("/users/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      loading.set(false);
      goto("/");
    } catch (error) {
      loading.set(false);
      console.error(error);
    }
  }

  onMount(() => {
    if ($userStore) {
      goto("/app/dashboard");
    }

    return () => {
      loginForm.set({ email: "", password: "" });
    };
  });
</script>

<div class="w-full h-full flex justify-center items-center">
  <div
    class="p-6 rounded-lg shadow-lg border border-zinc-200/90 w-full xl:w-1/3 2xl:w-1/5 flex flex-col gap-4"
  >
    <div class="flex items-start justify-between">
      <div class="grid gap-2 flex-1">
        <h1 class="text-2xl font-bold">Welcome ✨</h1>
        <p class="text-sm text-zinc-800/60">
          Already have an account? <a
            href="/login"
            class="text-zinc-800 hover:underline">Login</a
          >
        </p>
      </div>
      <a
        href="/"
        class="py-1.5 px-3 rounded-lg shadow-md bg-white hover:bg-white/60 text-sm border border-zinc-200/90 font-semibold transition-colors flex items-center gap-1 text-zinc-600 hover:text-zinc-700"
      >
        <BackIcon class="w-4 h-4" />
        Back
      </a>
    </div>
    <form class="grid gap-3" on:submit|preventDefault={handleSubmit}>
      <div class="grid gap-2">
        <label for="email" class="text-sm text-zinc-600">Email</label>
        <input
          bind:value={$loginForm.email}
          autocomplete="email"
          type="email"
          id="email"
          name="email"
          required
          class="p-2 rounded-lg border border-zinc-200/90 text-zinc-800/80"
        />
      </div>
      <div class="grid gap-2">
        <label for="password" class="text-sm text-zinc-600">Password</label>
        <input
          bind:value={$loginForm.password}
          type="password"
          id="password"
          name="password"
          autocomplete="new-password"
          required
          class="p-2 rounded-lg border border-zinc-200/90"
        />
      </div>
      <div class="grid gap-2">
        <label for="password" class="text-sm text-zinc-600"
          >Confirm Password</label
        >
        <input
          bind:value={$confirmPassword}
          type="password"
          id="password"
          name="password"
          autocomplete="new-password"
          required
          class="p-2 rounded-lg border border-zinc-200/90"
        />
      </div>
      <button
        type="submit"
        class="p-2.5 text-sm bg-blue-400 hover:bg-blue-500 transition-colors mt-4 rounded-lg text-zinc-50 font-semibold shadow-md flex items-center justify-center gap-2"
      >
        {#if $loading}
          <SpinnerIcon class="w-4 h-4 animate-spin" />
        {/if}
        Register
      </button>
    </form>
  </div>
</div>
