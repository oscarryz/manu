const commonmark = require('commonmark');


/* POST content. */
module.exports = function(req, res) {
  const content = req.body.content;
  const reader = new commonmark.Parser();
  const writer = new commonmark.HtmlRenderer()
  const parsed = reader.parse(content);
  const result = writer.render(parsed);
  res.send(result);
};
