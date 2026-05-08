<script lang="ts">
  import { useStore } from "@nanostores/svelte";
  import {
    collectionDetails,
    detailsConfirmed,
    saveCollectionDetails,
    collectionTimeLabels,
    type CollectionTime,
  } from "../stores/collectionDetails";

  const details = useStore(collectionDetails);
  const confirmed = useStore(detailsConfirmed);

  let studentName = $details.studentName;
  let collectionTime: CollectionTime = $details.collectionTime;
  let saving = false;
  let error = "";

  async function handleSubmit() {
    error = "";
    if (!studentName.trim()) {
      error = "Please enter your name.";
      return;
    }
    saving = true;
    await saveCollectionDetails({ studentName: studentName.trim(), collectionTime });
    saving = false;
  }

  function handleEdit() {
    detailsConfirmed.set(false);
  }
</script>

{#if $confirmed}
  <!-- Confirmed state — shows summary + edit button -->
  <div class="border-4 border-black bg-yellow-300 p-5 shadow-[6px_6px_0px_0px_#000]">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-xs font-black uppercase tracking-widest">Collection Details</span>
      <button
        on:click={handleEdit}
        class="border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        Edit
      </button>
    </div>
    <p class="font-black uppercase">{$details.studentName}</p>
    <p class="text-sm font-bold">{collectionTimeLabels[$details.collectionTime]}</p>
  </div>
{:else}
  <!-- Entry form -->
  <div class="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_#000]">
    <h3 class="mb-4 text-sm font-black uppercase tracking-widest">Collection Details</h3>

    <div class="mb-4">
      <label for="student-name" class="mb-1 block text-xs font-black uppercase tracking-wide">
        Your Name
      </label>
      <input
        id="student-name"
        type="text"
        bind:value={studentName}
        placeholder="e.g. Bryan Chew"
        class="w-full border-4 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>

    <div class="mb-5">
      <label class="mb-2 block text-xs font-black uppercase tracking-wide">
        Preferred Collection Time
      </label>
      <div class="grid grid-cols-2 gap-2">
        {#each Object.entries(collectionTimeLabels) as [value, label]}
          <button
            type="button"
            on:click={() => (collectionTime = value as CollectionTime)}
            class="border-4 border-black px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none {collectionTime === value ? 'bg-red-400 text-black' : 'bg-white hover:bg-gray-100'}"
          >
            {label}
          </button>
        {/each}
      </div>
    </div>

    {#if error}
      <p class="mb-3 border-2 border-red-500 bg-red-100 px-3 py-2 text-xs font-bold text-red-700">
        {error}
      </p>
    {/if}

    <button
      on:click={handleSubmit}
      disabled={saving}
      class="w-full border-4 border-black bg-black py-3 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_#FF6B6B] transition-all duration-100 hover:shadow-[6px_6px_0px_0px_#FF6B6B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
    >
      {saving ? "Saving..." : "Confirm Details"}
    </button>
  </div>
{/if}
