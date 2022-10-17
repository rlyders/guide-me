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
	import { guideList } from "./guideDataStore.js";

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

	let currentGuideKey = $guideList && $guideList[0] ? $guideList[0].key : undefined;
	let guideVisible = true;
	let stepData = undefined;

	async function init(guideKey) {
		currentGuideKey = guideKey;
		console.log('currentGuideKey: '+currentGuideKey);
		if (guideKey && $guideList.findIndex((guide) => guide.key === guideKey) >= 0) {
			const res = await fetch(`https://5f86tjn30m.execute-api.us-east-1.amazonaws.com/stage/get-guide/${guideKey}`);
			const resData = await res.json();
			if (res.ok) {
				stepData = resData;
				console.log('guide step: '+JSON.stringify(stepData, null, 2));
			} else {
				throw new Error(resData);
			}
		}
	}

	const useGuide = (guideKey) => {
		guideVisible = false;
		setTimeout(
			() => {
				init(guideKey);
				guideVisible = true;
			}, // FIXME a delay >=500ms is required here otherwise the guide never actually changes
			500
		);
	};

	onMount(async () => {
		init(currentGuideKey);
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
						{#if $guideList}
							<List>
								{#each $guideList as guideListEntry, i}
									<Item
										on:SMUI:action={() =>
											useGuide(guideListEntry.key)}
									>
										<Text>{guideListEntry.title}</Text>
									</Item>
								{/each}							
							</List>
						{:else}
							<div>Loading...</div>
						{/if}
					</Menu>

					<Title
						>{title} <span style="font-size:80%">v{version}</span>: {stepData ? stepData.title : "Select guide..."}</Title
					>
				</Section>
				<Section align="end" toolbar>
					<IconButton 
						href="https://s3.console.aws.amazon.com/s3/buckets/guide-me-guides-dev?region=us-east-1&tab=objects"
						target="_blank"
						class="material-icons" aria-label="Upload"
						>cloud_upload</IconButton
					>
					<IconButton
						href="https://github.com/rlyders/guide-me"
						target="_blank"
						class="material-icons"
						aria-label="Source Code">code</IconButton
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
			{#if stepData && guideVisible}
				<div in:fly={{ y: 200, duration: 750 }} out:fade>
					<Guide
						stepData={stepData}
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
