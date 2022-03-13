import { readable } from 'svelte/store';
import customerFeedbackHowToData from "./data/guides/customer-feedback.yaml";
import turnOnLightsHowToData from './data/guides/turn-on-lights.yaml';

export const guideData = readable(undefined, (set) => {
    set([customerFeedbackHowToData, turnOnLightsHowToData]);
    return () => {console.log('guideData.stop');}
})
