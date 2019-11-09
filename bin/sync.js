// 1. copy public
// 2. copy generated - >  manublog
// 3. git push
const copyfiles = require('copyfiles');
const git = require('simple-git')('generated/manublog');

const errorHandler =	(e) => {
	if (e) {
		console.log('Error copying');
	}
};

copyfiles(['public/**', 'generated/manublog'] , 0, errorHandler);
copyfiles(['generated/*.html','generated/manublog'] , errorHandler);
git.status((e) => console.log(e));



