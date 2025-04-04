# manu

Minimalist Blogging Platform that powers https://oscarryz.com. 

This is based largely on the https://manuelmoreale.com/ blog (he was very kind to share some tips) and https://www.proseful.com which shares some principles on what blogging should be like.


This is a very simple blogging platform with the followig elements:

- A WYSIWYG editor ( Use https://prosemirror.net to avoid start from scratch)
- A controller that takes what the user writes and generate the HTML
- Save the content to a flat file system (no database or remote storages)
- Deploy as static file service (Github pages or any other platform that serves static files)


[Prototype](https://www.figma.com/proto/3dpkBtXMu7a01QbFbKZOoZ/Blog-Platform?node-id=40%3A131&scaling=min-zoom)


# Pre-requisites

- node 10.16.3+
- npm 6.9.0+
- git
- github account


# Install

```
git clone git@github.com:oscarryz/manu.git
cd manu
npm install
```

# Running

```
npm start
```

# Develop 

Run with `NODE_ENV=dev npm run start` to avoid publishing articles while testing.
And then to preview `npx http-serve dist/` to see the articles as they would in prod.

Remember to unstage all the articles changed during tests before commiting. 


# Deploy 

At the moment this blog has to be run locally and then deployed to a [Github pages](https://pages.github.com/) that is to be setup externally

Once that is being setup run:

```
npm run deploy
```

Currently this project deploys to oscarryz.github.io/manu which only project members have access to. The places to look at are the directory `/bin/deploy.sh` and the `package.json` that uses the `gh-pages` npm artifact
