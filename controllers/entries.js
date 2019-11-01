// define operations for entries
// read / write / delete / update
const fs = require('fs');
const path = require('path');
const includes = require('../lib/includes');
// const uuid = require('uuid/v1');
// const _ = require('lodash');

// const includes = require('./includes');

const entriesDir = path.join(__dirname, '../entries');

const entriesIndex = `${entriesDir}/index.json`;
module.exports = (req, res) => {
        // Also, we usually use a template engine like pug (see https://pugjs.org)
        // but I think we're not going to need it
        // If we don't get to a react / phase we might use it.
        // In the meantime just this
        const index = JSON.parse(fs.readFileSync(entriesIndex));
        let list = '<div id="entries-list" class="entries-list"><ul>';
        for (entry of index.entries) {

            list += `<li><a href="${entry.fileHtml}" target="_parent">${entry.title}</a></li>\n`
        }
        list += '</ul></div>';
        return res.send(includes.headerEntries() + list);
    }
