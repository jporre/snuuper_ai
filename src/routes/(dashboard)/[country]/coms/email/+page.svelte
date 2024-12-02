<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#await data.campanias}
 Cargando...
    
{:then campanias}
    {#each campanias as campania}
        <div>
            <h2>{campania.nombre}</h2>
        </div>
    {/each}
{:catch error}
    <p>{error.message}</p> 
{/await}