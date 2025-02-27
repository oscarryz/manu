rm dist/*.html dist/css/* dist/img/*
cp -r public/css public/img public/webfonts public/js/entries.js public/about-me.html dist/
cp generated/*.html generated/*.json dist
echo ".toolbar { visibility: hidden; }" >> dist/css/main.css
node node_modules/gh-pages/bin/gh-pages -d dist
