// 1. copy public
// 2. copy generated - >  manublog
// 3. git push
const copyfiles = require('copyfiles');

const errorHandler =	(e) => {
	if (e) {
		console.log('Error copying');
	}
};

copyfiles(['public/**', 'generated/manublog'] , errorHandler);
copyfiles(['generated/*.html','generated/manublog'] , errorHandler);


