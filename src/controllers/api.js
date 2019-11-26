const commonmark = require('commonmark');
const entries = require('../lib/entries');

module.exports = {
    get: (req,res) => {
      const entryFile = entries.loadEntry(req.params.id);
      //res.status(200).send(entryFile);
      res.redirect(302, entryFile)
    },
    post: (req, res) => {
      const e = entryFrom(req);
      const entryFile = entries.newEntry(e);
      res.redirect(302, entryFile)
    },
    put: (req, res) => {
      const id = req.body.id;
      if (id === undefined) {
        res.redirect(302, '/');
        return;
      }
      const e = entryFrom(req);
      const entryFile = entries.updateEntry(e);
      res.redirect(302, entryFile)

    }
}

// It's bad idea to simply take user input
// and use it blindly.
// Data should always be sanitized
// Not the scope atm, but this function will eventually
// sanitize the user input.
// Still not good, just trying to avoid losing data here.
const sanitize = (data) => decodeURIComponent(data);

/* 
 * Creates an entry object from the request
 */
const entryFrom = (req) => {
      const id = req.body.id;
      let title = sanitize(req.body.title);
      const content = sanitize((req.body.content || '').replace(title, ''));

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
      const html = writer.render(parsed);

      return {
          id,
          title,
          content,
          html
      }
}

