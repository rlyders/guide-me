<svelte:head>
  <!-- Material Typography -->
	<link rel="stylesheet" href="https://unpkg.com/@material/typography@13.0.0/dist/mdc.typography.css" />
	
	<!-- SMUI -->
	<link rel="stylesheet" href="https://unpkg.com/svelte-material-ui/bare.css" />

    <!-- SMUI Styles -->
    <link rel="stylesheet" href="./smui.css" media="(prefers-color-scheme: light)" />
    />

</svelte:head>

<script lang="ts">
	import { onMount } from "svelte";
	import { guideData } from "./guideDataStore.js";

	import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
	import IconButton from "@smui/icon-button";
	import Banner, { Label } from "@smui/banner";

	import Menu, { MenuComponentDev } from "@smui/menu";
	import List, { Item, Text } from "@smui/list";

	import Guide from "./Guide.svelte";
	import { fade, fly } from "svelte/transition";
	import { version } from "./lib/version";

	let title = "Guide-Me";

	let menu: MenuComponentDev;

	let prominent = false;
	let dense = false;
	let secondaryColor = false;

	let currentGuideIdx = 0;
	let startingStepKey = "which";
	let guideVisible = true;

	function init(guideTitle) {
		currentGuideIdx = $guideData.findIndex((h) => h.title === guideTitle);
		startingStepKey = Object.keys($guideData[currentGuideIdx]).find(
			(k) => k !== "title"
		);
	}

	const useGuide = (guideTitle) => {
		guideVisible = false;
		setTimeout(
			() => {
				init(guideTitle);
				guideVisible = true;
			}, // FIXME a delay >=500ms is required here otherwise the guide never actually changes
			500
		);
	};

	onMount(async () => {
		if ($guideData && currentGuideIdx && $guideData[currentGuideIdx]) {
			console.log("$guideData="+$guideData);
			console.log("currentGuideIdx="+currentGuideIdx);
			console.log("$guideData[currentGuideIdx]="+$guideData[currentGuideIdx]);
			init($guideData[currentGuideIdx].title);
		}
	});

</script>

<div class="flexy">
	<div class="top-app-bar-container flexor">
		<TopAppBar
			variant="static"
			{prominent}
			{dense}
			color={secondaryColor ? "secondary" : "primary"}
		>
			<Row>
				<Section>
					<IconButton
						class="material-icons"
						on:click={() => menu.setOpen(true)}>menu</IconButton
					>
					<Menu bind:this={menu}>
						<List>
							{#if $guideData}
								{#each $guideData as guideInList, i}
									<Item
										on:SMUI:action={() =>
											useGuide(guideInList.title)}
									>
										<Text>{guideInList.title}</Text>
									</Item>
								{/each}
							{/if}
						</List>
					</Menu>

					<Title
						>{title} <span style="font-size:80%">v{version}</span>: {$guideData ? $guideData[currentGuideIdx].title : "Loading..."}</Title
					>
				</Section>
				<Section align="end" toolbar>
					<IconButton class="material-icons" aria-label="Download"
						>file_download</IconButton
					>
					<IconButton
						class="material-icons"
						aria-label="Print this page">print</IconButton
					>
					<IconButton
						class="material-icons"
						aria-label="Bookmark this page">bookmark</IconButton
					>
				</Section>
			</Row>
		</TopAppBar>
		<div class="flexor-content">
			<!-- This `{#if !guideVisible}` for the <Banner> must be before *and in a separate if/then*
          from the `{#if guideVisible}` for the <Guide> so that the Banner doesn't move around when
          the <Guide> fades away -->
			{#if !guideVisible}
				<Banner
					open
					fixed
					mobileStacked
					content$style="max-width: max-content;"
				>
					<Label slot="label">Loading...</Label>
				</Banner>
			{/if}
			{#if $guideData && guideVisible}
				<div in:fly={{ y: 200, duration: 750 }} out:fade>
					<Guide
						guideData={$guideData[currentGuideIdx]}
						{startingStepKey}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.top-app-bar-container {
		width: 100%;
		height: 600px;
		border: 1px solid
			var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
		margin: 0 18px 18px 0;
		background-color: var(--mdc-theme-background, #fff);

		overflow: auto;
		display: inline-block;
	}

	@media (max-width: 480px) {
		.top-app-bar-container {
			margin-right: 0;
		}
	}

	.flexy {
		display: flex;
		flex-wrap: wrap;
	}

	.flexor {
		display: inline-flex;
		flex-direction: column;
	}

	.flexor-content {
		flex-basis: 0;
		height: 0;
		flex-grow: 1;
		overflow: auto;
	}
</style>
