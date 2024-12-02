<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import { enhance } from '$app/forms';
	import type { detalleCampania } from '$lib/server/data/pgtypes';


    let { data, form }: { data: PageData, form: ActionData } = $props();
    let ListaCampania: detalleCampania = $state([]);

    $effect(() => {
        if (form) {
            ListaCampania = form?.dt || [];
        }
    });
    
</script>
{#await data.campanias}
 Cargando...
    
{:then campanias}
<form method="POST" use:enhance class="flex flex-row justify-between w-full mx-auto mt-3 gap-x-3 ">
    <div class="flex w-full mb-4 ">
        <label for="campaniaId" class="flex w-full mb-2 text-sm font-bold text-gray-700">Selecciona la campaña que desea revisar</label>
        <select id="campaniaId" name="campaniaId" class="flex w-full select select-secondary">
            {#each campanias as campania}
                <option value="{campania.id_linea}">{campania.nombre}</option>
            {/each}
        </select>
    </div>
    <button type="submit" class="btn btn-outline btn-primary">Obtener</button>
</form>
{:catch error}
    <p>{error.message}</p> 
{/await}

<div>
    hola
</div>
{#if ListaCampania.length > 0}
    <div class="mt-4">
        <h2 class="text-xl font-bold">Campañas</h2>
        <ul>
            {#each ListaCampania as campania}
                <li>{campania.nombre_completo}</li>
            {/each}
        </ul>
    </div>
{/if}