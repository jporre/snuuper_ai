<script lang="ts">
  import type { DashboardStats } from '$lib/server/data/Mongotypes'
  import { onMount } from 'svelte'

  let { taskAnswers } : { taskAnswers : DashboardStats } = $props();
  //console.log("🚀 ~ taskAnswers:", taskAnswers);
 

  const stats = taskAnswers;
  //console.log("🚀 ~ stats:", stats)
  const basicStats = stats.basicStats[0];
  const totalResponses = basicStats.totalResponses;
  const totalCredits = basicStats.totalCredits;
  const totalBonos = basicStats.totalBonos;
  const averageCompletionTime = 0; //basicStats.avgCompletionTime ?? (basicStats.avgCompletionTime).toFixed(2);
  const statusDistribution = stats.statusDistribution;
  const timeDistribution = stats.timeDistribution;
  const multipleChoiceStats = stats.multipleChoiceStats;
  const SelectOneChoiceStats = stats.SelectOneChoiceStats;
  const yesNoStats = stats.yesNoStats;
  const priceListStats = stats.priceListStats;
  const scaleStats = stats.scaleStats;
  const fileStats = stats.fileStats;

import Chart from 'chart.js/auto'
 

// onMount(() => {
//     const ctx = document.getElementById('timeDistributionChart').getContext('2d');
//     new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: timeDistribution.map(({ hour }) => `${hour}:00`),
//         datasets: [{
//           label: 'Respuestas por Hora',
//           data: timeDistribution.map(({ count }) => count),
//           borderColor: 'rgba(75, 192, 192, 1)',
//           backgroundColor: 'rgba(75, 192, 192, 0.2)',
//           fill: true,
//           height: 200,
//           tension: 0.1
//         }]
//       },
//       options: {
//         responsive: true,
//         scales: {
//           x: {
//             title: {
//               display: true,
//               text: 'Hora del Día'
//             }
//           },
//           y: {
//             title: {
//               display: true,
//               text: 'Número de Respuestas'
//             }
//           }
//         }
//       }
//     });
//   });

  onMount(() => {
    const canvasElement = document.getElementById('timeDistributionChart') as HTMLCanvasElement | null;
    if (canvasElement) {
      console.log("hola")
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: timeDistribution.map(({ hour }) => `${hour}:00`),
            datasets: [{
              label: 'Respuestas por Hora',
              data: timeDistribution.map(({ count }) => count),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Hora del Día'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Número de Respuestas'
                }
              }
            }
          }
        });
      }
    }
  });

  onMount(() => {
    multipleChoiceStats.forEach(({ pregunta, respuestas }) => {
      const canvasId = `${pregunta.replace(/\s+/g, '-').toLowerCase()}-chart`;
      const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement | null;
      if (canvasElement) {
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: Object.keys(respuestas),
              datasets: [{
                label: 'Respuestas',
                data: Object.values(respuestas),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Opciones'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Número de Respuestas'
                  },
                  beginAtZero: true
                }
              }
            }
          });
        }
      }
    });
  });

  onMount(() => {
    SelectOneChoiceStats.forEach(({ pregunta, stats: choiceStats }) => { // Renombrado 'stats' a 'choiceStats' para evitar conflicto con la variable 'stats' externa
      const canvasId = `${pregunta.replace(/\s+/g, '-').toLowerCase()}-pie-chart`;
      const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement | null;
      if (canvasElement) {
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(choiceStats), // Corrected to use choiceStats
          datasets: [{
            data: Object.values(choiceStats), // Corrected to use choiceStats
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: { // Added labels configuration for dark mode
                color: document.documentElement.classList.contains('dark') ? 'rgb(203 213 225)' : 'rgb(55 65 81)' // slate-300 for dark, gray-700 for light
              }
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  const total = tooltipItem.dataset.data.reduce((acc, val) => acc + val, 0);
                  const value : number = Number(tooltipItem.raw);
                  const percentage = ((value / total) * 100).toFixed(2);
                  return `${tooltipItem.label}: ${value} (${percentage}%)`;
                }
              },
              titleColor: document.documentElement.classList.contains('dark') ? 'rgb(203 213 225)' : 'rgb(55 65 81)', // Added for dark mode
              bodyColor: document.documentElement.classList.contains('dark') ? 'rgb(203 213 225)' : 'rgb(55 65 81)' // Added for dark mode
            }
          }
        }
      });
    }
  }
    });

    // Update chart options dynamically if theme changes
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          Chart.instances.forEach(instance => {
            const isDark = document.documentElement.classList.contains('dark');
            const newColor = isDark ? 'rgb(203 213 225)' : 'rgb(55 65 81)'; // slate-300 for dark, gray-700 for light
            if (instance.options.scales?.x?.title) instance.options.scales.x.title.color = newColor;
            if (instance.options.scales?.y?.title) instance.options.scales.y.title.color = newColor;
            if (instance.options.scales?.x?.ticks) instance.options.scales.x.ticks.color = newColor;
            if (instance.options.scales?.y?.ticks) instance.options.scales.y.ticks.color = newColor;
            if (instance.options.plugins?.legend?.labels) instance.options.plugins.legend.labels.color = newColor;
            if (instance.options.plugins?.tooltip) {
                instance.options.plugins.tooltip.titleColor = newColor;
                instance.options.plugins.tooltip.bodyColor = newColor;
            }
            instance.update();
          });
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
     // Cleanup observer on component destroy
    return () => {
        observer.disconnect();
        Chart.instances.forEach(instance => instance.destroy());
        Chart.instances = {}; // Clear instances
    };
  });
