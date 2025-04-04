rm dist/*.html dist/css/* dist/img/*
cp -r public/css public/img public/webfonts public/js public/about-me.html dist/
cp generated/*.html generated/*.json dist
echo ".toolbar { visibility: hidden; }" >> dist/css/main.css
echo "" > dist/js/main.js
echo "" > dist/js/pm.js
echo "" > dist/js/require-pm.js

node node_modules/gh-pages/bin/gh-pages -d dist
