const commonmark = require('commonmark');
const entries = require('../lib/entries');

/* POST content. */
module.exports = function(req, res) {
  let title = sanitize(req.body.title);
  const content = sanitize(req.body.content.replace(title, ''));

  //Handles case of empty title and/or content.
  if (title.trim().length === 0) {
    if (content.replace(/<.+?>/g, '').trim().length === 0) {
      return;
    }
    title = "Untitled";
}

  const reader = new commonmark.Parser();
  const writer = new commonmark.HtmlRenderer();

  const parsed = reader.parse(content);
  const result = writer.render(parsed);
  const entryFile = entries.newEntry(title, content, result);

  res.redirect(301, entryFile)
};

// It's bad idea to simply take user input
// and use it blindly.
// Data should always be sanitized
// Not the scope atm, but this function will eventually
// sanitize the user input.
// Still not good, just trying to avoid losing data here.
const sanitize = (data) => decodeURIComponent(data);
