const ghpages = require('gh-pages');
const path = require('path');
ghpages.publish(path.join(__dirname, 'dist'), {
    branch: 'gh-pages',
    history: false,

}, (err) => {
    if(err) {
        console.log('ERR', err);
        return;
    }
    console.log('complated')
})