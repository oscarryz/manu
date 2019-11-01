const fs = require('fs');
const path = require('path');


let header;
let footer;
let headerEntries;

const includesDir = path.join(__dirname, '../includes');

module.exports = {
    header : () => {
        if (header === undefined) {
        header = fs.readFileSync(`${includesDir}/header.html`);
        }
        return header;
    },

    footer : () => {
        if (footer === undefined) {
        footer = fs.readFileSync(`${includesDir}/footer.html`);
        }
        return footer;
    },

    headerEntries : () => {
        if (headerEntries === undefined) {
        headerEntries = fs.readFileSync(`${includesDir}/header-entries.html`);
        }
        return headerEntries;
    },

}