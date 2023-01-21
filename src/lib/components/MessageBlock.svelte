<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import type { Message } from "$lib/types/Message";

  export let message: Message;
  export let messages: Message[];
  let deleted = "";

  function deleteMessage(message: Message) {
    messages = [...messages.filter((item) => message !== item)];
  }
</script>

<div
  class={`bg-gray-100 p-4 rounded-md my-1 flex justify-between`}
  transition:fade|local
>
  <div>
    <div class="text-lg font-medium">{message.sender}</div>
    <div class="text-base">{message.message}</div>
    <div class="text-xs text-gray-600">
      {message.timestamp ? message.timestamp : "no date"}
    </div>
  </div>
  <button
    class="text-red-500 hover:text-red-600"
    on:click={() => {
      deleteMessage(message);
    }}
  >
    <i class="fas fa-trash-alt" />
  </button>
</div>
