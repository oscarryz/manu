// define operations for entries
// read / write / delete / update

const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const _ = require('lodash');

const includes = require('./includes');

const entriesDir = path.join(__dirname, '../../entries');
const publicDir = path.join(__dirname, '../../generated');

const entriesIndex = `${publicDir}/feed.json`;
const domain = 'https://oscarryz.now.sh';

// Saves an entry to disk.
persistEntry = (entry) => {
    const t = titleFrom(entry.title);
    entry.title = t.title;

    const fileJson = `/${t.fileName}.json`;
    const fileHtml = `/${t.fileName}.html`;

    _.defaults(entry, {
        // id: entry.id,
        url: `${domain}${fileHtml}`,
        title: t.original,
        date_modified: new Date().toISOString(),
    });
    

    const item = {
        id: entry.id,
        url: `${domain}/${t.fileName}.html`,
        title: t.original,
        content_html: entry.html,
        date_modified: new Date().toISOString(),
    }

    // Write the entry regardless
    try {
        //fs.writeFileSync(`${entriesDir}${fileJson}`, JSON.stringify(entry, null, 2));
        let header = includes.header()
            .toString()
            .replace(/\${title}/g, t.original)
            .replace(/\${entryId}/g, entry.id);

        fs.writeFileSync(`${publicDir}${fileHtml}`, header + entry.content_html + includes.footer());

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

        return includes.editTemplate()
            .replace(/\${id}/g, id)
            .replace(/\${title}/g, title)
            .replace(/\${content}/g, content)

    },

    // Saves a new entry
    newEntry: (entry) => {
        entry.id = uuid();
        entry.date_published = new Date().toISOString();
        const html = persistEntry(entry);
        fs.writeFileSync(`${publicDir}/index.html`, `<meta http-equiv="Refresh" content="0; url=${relativePath(entry)}" />`);
        return html;
    },

    // Updates an existing entry
    updateEntry: (entry) => {
        return persistEntry(entry);
    }
}
// removes the fqdn
const relativePath = (entry) => entry.url.substring(entry.url.lastIndexOf('/')); 


// Updates the navigations iframe "entries.html" 
const updateEntriesIndex = () => {

    const index = fs.existsSync(entriesIndex)
        ? JSON.parse(fs.readFileSync(entriesIndex))
        : defaultFeed();

    let list = '<div id="entries-list" class="entries-list"><ul>';
    for (entry of index.items) {
        list += `<li><a href="${relativePath(entry)}" target="_parent" class="archive-link">${entry.title}</a></li>\n`
    }
    const entriesFile = includes.headerEntries() + list + '</ul></div></html>';

    try {
        fs.writeFileSync(`${publicDir}/entries.html`, entriesFile);
    } catch (e) {
        throw e;
    }

}
// Given a source text, creates the title from the 
// first 30 chars.
const titleFrom = (source) => {
    const firstLine = source.substring(0, 30);
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