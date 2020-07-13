rm dist/*.html dist/css/* dist/img/*
cp -r public/css public/img dist/
cp generated/*.html generated/*.json dist
echo ".dropdown { display:none; }" >> dist/css/main.css
node node_modules/gh-pages/bin/gh-pages -d dist