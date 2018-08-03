const fs = require('fs');

const packageJson = require('./package.json');
packageJson.version = packageJson.version.replace(/-beta\..*$/, '');
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2), { encoding: 'utf8' });
