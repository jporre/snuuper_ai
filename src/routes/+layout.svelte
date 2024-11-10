<script lang="ts">
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import type { Snippet } from 'svelte';
	import '../app.css';
	let { children } : { children: Snippet } = $props();
	import { env } from '$env/dynamic/public';
	let title : string= env.PUBLIC_SITE_DESCRIPTION || 'Sitio en Desarrollo'
</script>
<svelte:head>
	<title>{env.PUBLIC_SITE_DESCRIPTION}</title>
	<meta name="description" content="{env.PUBLIC_SITE_DESCRIPTION}" />
	<meta name="keywords" content="{env.PUBLIC_SITE_KEYWORDS}" />
	<meta name="author" content="bnex" />
	<meta property="og:title" content="{env.PUBLIC_SITE_DESCRIPTION}" />
	<meta property="og:description" content="{env.PUBLIC_SITE_DESCRIPTION}" />
	<meta property="og:image" content="/og_main.png" />
	<meta property="og:url" content="{env.PUBLIC_SITE_URL}" />
	<meta property="og:site_name" content="{env.PUBLIC_SITE_SHORTNAME}" />
	<meta property="og:locale" content="es_CL" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@{env.PUBLIC_SITE_SHORTNAME}" />
	<meta name="twitter:creator" content="@{env.PUBLIC_SITE_SHORTNAME}" />
	<meta name="twitter:title" content="{env.PUBLIC_SITE_DESCRIPTION}" />
	<meta name="twitter:description" content="{env.PUBLIC_SITE_DESCRIPTION}" />
	<meta name="twitter:image" content="/twitter.png" />
	<meta name="twitter:image:alt" content="{env.PUBLIC_SITE_DESCRIPTION}" />
	<link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
	<link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
	<link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
	<link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
	<link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
	<link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
	<link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
	<link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
	<link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<meta name="msapplication-TileColor" content="#ffffff" />
	<meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
	<meta name="theme-color" content="#ffffff" />
</svelte:head>
<ParaglideJS {i18n}>
<div class="w-auto max-w-dvw">
	{@render children()}  
</div>
</ParaglideJS>
