<script lang="ts">
  import { page } from '$app/state'
  import { marked } from 'marked'
  import { SSE } from 'sse.js'
  import { quintOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  let isOpen = $state(false)
  let { userName, context } = $props<{ userName: string; context: any }>()

  let taskData = context
  //console.log("🚀 ~ contextString:", taskData)
  const country = 'CL';
  let Conversation = $state<{ content: string; role: string; timestamp: Date }[]>([
   // { content: systemPrompt, role: 'system', timestamp: new Date() },
    { content: `Hola ${userName}! ¿Cómo te puedo ayudar?`, role: 'assistant', timestamp: new Date() },
  ])
  let newMessage = $state('')
  let answer = $state('')
  let messagesContainer: HTMLElement | null = $state(null)
  let isStreaming = $state(false)
  // This effect runs when messages change or during streaming
  $effect(() => {
    if (messagesContainer && (Conversation.length > 0 || isStreaming)) {
      scrollToBottom()
    }
  })
  // Helper function to scroll to bottom
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }
  function toggleChat() {
    isOpen = !isOpen
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('msginputfield')?.focus()
      }, 300) // Delay focus until animation completes
    }
  }
  function sendMessage() {
    if (newMessage.trim()) {
      let addToConversation = { content: newMessage, role: 'user', timestamp: new Date()  }
      Conversation = [...Conversation, addToConversation]
     // messages = [...messages, { content: newMessage, role: 'user', timestamp: new Date() }]
      let origen = page.url.pathname
      const eventSource = new SSE('/openai', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify({  Conversation, origen: origen, country: country, context: {taskId: taskData._id} }) })
       Conversation = [...Conversation, { role: 'assistant', content: '', timestamp: new Date() }]
      answer = ''
      isStreaming = true
      eventSource.addEventListener('error', handleError)
      eventSource.addEventListener('message', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          if (data.choices[0].finish_reason === 'stop') {
            answer = ''
            isStreaming = false
            return
          }
          const { content } = data.choices[0].delta
          answer = (answer ?? '') + content
          Conversation[Conversation.length - 1].content = answer
          // Trigger scroll on each content update
          scrollToBottom()
        } catch (err) {
          handleError(err)
          isStreaming = false
        }
      })
      eventSource.stream()
    }
    newMessage = ''
    document.getElementById('msginputfield')?.focus()
  }
  function handleError<T>(err: T) {
    console.error(err)
    isStreaming = false
  }
</script>

<div class="fixed right-4 bottom-4 z-50 flex h-screen items-end rounded-2xl drop-shadow-2xl">
  
  {#if !isOpen}
    <button onclick={toggleChat} class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-white shadow-lg transition-transform hover:scale-105 hover:cursor-pointer hover:shadow-xl active:scale-95" aria-label="Open chat">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
      </svg>
    </button>
  {:else}
    <div transition:fly={{ y: 10, duration: 600, easing: quintOut }} class="flex h-9/10 w-[650px] max-w-[90vw] flex-col rounded-lg border border-slate-200 bg-slate-100/80 shadow-2xl backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-800/50">
      <!-- Chat Header -->
      <div class="flex items-center justify-between rounded-t-lg bg-blue-900/80 p-4 text-white backdrop-blur-xl">
        <div>
          <h3 class="font-thin">Soporte</h3>
          <p class="text-sm font-thin opacity-90">¿En qué te podemos ayudar?</p>
        </div>
        <button onclick={toggleChat} class="hover:bg-opacity-20 rounded-full p-2 transition-colors hover:bg-black" aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <!-- Chat Messages -->
      <div bind:this={messagesContainer} class="flex-1 space-y-4 overflow-y-auto scroll-smooth p-4">
        {#each Conversation as message}
          {#if message.role !== 'system'}
            <div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div class={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'}`}>
                {@html marked(message.content)}
                <div class="mt-1 text-xs opacity-50">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
      <!-- Chat Input -->
      <div class="border-base-200 border-t bg-blue-100 p-4">
        <form onsubmit={sendMessage} class="flex gap-2">
          <input id="msginputfield" name="msginputfield" type="text" bind:value={newMessage} placeholder="Escribe tu mensaje..." autocomplete="off" class="w-full rounded-lg border bg-blue-50 px-4 py-2 text-black focus:bg-blue-100 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
          <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .scroll-smooth {
    scroll-behavior: smooth;
  }
</style>
