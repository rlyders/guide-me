// NOT-USED 
// This script was created to convert the YAML Guide files to JSON because js-yaml npm package was not working within AWS Lambda. 
// However, now yamljs npmpackage does work and is now being used instead of js-yaml.
const yaml = require('js-yaml');
const fs = require('fs');
const GUIDES_PATH = './src/data/guides';
const GUIDES_PATH_JSON = './src/data/guides/json';
try {
    fs.mkdir(GUIDES_PATH_JSON, { recursive: true }, (err) => {
        if (err) throw err;
    });
    
    fs.readdirSync(GUIDES_PATH, {withFileTypes: true})
    .filter(item => !item.isDirectory())
    .map(item => item.name)
    .filter( name => name.match('^.*\.yaml$'))
    .forEach( name => {
        let fileContents = fs.readFileSync(`${GUIDES_PATH}/${name}`, 'utf8');
        let data = yaml.safeLoad(fileContents);
        const jsonFilename = name.replace('.yaml', '.json');
        fs.writeFile(`${GUIDES_PATH_JSON}/${jsonFilename}`, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                console.log(err);
            }});

        console.log(data);
    });
} catch (e) {
    console.log(e);
}