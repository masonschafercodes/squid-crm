<script lang="ts">
  import { AppContainer, fetcher } from "$lib";
  import RightArrowIcon from "$lib/components/icons/RightArrowIcon.svelte";
  import { userStore } from "$lib/store/user";
  import { loading as pageLoadingState } from "$lib/store/loader";
  import SpinnerIcon from "$lib/components/icons/SpinnerIcon.svelte";
  import PaymentsIcon from "$lib/components/icons/PaymentsIcon.svelte";
  import type { PageData } from "./$types";
  import { currentPayment, payments } from "$lib/store/payments";
  import { goto } from "$app/navigation";
  import XIcon from "$lib/components/icons/XIcon.svelte";

  export let data: PageData;

  $: payments.set(data.payments || []);

  async function getCheckoutLink() {
    try {
      const data = await fetcher<LSPaymentResponse>("/payments/checkout", {
        method: "POST",
        credentials: "include",
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCancelSubscription() {
    try {
      const data = await fetcher<LSCancelSubscriptionResponse>(
        "/payments/cancel",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (data.message) {
        goto("/app/payments");
      }
    } catch (error) {
      console.error(error);
    }
  }
</script>

{#if $pageLoadingState}
  <AppContainer title="Payments" email={$userStore?.email}>
    <div class="flex item-center gap-2 h-fit">
      <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
      <span class="text-sm text-zinc-700 flex items-center">
        <RightArrowIcon class="w-4 h-4" />
      </span>
      <a href="/app/tasks" class="text-sm text-blue-500 font-semibold"
        >Payments</a
      >
    </div>
    <div class="w-full h-full flex items-center justify-center">
      <SpinnerIcon class="w-8 h-8 animate-spin text-blue-500" />
    </div>
  </AppContainer>
{:else}
  <AppContainer title="Payments" email={$userStore?.email}>
    <div class="flex item-center gap-2">
      <a href="/" class="text-sm text-zinc-700 hover:underline">Home</a>
      <span class="text-sm text-zinc-700 flex items-center">
        <RightArrowIcon class="w-4 h-4" />
      </span>
      <a href="/app/payments" class="text-sm text-blue-500 font-semibold"
        >Payments</a
      >
    </div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-zinc-800 mt-4">Payments</h1>
    </div>
    <div class="mt-6">
      {#if $payments.length > 0 && $currentPayment}
        <div class="flex flex-col gap-5">
          <span>
            You are currently subscribed, and your subscription will {$currentPayment.status ===
            "cancelled"
              ? "end"
              : "renew"} on
            <span class="text-blue-500 font-semibold">
              {new Date(
                ($currentPayment.status === "cancelled"
                  ? $currentPayment.endsAt
                  : $currentPayment.renewsAt) || ""
              ).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </span>
          {#if $currentPayment.status === "active"}
            <button
              class="py-1.5 px-3 rounded-lg shadow-md bg-white hover:bg-white/60 text-sm border border-zinc-200/90 font-semibold transition-colors flex items-center gap-1 text-zinc-600 hover:text-zinc-700 w-fit"
              on:click={handleCancelSubscription}
              disabled={$pageLoadingState || $payments.length === 0}
            >
              <XIcon class="w-4 h-4" />
              Cancel Subscription
            </button>
          {/if}
        </div>
      {:else if !$currentPayment && $payments.length > 0}
        <span
          class="text-sm text-zinc-600 font-semibold flex items-center gap-1"
        >
          loading payment information...
        </span>
      {:else}
        <button
          class="py-1.5 px-3 rounded-lg shadow-md bg-white hover:bg-white/60 text-sm border border-zinc-200/90 font-semibold transition-colors flex items-center gap-1 text-zinc-600 hover:text-zinc-700"
          on:click={getCheckoutLink}
          disabled={$pageLoadingState || $payments.length > 0}
        >
          <PaymentsIcon class="w-4 h-4" />
          Subscribe
        </button>
      {/if}
    </div>
  </AppContainer>
{/if}
