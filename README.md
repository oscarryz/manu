# manu

A minimalist blogging platform that powers https://oscarryz.com. 

The design is largely based on https://manuelmoreale.com/ blog (he was very kind to share some tips) and https://www.proseful.com (defunq) which shares some principles on what blogging should be like.

# "Architecure"

The blogging platform is a chrome extension that adds "Edit" and "New" buttons to the https://oscarryz.com website.   

When New is is pressed it loads a wysiwyg editor ( ProseMirror ) and saves the content to gh-pages directly upon saving.   
When Edit is pressed it behaves siimlarly but it preloads the content so it can be edited.  

Finally the gh-pages is synced with Vercel.  

# Pre-requisites

- github account


# Install

- Clone
```
git clone git@github.com:oscarryz/manu.git
```

- Load unpacked extension. 
- Create token in Github
- Configure the access token the extension

# Running

Visit oscarryz.com
