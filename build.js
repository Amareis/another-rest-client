const path = require("path");
const esbuild = require("esbuild");

let outdir = path.resolve(process.cwd(), "dist");

const globalName = 'RestClient';

// esbuild doesn't support umd, here's a hack from
// https://github.com/evanw/esbuild/pull/1331#issuecomment-887877002
let footer = `(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.${globalName} = factory();
  }
}(typeof self !== 'undefined' ? self : this, () => ${globalName}));`;

let files = {
	'rest-client.js': './src/rest-client.js',
	'rest-client.min.js': './src/rest-client.js',
}

let builds = Object.entries(files)
	.map(([filename, source]) => {
		return {
			entryPoints: [source],
			sourcemap: true,
			outfile: path.resolve(outdir, filename),
			bundle: true,
			platform: "browser",
			format: "iife",
			footer: {
				js: footer,
			},
			globalName,
			minify: /\.min\.m?js$/.test(filename)
		}
	})

Promise.all(builds.map(esbuild.build));