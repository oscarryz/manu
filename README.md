# manu
Minimalist Blogging Platform based on https://manuelmoreale.com/ blog because it's awesome.

(WIP)

Idea is to create a blogging platform with the followig elements:

- A WYSIWYG editor ( Use https://prosemirror.net to avoid start from scratch)
- A controller that takes what the user writes and generate the HTML
- Save the content to a flat file system (no database or remote storages)
- Deploy as static file service (Github pages or any other platform that serves static files)


[Prototype](https://www.figma.com/proto/3dpkBtXMu7a01QbFbKZOoZ/Blog-Platform?node-id=40%3A131&scaling=min-zoom)

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F3dpkBtXMu7a01QbFbKZOoZ%2FBlog-Platform%3Fnode-id%3D40%253A131%26scaling%3Dmin-zoom&chrome=DOCUMENTATION" allowfullscreen></iframe>

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

# Deploy 

At the moment this blog has to be run locally and then deployed to a [Github pages](https://pages.github.com/) that is to be setup externally

Once that is being setup run:

```
npm run deploy
```

Currently this project deploys to oscarryz.github.io/manu which only project members have access to. The places to look at are the directory `/bin/deploy.sh` and the `package.json` that uses the `gh-pages` npm artifact
