import { readable } from 'svelte/store';
import customerFeedbackHowToData from "./customer-feedback.yaml";
import turnOnLightsHowToData from './turn-on-lights.yaml';

export const decisionTreeData = readable(undefined, (set) => {
    set([customerFeedbackHowToData, turnOnLightsHowToData]);
    return () => {console.log('decisionTreeData.stop');}
})
