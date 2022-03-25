import { readable } from 'svelte/store';

export const guideList = readable(undefined, (set) => {
    fetch('https://5f86tjn30m.execute-api.us-east-1.amazonaws.com/stage/get-guide-list')
    .then(response => response.json())
    .then(data => {
        console.log('get-guide-list: '+JSON.stringify(data, null, 2));
        set(data);
    }).catch(error => {
      console.log(error);
      set([]);
    });
    return () => {console.log('guideList.stop');}
})
