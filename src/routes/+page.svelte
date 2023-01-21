<script lang="ts">
  import Spinner from "../lib/elements/loading/Spinner.svelte";
  import { afterUpdate, onMount, tick } from "svelte";
  import { env } from "$env/dynamic/public";
  import MessageBlock from "$lib/components/MessageBlock.svelte";
  import type { Message } from "$lib/types/Message";
  import { inner, outer } from "$lib/elements/icons/Svelte";
  import { fade, draw, fly, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { expand } from "$lib/animations/Svelte_icon_animate";

  let errorMessage: string = "";
  let connected: string = "Not connected!";
  let isConnected: boolean = false;
  let messages: Message[] = [];
  let wsSend: WebSocket | null = null;

  let userMessage: string = "";
  let userName: string = "";

  let visible = false;

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

    ws.onmessage = async (message) => {
      const messageData: Message = JSON.parse(message.data);
      messages.push(messageData);
      localStorage.setItem("previousMessages", JSON.stringify(messages));
      messages = messages;

      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 200);
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

    const storedUsername = localStorage.getItem("username")
    userName = storedUsername ? storedUsername : ""

    window.onscroll = (event: Event) => {
      if (
        document.documentElement.scrollTop >
        document.documentElement.scrollHeight - screen.height
      )
        visible = true;
      else visible = false;
    };
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

    localStorage.setItem("username", userName);

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

<div class="grid gap-y-2 2xl:mx-96 xl:mx-40 md:mx-20 sm:mx-5 my-10">
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
      <MessageBlock {message} bind:messages={messages} />
    {/each}

    {#if messages.length === 0}
      <div class="flex items-center justify-center my-8">
        <div class="text-xl text-gray-600">There are no messages yet!</div>
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

      <button
        class="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600 inline-block"
        on:click={() => {
          localStorage.removeItem("previousMessages");
          messages = [];
        }}
      >
        <i class="fas fa-trash-alt text-white mr-2" />
        Delete all Chats
      </button>
    </div>

    <form class="flex items-center m-4" on:submit|preventDefault={handleSubmit}>
      <input
        class="rounded-lg h-10 border border-gray-500 px-4 py-2 w-full flex-1 mr-2"
        placeholder="Type your message here..."
        bind:value={userMessage}
      />
      <button
        class="bg-blue-500 text-white rounded-lg h-10 px-4 py-2 hover:bg-blue-400 transition ease-out delay-150"
      >
        <i class="fas fa-paper-plane text-white" />
        Send
      </button>
    </form>

    <div class="bottom-0 text-center p-2">
      {#if visible && messages.length > 0}
        <div class="flex justify-center" transition:slide={{ duration: 1000 }}>
          Built by <a class="mx-1" href="https://github.com/alipw">alifwide</a>
          using
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 103 124"
            class="w-5 mx-1"
          >
            <g out:fade={{ duration: 200 }} opacity="0.2">
              <path
                in:expand={{ duration: 400, delay: 2000, easing: quintOut }}
                style="stroke: #ff3e00; fill: #ff3e00; stroke-width: 50;"
                d={outer}
                class="fill-white"
              />
              <path
                in:draw={{ duration: 2000 }}
                style="stroke:#ff3e00; stroke-width: 1.5"
                d={inner}
              />
            </g>
          </svg>
          Svelte
        </div>
      {/if}
    </div>
  </div>
</div>
