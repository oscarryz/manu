// define operations for entries
// read / write / delete / update

const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');

const entriesDir = path.join(__dirname, '../entries');
const entriesIndex = `${entriesDir}/index.json`;
module.exports = {

    newEntry: (data) => {
        const id = uuid(); // creates a new filename each time.
        const file= `${entriesDir}/${id}.md`;

        fs.writeFile(file, data, (err) => {
            if (err) {
                // file coundn't be saved
                throw err;
            }
            // else... update the index
            const index = JSON.parse(fs.readFileSync(entriesIndex));

            index.entries.push({
                name: id,
                created: Date.now(),
                author: 'me',
                file
            });

            try {
                fs.writeFileSync(entriesIndex, JSON.stringify(index, null, 3));
            } catch (e) {
                // coundn't update the index
                console.log('Coudn\'t update the index', e)
            }
        });
    },
    // Just a temporarily piece of code
    // to show what the index could look like
    // In the future, will get this in the API
    createIndex: () => {
        // Also, we usually use a template engine like pug (see https://pugjs.org)
        // but I think we're not going to need it
        // If we don't get to a react / phase we might use it.
        // In the meantime just this
        const index = JSON.parse(fs.readFileSync(entriesIndex));
        let list = '';
        for( entry of index.entries) {
            list += `<li><a href="#">${entry.name}</a></li>\n`
        }
        return `<ul>${list}</ul>`;
    }
}