<script lang="ts">
	import type { PageData } from "./$types";

    let { data }: { data: PageData} = $props();
    const TaskData = data.td;
    // console.log(TaskData[0]);
   
</script>
{#await data.td}
  <div class="flex justify-center items-center min-h-[200px]">
    <div class="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    <span class="ml-3 text-gray-600">Cargando datos...</span>
  </div>
{:then td}
  <div class="p-4 mx-auto max-w-7xl">
    <ol role="list" class="bg-white divide-y divide-gray-600 rounded-lg shadow">
      {#each td as TaskData}
      {#if (TaskData.timestampStart > "2024-09-15T23:00:48.821Z") && (TaskData.userRole === 'user')}
        <li class="p-6 transition-colors duration-200 hover:bg-gray-50">
          <!-- Información principal de la tarea -->
          <div class="mb-4">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-500">ID Tarea</span>
                <p class="text-gray-900">{TaskData.taskId}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-500">ID Dirección</span>
                <p class="text-gray-900">{TaskData.addressId}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-500">ID Usuario</span>
                <p class="text-gray-900">{TaskData.userId}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-500">Inicio</span>
                <p class="text-gray-900">{TaskData.timestampStart}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-500">Conteo</span>
                <p class="text-gray-900">{TaskData.count}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-500">Usuario</span>
                <p class="text-gray-900">{TaskData.userName} - {TaskData.userRole}</p>
              </div>
            </div>
          </div>

          <!-- Sección de documentos -->
          <div class="mt-6">
            <h4 class="mb-4 text-lg font-medium text-gray-900">Documentos</h4>
            <div class="p-4 rounded-lg bg-gray-50">
              {#each TaskData.documents as doc}
                <div class="py-4 border-b border-gray-300 last:border-0">
                  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div class="space-y-1">
                      <span class="text-sm font-medium text-gray-500">ID Respuesta</span>
                      <a href="https://manager.snuuper.com/#/pages/moderation/{doc.TaskAnswerId}" target="_blank" class="text-blue-400 hover:underline">{doc.TaskAnswerId}</a>
                     
                    </div>
                    <div class="space-y-1">
                      <span class="text-sm font-medium text-gray-500">Estado</span>
                      <p class="text-gray-900">
                        <span class="px-2 py-1 text-sm rounded-full {
                          doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }">
                          {doc.status}
                        </span>
                      </p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-sm font-medium text-gray-500">Inicio</span>
                      <p class="text-gray-900">{doc.timestampStart}</p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-sm font-medium text-gray-500">Fin</span>
                      <p class="text-gray-900">{doc.timestampStop}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </li>
        {/if}
      {/each}
    </ol>
  </div>
{:catch error}
  <div class="p-4 text-red-700 rounded-lg bg-red-50">
    <p class="font-medium">Error: {error.message}</p>
  </div>
{/await}