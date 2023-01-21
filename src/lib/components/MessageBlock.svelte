<script lang="ts">
  import type { Message } from "$lib/types/Message";

  export let message: Message;
</script>

<div class="bg-gray-100 p-4 rounded-md my-2">
  <div class="text-lg font-medium">{message.sender}</div>
  <div class="text-base">{message.message}</div>
  <div class="text-xs text-gray-600">{message.timestamp ? message.timestamp : "no date"}</div>
</div>