</script>

<!-- KPIs Generales -->
<div class="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
  <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
    <h3 class="mb-2 text-lg font-semibold text-gray-700 dark:text-slate-300">Respuestas Totales</h3>
    <p class="text-3xl font-bold text-blue-600 dark:text-sky-400">{basicStats?.totalResponses || 0}</p>
  </div>
  <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
    <h3 class="mb-2 text-lg font-semibold text-gray-700 dark:text-slate-300">Tiempo Promedio</h3>
    <p class="text-3xl font-bold text-green-600 dark:text-emerald-400">{basicStats?.avgCompletionTime?.toFixed(2) || 0} min</p>
  </div>
  <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
    <h3 class="mb-2 text-lg font-semibold text-gray-700 dark:text-slate-300">Créditos Totales</h3>
    <p class="text-3xl font-bold text-purple-600 dark:text-violet-400">${basicStats?.totalCredits || 0}</p>
  </div>
  <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
    <h3 class="mb-2 text-lg font-semibold text-gray-700 dark:text-slate-300">Bonos Totales</h3>
    <p class="text-3xl font-bold text-yellow-600 dark:text-amber-400">${basicStats?.totalBonos || 0}</p>
  </div>
</div>

<!-- Distribución por Estado -->
<!-- <div class="p-4 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Distribución por Estado</h3>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    {#each statusDistribution as { _id: status, count }}
      <div class="p-2 text-center rounded bg-gray-50 dark:bg-slate-700">
        <p class="text-gray-600 dark:text-slate-400">{status}</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-slate-200">{count}</p>
        <p class="text-sm text-gray-500 dark:text-slate-500">{((count / totalResponses) * 100).toFixed(2)}%</p>
      </div>
    {/each}
  </div>
</div> -->

<!-- Gráfico de Línea para Distribución por Hora -->
<div class="p-4 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Distribución por Hora (Gráfico de Línea)</h3>
  <canvas id="timeDistributionChart"></canvas>
