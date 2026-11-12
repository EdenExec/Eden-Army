import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = "com.kdtw.edendeck.sdPlugin";

export default {
	input: "src/plugin.js",
	output: {
		file: `${sdPlugin}/bin/plugin.js`,
		format: "esm",
		sourcemap: isWatching,
	},
	plugins: [
		nodeResolve({ browser: false, exportConditions: ["node"], preferBuiltins: true }),
		commonjs(),
		!isWatching && terser(),
	],
};
