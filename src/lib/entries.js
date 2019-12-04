// define operations for entries
// read / write / delete / update

const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const _ = require('lodash');

const includes = require('./includes');

const entriesDir = path.join(__dirname, '../../entries');
const publicDir = path.join(__dirname, '../../generated');

const entriesIndex = `${entriesDir}/index.json`;


    persistEntry = (entry) => {
        const t = titleFrom(entry.title);
        entry.title = t.title;

        const fileJson = `/${t.fileName}.json`;
        const fileHtml = `/${t.fileName}.html`;

        _.defaults(entry, {
            fileHtml,
            fileJson,
            created: Date.now(),
            author: 'me',
            status: 'draft',
        });


        // Write the entry regardless
        try {
            fs.writeFileSync(`${entriesDir}${fileJson}`, JSON.stringify(entry, null, 2));
            let header = includes.header()
                .toString()
                .replace(/\${title}/g, t.original)
                .replace(/\${entryId}/g, entry.id );

            fs.writeFileSync(`${publicDir}${fileHtml}`,  header + entry.html + includes.footer());
            fs.writeFileSync(`${publicDir}/index.html`, `<meta http-equiv="Refresh" content="0; url=.${fileHtml}" />`);
        } catch (e) {
            // file couldn't be saved
            throw e;
        }

    // Find the entry in the index if it exists
    const index = fs.existsSync(entriesIndex)
        ? JSON.parse(fs.readFileSync(entriesIndex))
        : { entries: [] }

    const indexOfEntry = index.entries.findIndex((e) => e.id === entry.id);

    // delete undeeded information from the index.json
    delete entry.content;
    delete entry.html;

    if (indexOfEntry >= 0) {
        // try to delete the old file ... 
        let oldEntry = index.entries[indexOfEntry];
        if (oldEntry.fileHtml !== entry.fileHtml) {
            console.log(`should delete ${oldEntry.fileJson} and ${oldEntry.fileHtml}`);
        }
        index.entries[indexOfEntry] = entry;
    } else {
        index.entries.unshift(entry);
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

    first: () => {
        const index = fs.existsSync(entriesIndex)
            ? JSON.parse(fs.readFileSync(entriesIndex))
            : { entries: [] }

        if (index.entries.length > 0 ) {
          return index.entries[0].fileHtml;
        } else {
            return undefined;
        }
    },
     
    loadEntry: (id) => {

       // Find the entry in the index if it exists
        const index = fs.existsSync(entriesIndex)
            ? JSON.parse(fs.readFileSync(entriesIndex))
            : { entries: [] }

        const indexOfEntry = index.entries.findIndex((e)=>e.id === id);


        let content = `<h1>Title</h1><p>content</p>`;
        let title = 'Untitled'
        if (indexOfEntry >= 0) {
            const entry = index.entries[indexOfEntry]
            content = JSON.parse(fs.readFileSync(`${entriesDir}${entry.fileJson}`)).content;
            title = entry.title;
        }

        return includes.editTemplate()
            .replace(/\${id}/g, id)
            .replace(/\${title}/g, title )
            .replace(/\${content}/g, content)
        
    },
    newEntry: (entry) => {
        const id = uuid();
        entry.id = id;
        return persistEntry(entry);
    },
    updateEntry: (entry) => {
        // look for the entry
        // if is there, override it with the new content
        return persistEntry(entry);
    }
}
const updateEntriesIndex = () => {

    const index = fs.existsSync(entriesIndex)
        ? JSON.parse(fs.readFileSync(entriesIndex))
        : { entries: [] }

    let list = '<div id="entries-list" class="entries-list"><ul>';
    for (entry of index.entries) {

        list += `<li><a href=".${entry.fileHtml}" target="_parent" class="archive-link">${entry.title}</a></li>\n`
    }
    const entriesFile = includes.headerEntries() + list + '</ul></div>';

    try {
        fs.writeFileSync(`${publicDir}/entries.html`, entriesFile);
    } catch (e) {
        throw e;
    }

}
const titleFrom = (source) => {
    // const lines = _.split(source, '\n');

    // TODO: validate if there are items in the array
    // const firstLine = lines[0];
    const firstLine = source.substring(0,30);
    const fileName = _.kebabCase(firstLine);
    //_.startCase(fileName);
    // if it fail return just the UUID?
    return { fileName, title: firstLine, original: firstLine };
}
