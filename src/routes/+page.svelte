<script lang="ts">
  import Spinner from "../elements/loading/Spinner.svelte";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";

  interface wsMessageInterface {
    message: string;
    sender: string;
  }

  let errorMessage: string = "";
  let connected: string = "Not connected!";
  let status: boolean = false;
  let messages: wsMessageInterface[] = [];
  let wsSend: WebSocket | null = null;

  let userMessage: string = "";
  let userName: string = "";

  const connectWS = (attemptCount = 0) => {
    const ws = new WebSocket(`ws://${env.PUBLIC_API_HOST}/ws`);

    ws.onopen = () => {
      connected = "connected to websocket server!";
      wsSend = ws;
      status = true;
    };

    ws.onmessage = (message) => {
      const messageData: wsMessageInterface = JSON.parse(message.data);
      messages.push(messageData);
      messages = messages;
    };

    ws.onclose = () => {
      connected =
        "Not conected!, reconnecting... attempt count: " + attemptCount;
      status = false;

      setTimeout(() => {
        connectWS(attemptCount + 1);
      }, 1000);
    };
  };

  onMount(() => {
    connectWS();
  });
</script>

<div class="grid m-10 gap-y-2">
  <div class="text-4xl">Welcome to simple chat app</div>

  <div class="flex flex-row text-xl">
    <h2>Websocket connection status:</h2>
    <p
      class="{status
        ? 'text-green-500'
        : 'text-red-500'} font-bold flex flex-row h-10 py-auto"
    >
      {connected}

      {#if status === false}
          <Spinner/>
      {/if}
    </p>
  </div>

  <p class="text-red-500">
    {errorMessage}
  </p>

  <div class="flex flex-row gap-2">
    <p class="text-2xl">My name is :</p>
    <input
      class="rounded-lg h-8 border border-gray-500 px-2 py-1 w-40"
      bind:value={userName}
    />
  </div>

  <ol class="text-3xl w-[600px] bg-gray-300 p-4 rounded-lg ">
    <p>Messages :</p>
    {#each messages as message}
      <li class={"text-xl flex flex-row my-2 bg-white shadow-black shadow-lg py-2 px-2 w-min rounded-lg w-500"}>
        <p class="font-semibold px-2 py-1 ">
          {#if message.sender === userName}
          {"me"}
          {:else}
          {message.sender}
          {/if}
        </p>
        <p class="font-semibold px-1 py-1">:</p>
        <p class=" font-semibold px-2 py-1">{message.message}</p>
      </li>
    {/each}
  </ol>

  <form
    on:submit={(event) => {
      event.preventDefault();

      if (!userName) {
        errorMessage = "Please set your username first";
        return;
      }

      if (!status) {
        errorMessage =
          "Unable to connect to the server, please try again sometime";
        return;
      }

      errorMessage = "";
      const dataToSend = {
        message: userMessage,
        sender: userName,
      };

      wsSend?.send(JSON.stringify(dataToSend));
      document.getElementById("inputText")?.scrollIntoView()
      userMessage = "";
    }}
  >
    <input
      class="rounded-lg h-8 border border-gray-500 px-2 py-1 "
      id="inputText"
      bind:value={userMessage}
    />
  </form>
</div>
