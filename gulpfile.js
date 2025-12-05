const { src, dest, watch } = require('gulp');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes'));
}

function watchIcons() {
	return watch('nodes/**/*.{png,svg}', buildIcons);
}

exports['build:icons'] = buildIcons;
exports['watch:icons'] = watchIcons;


