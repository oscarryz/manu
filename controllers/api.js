const commonmark = require('commonmark');
const entries = require('../lib/entries');

/* POST content. */
module.exports = function(req, res) {
  const content = sanitize(req.body.content);
  const reader = new commonmark.Parser();
  const writer = new commonmark.HtmlRenderer();

  entries.newEntry(content);
  const parsed = reader.parse(content);
  const result = writer.render(parsed) + entries.createIndex();

  res.send(result);
};

// It's bad idea to simply take user input
// and use it blindly.
// Data should always be sanitized
// Not the scope atm, but this function will eventually
// sanitize the user input.
const sanitize = (data) => data;
