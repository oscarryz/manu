const fs = require("fs");
const path = require("path");

let entriesListing;
let editTemplate;
let entryTemplate;

const templatesDir = path.join(__dirname, "../templates");

module.exports = {
  entry() {
    if (entryTemplate === undefined || process.env.NODE_ENV === "development") {
      entryTemplate = fs.readFileSync(`${templatesDir}/entry-template.html`);
    }
    return entryTemplate;
  },

  entriesListing() {
    if (
      entriesListing === undefined ||
      process.env.NODE_ENV === "development"
    ) {
      entriesListing = fs.readFileSync(`${templatesDir}/entries-listing.html`);
    }
    return entriesListing;
  },

  editEntry() {
    if (editTemplate === undefined || process.env.NODE_ENV === "development") {
      editTemplate = fs.readFileSync(
        `${templatesDir}/edit-template.html`,
        "utf-8",
      );
    }
    return editTemplate;
  },
};