</div>
<!-- Distribución por Hora -->
<div class="p-4 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Distribución por Hora</h3>
  <div class="grid grid-cols-6 gap-2 md:grid-cols-12">
    {#each timeDistribution as { hour, count }}
      <div class="text-center">
        <div class="p-1 bg-blue-100 dark:bg-sky-700 rounded">
          <p class="text-sm text-blue-700 dark:text-sky-200">{hour}:00</p>
          <p class="font-bold text-blue-800 dark:text-sky-100">{count}</p>
        </div>
      </div>
    {/each}
  </div>
</div>



<!-- Preguntas de Selección Múltiple -->
<div class="p-4 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Preguntas de Selección Múltiple</h3>
  {#each multipleChoiceStats as { pregunta, respuestas }}
    <div class="h-full mb-6">
      <h4 class="mb-2 font-medium text-gray-800 dark:text-slate-200">{pregunta}</h4>
      <canvas id="{pregunta.replace(/\s+/g, '-').toLowerCase()}-chart"></canvas>
    </div>
  {/each}
</div>

<!-- Preguntas de Selección Única -->
<div class="p-4 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Preguntas de Selección Única</h3>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
    {#each SelectOneChoiceStats as { pregunta, stats }}
      <div class="mb-6 max-h-96 ">
        <h4 class="mb-2 font-medium text-gray-800 dark:text-slate-200">{pregunta}</h4>
        <canvas id="{pregunta.replace(/\s+/g, '-').toLowerCase()}-pie-chart"></canvas>
      </div>
    {/each}
  </div>
</div>

<!-- Preguntas Sí/No con Barra de Porcentaje -->
<div class="p-4 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Preguntas Sí/No (Barra de Porcentaje)</h3>
  {#each yesNoStats as { pregunta, stats: answers }}
    <div class="mb-6">
      <h4 class="mb-2 font-medium text-gray-800 dark:text-slate-200">{pregunta}</h4>
      <div class="relative w-full h-6 bg-gray-200 dark:bg-slate-700 rounded-full">
        <div
          class="absolute top-0 left-0 h-full bg-green-500 dark:bg-emerald-600 rounded-l-full"
          style="width: {(answers.yes / (answers.yes + answers.no)) * 100}%"
        ></div>
        <div
          class="absolute top-0 right-0 h-full bg-red-500 dark:bg-rose-600 rounded-r-full"
          style="width: {(answers.no / (answers.yes + answers.no)) * 100}%"
        ></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="text-green-700 dark:text-emerald-300">{answers.yes || 0} Sí</span>
        <span class="text-red-700 dark:text-rose-300">{answers.no || 0} No</span>
      </div>
    </div>
  {/each}
</div>

<!-- Estadísticas de Precios -->
 {#if priceListStats.length > 0}
<div class="p-4 mt-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Estadísticas de Precios</h3>
  {#each priceListStats as { pregunta, stats: productos }}
    <div class="mb-6">
      <h4 class="mb-2 font-medium text-gray-800 dark:text-slate-200">{pregunta}</h4>
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {#each Object.entries(productos) as [producto, { minimo, promedio, maximo, mediciones }]}
          <div class="p-2 rounded bg-gray-50 dark:bg-slate-700">
            <p class="text-sm font-semibold text-gray-700 dark:text-slate-300">{producto}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400">Min: {minimo}, Prom: {promedio.toFixed(2)}, Max: {maximo}, Med: {mediciones}</p>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
{/if}

<!-- Estadísticas de Escala -->
 {#if scaleStats.length > 0}
<div class="p-4 mt-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Estadísticas de Escala</h3>
  {#each scaleStats as { pregunta, stats }}
    <div class="mb-6">
      <h4 class="font-medium text-gray-800 dark:text-slate-200">{pregunta}</h4>
      <p class="text-xl font-bold text-blue-600 dark:text-sky-400">{(stats.promedio).toFixed(2)}</p>
    </div>
  {/each}
</div>
{/if}
<!-- Estadísticas de Archivos -->
<div class="p-4 mt-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700">
  <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Archivos Subidos</h3>
  <div class="grid grid-cols-2 gap-4 p-2 m-2 mt-4 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700 md:grid-cols-3 lg:grid-cols-4">
  {#each fileStats as pp}
    <div class="p-1 m-1 mb-6">
      <h4 class="font-medium text-gray-800 dark:text-slate-200">{pp.pregunta}</h4>
      <p class="text-xl font-bold text-purple-600 dark:text-violet-400">{pp.stats.total}</p>
    </div>
  {/each}
  </div>

</div>