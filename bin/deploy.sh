cp -r public/css public/js dist/
cp generated/*.html dist
node node_modules/gh-pages/bin/gh-pages -d dist