<script lang="ts">
	import LogoManager from '$lib/images/managerlogo.png?enhanced';
	import fondo from '$lib/images/ilustracionsnupper1.webp';
	let animaBtn = $state(false);
</script>

<div class="flex min-w-full m-2 md:float-right md:min-w-10">
	<enhanced:img class="absolute object-cover object-center top-10 right-10" src={LogoManager} alt="Manager Logo"></enhanced:img>
</div>
<div class="relative px-6 isolate pt-14 lg:px-8">
	<div class="max-w-2xl py-32 mx-auto sm:py-48 lg:py-56">
		<div class="hidden sm:mb-8 sm:flex sm:justify-center">
			<div class="relative px-3 py-1 text-gray-600 rounded-full text-sm/6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
				Quieres ir a manager. <a href="https://manager.snuuper.com" class="font-semibold text-indigo-600">
					<span class="absolute inset-0" aria-hidden="true"></span>
					Ir Ahora
					<span aria-hidden="true">&rarr;</span>
				</a>
			</div>
		</div>
		<div class="text-center">
			<h1 class="text-5xl font-semibold tracking-tight text-gray-900 text-balance sm:text-7xl">Mejora tu experiencia de cliente</h1>
			<p class="mt-8 text-lg font-medium text-gray-500 text-pretty sm:text-xl/8">Miles de ojos al servicio de tus clientes.</p>
			<div class="flex flex-row items-center justify-center mt-10 gap-x-6 ">
				<div class="flex flex-col justify-between  rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ">
				<a href="./CL/dh/tareas" onclick={() => {animaBtn=!animaBtn}} class="flex">{animaBtn ? 'Cargando...' : 'Entrar ... '}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="flex w-10 size-6 {animaBtn ? 'animate-spin' : ''}">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
					  </svg>
					  </a>
					</div>
			</div>
		</div>
	</div>
	<div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden sm:top-[calc(100%-30rem)]" aria-hidden="true" style="background-image: url({fondo})">
		<div
			class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-800 to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)">
		</div>
	</div>
</div>
