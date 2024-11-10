<script lang="ts">
  import type { DashboardStats } from '$lib/server/data/tasks';
  import { onMount } from 'svelte';

  let { taskAnswers } : { taskAnswers : DashboardStats } = $props();
  //console.log("🚀 ~ taskAnswers:", taskAnswers);

  const stats = taskAnswers.estadisticas;
//  console.log("🚀 ~ stats:", stats)

  const basicStats = stats.basicStats;
  const totalResponses = basicStats[0].totalResponses;
  const totalCredits = basicStats[0].totalCredits;
  const totalBonos = basicStats[0].totalBonos;
  const averageCompletionTime = (basicStats[0].avgCompletionTime / 60).toFixed(2);
  const statusDistribution = stats.statusDistribution;
  const timeDistribution = stats.timeDistribution;
  const multipleChoiceStats = stats.multipleChoiceStats;
  const yesNoStats = stats.yesNoStats;
  const priceListStats = stats.priceListStats;
  const scaleStats = stats.scaleStats;
  const fileStats = stats.fileStats;


</script>

<!-- KPIs Generales -->
<div class="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
  <div class="p-4 bg-white rounded-lg shadow">
    <h3 class="mb-2 text-lg font-semibold">Respuestas Totales</h3>
    <p class="text-3xl font-bold text-blue-600">{totalResponses}</p>
  </div>
  <div class="p-4 bg-white rounded-lg shadow">
    <h3 class="mb-2 text-lg font-semibold">Tiempo Promedio</h3>
    <p class="text-3xl font-bold text-green-600">{averageCompletionTime} min</p>
  </div>
  <div class="p-4 bg-white rounded-lg shadow">
    <h3 class="mb-2 text-lg font-semibold">Créditos Totales</h3>
    <p class="text-3xl font-bold text-purple-600">${totalCredits}</p>
  </div>
  <div class="p-4 bg-white rounded-lg shadow">
    <h3 class="mb-2 text-lg font-semibold">Bonos Totales</h3>
    <p class="text-3xl font-bold text-yellow-600">${totalBonos}</p>
  </div>
</div>

<!-- Distribución por Estado -->
<div class="p-4 mt-2 bg-white rounded-lg shadow">
  <h3 class="mb-4 text-lg font-semibold">Distribución por Estado</h3>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    {#each statusDistribution as { _id: status, count }}
      <div class="p-2 text-center rounded bg-gray-50">
        <p class="text-gray-600">{status}</p>
        <p class="text-2xl font-bold">{count}</p>
        <p class="text-sm text-gray-500">{((count / totalResponses) * 100).toFixed(2)}%</p>
      </div>
    {/each}
  </div>
</div>

<!-- Distribución por Hora -->
<div class="p-4 mt-2 bg-white rounded-lg shadow">
  <h3 class="mb-4 text-lg font-semibold">Distribución por Hora</h3>
  <div class="grid grid-cols-6 gap-2 md:grid-cols-12">
    {#each timeDistribution as { hour, count }}
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
<div class="p-4 mt-2 bg-white rounded-lg shadow">
  <h3 class="mb-4 text-lg font-semibold">Preguntas de Selección Múltiple</h3>
  {#each multipleChoiceStats as { pregunta, respuestas }}
    <div class="mb-6 h-full">
      <h4 class="mb-2 font-medium">{pregunta}</h4>
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {#each Object.entries(respuestas) as [answer, count]}
          <div class="p-2 rounded bg-gray-50">
            <p class="text-sm">{answer}</p>
            <p class="font-bold">{count}</p>
            <div class="w-full h-2 bg-gray-200 rounded-full">
              <div
                class="h-2 bg-blue-600 rounded-full"
                style="width: {(count / totalResponses) * 100}%"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<!-- Preguntas Sí/No -->
<div class="p-4 mt-2 bg-white rounded-lg shadow">
  <h3 class="mb-4 text-lg font-semibold">Preguntas Sí/No</h3>
  {#each yesNoStats as { pregunta, stats: answers }}
    <div class="mb-6 grid grid-cols-2">
      <h4 class="mb-2 font-medium">{pregunta}</h4>
      <div class="grid grid-cols-2 gap-4 ml-3">
        <div class="p-1 rounded bg-green-50">
          <div class="flex items-center justify-between">
            <span class="font-medium text-green-700">Sí</span>
            <span class="text-2xl font-bold text-green-700">{answers.yes || 0}</span>
          </div>
        </div>
        <div class="p-1 rounded bg-red-50">
          <div class="flex items-center justify-between">
            <span class="font-medium text-red-700">No</span>
            <span class="text-2xl font-bold text-red-700">{answers.no || 0}</span>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Estadísticas de Precios -->
 {#if priceListStats.length > 0}
<div class="p-4 mt-4 bg-white rounded-lg shadow">
  <h3 class="mb-4 text-lg font-semibold">Estadísticas de Precios</h3>
  {#each priceListStats as { pregunta, stats: productos }}
    <div class="mb-6">
      <h4 class="mb-2 font-medium">{pregunta}</h4>
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {#each Object.entries(productos) as [producto, { minimo, promedio, maximo, mediciones }]}
          <div class="p-2 rounded bg-gray-50">
            <p class="text-sm font-semibold">{producto}</p>
            <p class="text-xs text-gray-500">Min: {minimo}, Prom: {promedio.toFixed(2)}, Max: {maximo}, Med: {mediciones}</p>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
{/if}

<!-- Estadísticas de Escala -->
 {#if scaleStats.length > 0}
<div class="p-4 mt-4 bg-white rounded-lg shadow">
  <h3 class="mb-4 text-lg font-semibold">Estadísticas de Escala</h3>
  {#each scaleStats as { pregunta, stats }}
    <div class="mb-6">
      <h4 class="font-medium">{pregunta}</h4>
      <p class="text-xl font-bold text-blue-600">{(stats.promedio).toFixed(2)}</p>
    </div>
  {/each}
</div>
{/if}
<!-- Estadísticas de Archivos -->
<div class="p-4 mt-4 bg-white rounded-lg shadow ">
  <h3 class="mb-4 text-lg font-semibold">Archivos Subidos</h3>
  <div class="grid grid-cols-2 gap-4 p-2 m-2 mt-4 bg-white rounded-lg shadow md:grid-cols-3 lg:grid-cols-4">
  {#each fileStats as pp}
    <div class="p-1 m-1 mb-6">
      <h4 class="font-medium">{pp.pregunta}</h4>
      <p class="text-xl font-bold text-purple-600">{pp.stats.total}</p>
    </div>
  {/each}
  </div>

</div>