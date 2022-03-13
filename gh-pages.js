var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',        
        repo: 'https://github.com/rlyders/guide-me.git', // Update to point to your repository  
        user: {
            name: 'Richard Lyders', // update to use your name
            email: 'Richard@Lyders.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)