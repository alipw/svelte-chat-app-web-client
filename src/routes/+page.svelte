<script lang="ts">
  import Spinner from "../lib/elements/loading/Spinner.svelte";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";
  import MessageBlock from "$lib/components/MessageBlock.svelte";
  import type { Message } from "$lib/types/Message";

  let errorMessage: string = "";
  let connected: string = "Not connected!";
  let isConnected: boolean = false;
  let messages: Message[] = [];
  let wsSend: WebSocket | null = null;

  let userMessage: string = "";
  let userName: string = "";

  const connectWS = (attemptCount = 0) => {
    let API_WS_URL = "";

    if (env.PUBLIC_USE_SSL === "false") {
      API_WS_URL = `ws://${env.PUBLIC_API_HOST}/ws`;
    } else {
      API_WS_URL = `wss://${env.PUBLIC_API_HOST}/ws`;
    }

    const ws = new WebSocket(API_WS_URL);

    ws.onopen = () => {
      connected = "connected";
      wsSend = ws;
      isConnected = true;
    };

    ws.onmessage = (message) => {
      const messageData: Message = JSON.parse(message.data);
      messages.push(messageData);
      localStorage.setItem("previousMessages", JSON.stringify(messages));
      messages = messages;
    };

    ws.onclose = () => {
      connected =
        "Not conected!, reconnecting... attempt count: " + attemptCount;
      isConnected = false;

      setTimeout(() => {
        connectWS(attemptCount + 1);
      }, 1000);
    };
  };

  onMount(() => {
    const previousMessages = localStorage.getItem("previousMessages");
    messages = JSON.parse(previousMessages ? previousMessages : "[]");
    connectWS();
  });

  const handleSubmit = (event: Event) => {
    event.preventDefault();

    if (!userName) {
      errorMessage = "Please set your username first";
      return;
    }

    if (!isConnected) {
      errorMessage =
        "Unable to connect to the server, please try again sometime";
      return;
    }

    errorMessage = "";
    const dataToSend: Message = {
      message: userMessage,
      sender: userName,
      timestamp: new Date().toString(),
    };

    wsSend?.send(JSON.stringify(dataToSend));
    document.getElementById("inputText")?.scrollIntoView();
    userMessage = "";
  };
</script>

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
  integrity="sha512-+4zCK9k+qNFUR5X+cKL9EIR+ZOhtIloNl9GIKS57V1MyNsYpYcUrUeQc9vNfzsWfV28IaLL3i96P9sdNyeRssA=="
  crossorigin="anonymous"
/>

<div class="grid gap-y-2 2xl:mx-96 xl:mx-40 md:mx-20 sm:mx-5">
  <div class="grid grid-cols-1 gap-y-4 m-10">
    <div class="text-4xl font-medium text-center">
      Welcome to simple chat app
    </div>

    <div class="flex flex-row items-center h-12 justify-center">
      <p
        class="text-xl font-medium {isConnected
          ? 'text-green-500'
          : 'text-red-500'}"
      >
        {connected}
      </p>
      {#if isConnected === false}
        <div class="spinner m-2">
          <div class="bounce1" />
          <div class="bounce2" />
          <div class="bounce3" />
        </div>
      {/if}
    </div>

    <p class="text-2xl">Messages :</p>
    {#each messages as message}
      <MessageBlock {message} />
    {/each}

    {#if messages.length === 0}
      <div class="flex items-center justify-center my-8">
        <div class="text-xl text-gray-600">There is no message yet!</div>
      </div>
    {/if}
  </div>

  <div class="flex flex-col items-center">
    <div class="flex flex-row items-center gap-2">
      <p class="text-xl font-medium text-blue-500">My name is :</p>
      <input
        class="rounded-lg h-8 border border-blue-500 px-2 py-1 w-40"
        bind:value={userName}
      />
    </div>

    <form class="flex items-center m-4" on:submit|preventDefault={handleSubmit}>
      <input
        class="rounded-lg h-10 border border-gray-500 px-4 py-2 w-full flex-1 mr-2"
        placeholder="Type your message here..."
        bind:value={userMessage}
      />
      <button class="bg-blue-500 text-white rounded-lg h-10 px-4 py-2 hover:bg-blue-400 transition ease-out delay-150">
        <i class="fas fa-paper-plane text-white" />
        Send
      </button>
    </form>
  </div>
</div>
