// define operations for entries
// read / write / delete / update

const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const _ = require('lodash');

const includes = require('./includes');

const entriesDir = path.join(__dirname, '../entries');
const publicDir = path.join(__dirname, '../generated');

const entriesIndex = `${entriesDir}/index.json`;
module.exports = {

    newEntry: (source, html) => {
        const id = uuid(); // creates a new filename each time.
        // Attempt to get a text title,
        const t = titleFrom(source);
        const jsonFile = `${entriesDir}/${t.fileName}.json`;
        const fileHtml = `/${t.fileName}.html`;

        const entry = {
            id,
            title: t.title,
            fileHtml,
            created: Date.now(),
            author: 'me',
            status: 'draft',
            source
        }

        try {
            fs.writeFileSync(jsonFile, JSON.stringify(entry, null, 2));
            fs.writeFileSync(`${publicDir}${fileHtml}`, includes.header() + html + includes.footer());
        } catch (e) {
            // file couldn't be saved
            throw e;
        }

        // else... update the index
        const index = fs.existsSync(entriesIndex)
            ? JSON.parse(fs.readFileSync(entriesIndex))
            : { entries: [] }
        delete entry.data;
        index.entries.push(entry);

        try {
            fs.writeFileSync(entriesIndex, JSON.stringify(index, null, 2));
        } catch (e) {
            console.log('Coudn\'t update the index', e)
        }
        return fileHtml;
    },


}
const titleFrom = (source) => {
    const lines = _.split(source, '\n');

    // TODO: validate if there are items in the array
    const firstLine = lines[0];
    const fileName =_.kebabCase(firstLine);
    const title = _.startCase(fileName);
    // if it fail return just the UUID?
    return {fileName, title};
}
