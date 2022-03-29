// define operations for entries
// read / write / delete / update

const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const _ = require('lodash');

const templates = require('./templates');

const publicDir = path.join(__dirname, '../../generated');

const entriesIndex = `${publicDir}/feed.json`;
const domain = 'https://oscarryz.com';

// Saves an entry to disk.
persistEntry = (entry) => {
    const t = titleFrom(entry.title);
    entry.title = t.title;

    const fileHtml = `/${t.fileName}.html`;

    _.defaults(entry, {
        url: `${domain}${fileHtml}`,
        title: t.original,
        date_modified: new Date().toISOString(),
    });



    // Write the entry regardless
    try {
        const output = interpolate(templates.entry(), entry);
        fs.writeFileSync(`${publicDir}${fileHtml}`, output);
    } catch (e) {
        // file couldn't be saved
        throw e;
    }

    // Find the entry in the index if it exists
    const index = fs.existsSync(entriesIndex)
        ? JSON.parse(fs.readFileSync(entriesIndex))
        : defaultFeed();

    const indexOfEntry = index.items.findIndex((e) => e.id === entry.id);

    if (indexOfEntry >= 0) {
        // try to delete the old file ... 
        let oldEntry = index.items[indexOfEntry];
        if (oldEntry.fileHtml !== entry.fileHtml) {
            console.log(`should delete ${oldEntry.fileJson} and ${oldEntry.fileHtml}`);
        }
        index.items[indexOfEntry] = entry;
    } else {
        index.items.unshift(entry);
    }


    try {
        fs.writeFileSync(entriesIndex, JSON.stringify(index, null, 2));
    } catch (e) {
        console.log('Coudn\'t update the index', e)
    }

    updateEntriesIndex();
    return fileHtml;
}

module.exports = {

    // Returns the filename of the first entry
    first: () => {
        const index = fs.existsSync(entriesIndex)
            ? JSON.parse(fs.readFileSync(entriesIndex))
            : defaultFeed();

        if (index.items.length > 0) {
            return index.items[0].fileHtml;
        } else {
            return undefined;
        }
    },

    // Reads the entry with the given id
    // and returns it as a ready to edit html page.
    loadEntry: (id) => {

        // Default values
        let content = `<h1>Title</h1><p>content</p>`;
        let title = 'Untitled'

        // Find the entry in the index if it exists
        const index = fs.existsSync(entriesIndex)
            ? JSON.parse(fs.readFileSync(entriesIndex))
            : defaultFeed();
        const indexOfEntry = index.items.findIndex((e) => e.id === id);
        if (indexOfEntry >= 0) {
            const entry = index.items[indexOfEntry]
            content = entry.content_html;
            title = entry.title;
        }

        return interpolate(
            templates.editEntry(), {id, title, content}
        );
    },

    // Saves a new entry
    newEntry: (entry) => {
        entry.id = uuid();
        entry.date_published = new Date().toISOString();
        const html = persistEntry(entry);
        fs.writeFileSync(`${publicDir}/index.html`,
        `<meta http-equiv="Refresh" content="0; url=${entry.url.substring(entry.url.lastIndexOf('/'))}" />`);
        return html;
    },

    // Updates an existing entry
    updateEntry: (entry) => {
        return persistEntry(entry);
    }
}
// Updates the navigations iframe "entries.html" 
const updateEntriesIndex = () => {

    const index = fs.existsSync(entriesIndex)
        ? JSON.parse(fs.readFileSync(entriesIndex))
        : defaultFeed();

    try {
        fs.writeFileSync(`${publicDir}/entries.html`,
            interpolate(templates.entriesListing(), {items:index.items})
        );
    } catch (e) {
        throw e;
    }

}

/**
 * Given a string with interpolate marks (e.g. `Hello ${name}` )
 * this function executes using the params passed as argument.
 * @param {string} string The string containing the interpolation marks
 * @param {object} params The object to be used in the replacement
 */
const interpolate = (string, params) => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${string}\`;`)(...vals);
}
// Uses the first line of text as title.
const titleFrom = (source) => {
    // const firstLine = source.substring(0, 30);
    const firstLine = source.split('\r')[0]
    const fileName = _.kebabCase(firstLine);
    return { fileName, title: firstLine, original: firstLine };
}

const defaultFeed = () => ({
        version: 'https://jsonfeed.org/version/1',
        title: 'oscarryz blog',
        home_page_url: 'https://oscarryz.now.sh',
        feed_url: 'https://oscarryz.now.sh/feed/json',
        icon: 'https://oscarryz.now.sh/img/favicon.ico',
        author: {
            name: "OscarRyz",
            url: "https://twitter.com/oscarryz"
        },
        items: []
    });
