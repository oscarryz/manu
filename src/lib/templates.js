const fs = require('fs');
const path = require('path');


let entriesListing;
let editTemplate;
let entryTemplate;

const templatesDir = path.join(__dirname, '../templates');

module.exports = {
    entry : () => {
        if (entryTemplate === undefined) {
            entryTemplate = fs.readFileSync(`${templatesDir}/entry-template.html`);
        }
        return entryTemplate;
    },

    entriesListing : () => {
        if (entriesListing === undefined) {
        entriesListing = fs.readFileSync(`${templatesDir}/entries-listing.html`);
        }
        return entriesListing;
    },

    editEntry : () => {
        if (editTemplate === undefined) {
          editTemplate = fs.readFileSync(`${templatesDir}/edit-template.html`, 'utf-8');
        }
        return editTemplate
    }
}
