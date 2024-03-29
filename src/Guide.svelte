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
    import { fade, fly } from 'svelte/transition';
    import Card, { Content, Actions } from '@smui/card';
    import Button from '@smui/button';
    import { UserChoice } from './UserChoice';
    import IconButton from '@smui/icon-button';
    import SegmentedButton, { Segment } from '@smui/segmented-button';
    import { Label } from '@smui/common';
    import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
    import type { SnackbarComponentDev } from '@smui/snackbar';
    import Snackbar from '@smui/snackbar';

    export let guideData;
    export let startingStepKey;

    let startingUserChoice;
    let userChoices: UserChoice[];
    let currentUserChoice: UserChoice;

    $: { 
        startingUserChoice = new UserChoice({path: `/${startingStepKey}`, stepKey: startingStepKey}) 
        userChoices = [startingUserChoice];
        currentUserChoiceIdx = 0;
    };
    startingStepKey = startingStepKey;

    let currentUserChoiceIdx = 0;
    let sendVia;
    let sendViaChoice;
    let currentGuideStep;
    let selected;

    $: currentUserChoice = userChoices[currentUserChoiceIdx];
    $: currentGuideStep = currentUserChoice && currentUserChoice.stepKey ? guideData[currentUserChoice.stepKey] : undefined;
    
    let htmlContent = '';
    let visibleCard = true;
    let transitionMultiplier = 1;
    let disabled = false;

    const handleClickChoice = (userChoice, choiceKey) => {
        if (!disabled) {
            disabled = true;
            selected = choiceKey;
            if (choiceKey !== userChoice.selectedChoiceKey) {
                userChoices.length = currentUserChoiceIdx+1;
                userChoice.selectedChoiceKey=choiceKey;
                userChoice.selectedChoiceValue=guideData[userChoice.stepKey].choices[choiceKey];

                if (currentUserChoiceIdx+1 >= userChoices.length) {
                    let newUserChoice;
                    if (guideData.hasOwnProperty(userChoice.selectedChoiceValue)) {
                        newUserChoice = new UserChoice({
                            path: `${currentUserChoice.path}/${userChoice.selectedChoiceValue}`, 
                            stepKey: userChoice.selectedChoiceValue
                        });
                    } else {
                        newUserChoice = new UserChoice({
                            url: userChoice.selectedChoiceValue
                        });
                    }
                    userChoices = [...userChoices, newUserChoice];
                } else {
                    userChoices = userChoices;
                }
            }
            transitionCard(false, () => {
                currentUserChoiceIdx++;
                disabled = false;
            });
        }
    }

    function transitionCard(toRight: boolean, callback: Function) {
        transitionMultiplier = toRight ? -1 : 1;
        visibleCard=false;
        setTimeout( () => {
            callback();
            visibleCard=true;
        }, 500);
    }

    const handleClickBreadcrumb = (userChoiceIdx) => {
        transitionCard(true, () => {
            currentUserChoiceIdx = userChoiceIdx;
            selected = userChoices[currentUserChoiceIdx].selectedChoiceKey;
        });
    }

    function getHtml(url) {
        if (url) {
            fetch(url).then(response => {
                return response.text();
            }).then(html => {
                htmlContent = html
            });
        }
    }

    function getStepUrl(stepData) {
        if (isValidHttpUrl(stepData)) {
            return stepData;
        }
        if (stepData.selectedChoiceKey) {
            let selectedChoiceValue = Object.values(stepData.selectedChoiceKey)[0];
            if (isValidHttpUrl(selectedChoiceValue))
            return selectedChoiceValue;
        }
        return undefined;
    }

    function isValidHttpUrl(possibleUrlStr: string) {
        let url;
        try {
            url = new URL(possibleUrlStr);
        } catch (_) {
            return false;  
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }
    // breadcrumb label:(nextStepKey.length <= 20) ? nextStepKey : nextStepKey.substr(0, 9) + "..." + nextStepKey.substr(nextStepKey.length-10);

    let snackbar: SnackbarComponentDev;
    let reason = 'nothing yet';
 
  function handleClosed(e: CustomEvent<{ reason: string | undefined }>) {
    reason = e.detail.reason ?? 'Undefined.';
  }
  
  function sendInfoVia(info, via) {
    sendViaChoice = via;
    snackbar.open()
  }
</script>

{#if currentGuideStep }
    <ul class="breadcrumb">
        {#each userChoices as userChoice,userChoiceIdx}
            {#if userChoiceIdx <= currentUserChoiceIdx}
                <li in:fly="{{ y: 200, duration: 750 }}" out:fade>                        
                        {#if userChoiceIdx < currentUserChoiceIdx}
                            <Button on:click={() => handleClickBreadcrumb(userChoiceIdx)}>{userChoice.selectedChoiceKey}</Button>
                        {:else if userChoiceIdx == currentUserChoiceIdx}
                            <Button disabled>{userChoice.selectedChoiceKey ? userChoice.selectedChoiceKey : userChoice.stepKey}</Button>
                        {/if}
                </li>
            {/if}
        {/each}    
    </ul> 

    {#if visibleCard }
        <div in:fly="{{ x: 200*transitionMultiplier, duration: 750 }}" out:fade class="card-container">
            <Card padded>
                <Content>
                    <div class="container" style="display: flex; flex-wrap: wrap;">
                        <div style="margin: 0px; padding: 10px 0px; color: #888; width: 50px">
                            <div class="mdc-typography--body1">Guide:</div>
                        </div>
                        <div style="flex-grow: 1; font-size: 24px; background-color: #F3F5F6; margin: 10px; padding: 25px 20px;" class="mdc-typography--body1">
                            {#if (typeof currentGuideStep == 'string' || currentGuideStep instanceof String) && isValidHttpUrl(currentGuideStep)}
                                <a href={currentGuideStep} target="_tab">{currentGuideStep}</a>
                            {:else}
                                <div class="guide-prompt">
                                    {currentGuideStep.question ? currentGuideStep.question : currentGuideStep}
                                </div>
                            {/if}
                            {#if currentGuideStep.choices}
                                <Actions>
                                    <div class="segmented-button-group">
                                        <div>
                                        <SegmentedButton
                                            segments={Object.keys(currentGuideStep.choices)} 
                                            let:segment singleSelect 
                                            bind:selected>
                                            <Segment {segment}
                                                on:click={() => handleClickChoice(currentUserChoice, segment)} 
                                                style="flex: 1;">
                                                <Label>{segment}</Label>
                                            </Segment>
                                        </SegmentedButton>             
                                        </div>
                                    </div>                 
                                </Actions>                
                            {/if}
                        </div>
                    </div>
                    {#if currentGuideStep.learnMore}                      
                        <div class="learn-more">
                            <Button text class="primary-text" on:click={() => {window.open(currentGuideStep.learnMore, "_tab")}}>Learn More</Button>
                        </div>
                    {/if}
                    {#if !currentGuideStep.choices}
                        <div class="segmented-button-group send-via-group">
                            <div style="margin-top: 1em;">Send via:</div>
                            <SegmentedButton
                                segments={["US mail","phone","fax","email","text message","telegraph","smoke signals","telepathy"]}
                                let:segment singleSelect 
                                bind:selected={sendVia}>
                                <Segment {segment}
                                    on:click={() => sendInfoVia("info", segment)}
                                    style="flex: 1;">
                                    <Label>{segment}</Label>
                                </Segment>
                            </SegmentedButton>                                                         
                        </div>                 
                    {/if}
                </Content>
            </Card>
        </div>
    {/if}
{/if}

<Snackbar bind:this={snackbar} labelText="Info sent via {sendViaChoice}">
    <Label />
    <Actions>
      <IconButton class="material-icons" title="Dismiss">close</IconButton>
    </Actions>
  </Snackbar>
    
<!-- <code>
    <div>currentUserChoiceIdx={currentUserChoiceIdx}</div>
    <div>userChoices[currentUserChoiceIdx]={JSON.stringify(userChoices[currentUserChoiceIdx], null, 2)}</div>
    <div>userChoices[currentUserChoiceIdx].stepKey={ currentUserChoiceIdx && userChoices[currentUserChoiceIdx] ? JSON.stringify(userChoices[currentUserChoiceIdx].stepKey, null, 2) : ""}</div>
    <div>guideData[userChoices[currentUserChoiceIdx].stepKey]={currentUserChoiceIdx && userChoices[currentUserChoiceIdx] && userChoices[currentUserChoiceIdx].stepKey ? JSON.stringify(guideData[userChoices[currentUserChoiceIdx].stepKey], null, 2) : ""}</div>
    <div>startingStepKey={startingStepKey}</div>
    <div>startingUserChoice={JSON.stringify(startingUserChoice, null, 2)}</div>
    <div>userChoices={JSON.stringify(userChoices, null, 2)}</div>
    <div>currentUserChoice={JSON.stringify(currentUserChoice, null, 2)}</div>
    <div>currentGuideStep={JSON.stringify(currentGuideStep, null, 2)}</div>
    <div>currentUserChoice.stepKey={JSON.stringify(currentUserChoice ? currentUserChoice.stepKey : undefined, null, 2)}</div>
    <div>guideData[currentUserChoice.stepKey]={JSON.stringify(currentUserChoice && currentUserChoice.stepKey ? guideData[currentUserChoice.stepKey] : undefined, null, 2)}</div>
    <div>selected={selected}</div>
    <div>guideData={JSON.stringify(guideData, null, 2)}</div>
</code> -->

<style>
    ul.breadcrumb {
        padding: 10px 16px;
        list-style: none;
        background-color: #eee;
    }

    /* Display list items side by side */
    ul.breadcrumb li {
        display: inline;
        font-size: 18px;
    }

    /* Add a slash symbol (/) before/behind each list item */
    ul.breadcrumb li+li:before {
        padding: 8px;
        color: black;
        content: "/\00a0";
    }

    .learn-more {
        padding: 10px 0px;
    }

    .guide-prompt {
        white-space: pre-wrap;
    }

    .send-via-group {
        padding: 20px;
    }
</style>
