
<script lang="ts">
	import type { SpinnerTypes } from '$lib/spinners/types/spinner.type';
	import { durationUnitRegex, range } from '$lib/spinners/utils';
	export let color: SpinnerTypes['color'] = '#FF3E00';
	export let unit: SpinnerTypes['unit'] = 'px';
	export let duration: SpinnerTypes['duration'] = '2s';
	export let size: SpinnerTypes['size'] = '60';
	export let pause: SpinnerTypes['pause'] = false;

	let durationUnit: string = duration.match(durationUnitRegex)?.[0] ?? 's';
	let durationNum: string = duration.replace(durationUnitRegex, '');
</script>

<div class="wrapper" style="--size: {size}{unit}; --color: {color}; --duration: {duration};">
	<div class="spinner" class:pause-animation={pause}>
		{#each range(2, 0) as version}
			<div
				class="dot"
				class:pause-animation={pause}
				style="animation-delay: {version === 1
					? `${+durationNum / 2}${durationUnit}`
					: '0s'}; {version === 1 ? 'bottom: 0;' : ''} {version === 1 ? 'top: auto;' : ''}"
			></div>
		{/each}
	</div>
</div>

<style>
	.wrapper {
		height: var(--size);
		width: var(--size);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.spinner {
		height: var(--size);
		width: var(--size);
		animation: rotate var(--duration) infinite linear;
	}
	.dot {
		width: 60%;
		height: 60%;
		display: inline-block;
		position: absolute;
		top: 0;
		background-color: var(--color);
		border-radius: 100%;
		animation: bounce var(--duration) infinite ease-in-out;
	}
	.pause-animation {
		animation-play-state: paused;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes bounce {
		0%,
		100% {
			transform: scale(0);
		}
		50% {
			transform: scale(1);
		}
	}
</style>
