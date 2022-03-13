import { readable } from 'svelte/store';
import customerFeedbackGuideData from "./data/guides/customer-feedback.yaml";
import turnOnLightsGuideData from './data/guides/turn-on-lights.yaml';

export const guideData = readable(undefined, (set) => {
    set([customerFeedbackGuideData, turnOnLightsGuideData]);
    return () => {console.log('guideData.stop');}
})
