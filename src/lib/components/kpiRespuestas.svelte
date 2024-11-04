<script lang="ts">
	import type { DashboardStats } from '$lib/server/data/tasks';
  import { onMount } from 'svelte';
  let { taskAnswers } : {taskAnswers : DashboardStats} = $props();
  console.log("🚀 ~ taskAnswers:", taskAnswers)

  const stats = taskAnswers;


  </script>
  <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
    <!-- KPIs Generales -->
    <div class="p-4 bg-white rounded-lg shadow">
      <h3 class="mb-2 text-lg font-semibold">Respuestas Totales</h3>
      <p class="text-3xl font-bold text-blue-600">{stats.totalResponses}</p>
    </div>
    
    <div class="p-4 bg-white rounded-lg shadow">
      <h3 class="mb-2 text-lg font-semibold">Tiempo Promedio</h3>
      <p class="text-3xl font-bold text-green-600">
        {stats.averageCompletionTime.toFixed(1)} min
      </p>
    </div>
    
    <div class="p-4 bg-white rounded-lg shadow">
      <h3 class="mb-2 text-lg font-semibold">Créditos Totales</h3>
      <p class="text-3xl font-bold text-purple-600">${stats.totalCredits}</p>
    </div>
    
    <div class="p-4 bg-white rounded-lg shadow">
      <h3 class="mb-2 text-lg font-semibold">Bonos Totales</h3>
      <p class="text-3xl font-bold text-yellow-600">${stats.totalBonos}</p>
    </div>
  </div>

  <!-- Distribución por Estado -->
  <div class="p-4 mt-4 bg-white rounded-lg shadow">
    <h3 class="mb-4 text-lg font-semibold">Distribución por Estado</h3>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      {#each Object.entries(stats.statusDistribution) as [status, count]}
        <div class="p-2 text-center rounded bg-gray-50">
          <p class="text-gray-600">{status}</p>
          <p class="text-2xl font-bold">{count}</p>
          <p class="text-sm text-gray-500">
            {((count / stats.totalResponses) * 100).toFixed(1)}%
          </p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Distribución por Hora -->
  <div class="p-4 mt-4 bg-white rounded-lg shadow">
    <h3 class="mb-4 text-lg font-semibold">Distribución por Hora</h3>
    <div class="grid grid-cols-6 gap-2 md:grid-cols-12">
      {#each stats.timeDistribution as {hour, count}}
        <div class="text-center">
          <div class="p-1 bg-blue-100 rounded">
            <p class="text-sm">{hour}:00</p>
            <p class="font-bold">{count}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Preguntas de Selección Múltiple -->
  <div class="p-4 mt-4 bg-white rounded-lg shadow">
    <h3 class="mb-4 text-lg font-semibold">Resumen Preguntas de Selección</h3>
    {#each Object.entries(stats.multipleChoiceStats) as [question, answers]}
      <div class="mb-6">
        <h4 class="mb-2 font-medium">{question}</h4>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {#each Object.entries(answers) as [answer, count]}
            <div class="p-2 rounded bg-gray-50">
              <p class="text-sm">{answer}</p>
              <p class="font-bold">{count}</p>
              <div class="w-full h-2 bg-gray-200 rounded-full">
                <div
                  class="h-2 bg-blue-600 rounded-full"
                  style="width: {(count / stats.totalResponses) * 100}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
