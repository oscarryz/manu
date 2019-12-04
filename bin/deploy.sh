rm dist/*
cp -r public/css dist/
cp generated/*.html dist
echo ".dropdown { display:none; }" >> dist/css/main.css
node node_modules/gh-pages/bin/gh-pages -d dist