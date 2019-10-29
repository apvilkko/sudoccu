import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import buble from "rollup-plugin-buble";
import livereload from "rollup-plugin-livereload";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import scss from "rollup-plugin-scss";
import { writeFileSync } from "fs";

const path = require("path");

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/bundle.js"
  },
  plugins: [
    scss({
      output: (styles, styleNodes) => {
        Object.keys(styleNodes).forEach((filename, i) => {
          const out = styles.split("/*__END__*/");
          const outname = `public/${path.parse(filename).name}.css`;
          writeFileSync(outname, out[i]);
        });
      }
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("public/bundle.css");
      }
    }),

    buble({
      objectAssign: "Object.assign",
      transforms: { asyncAwait: false, forOf: false }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
    }),
    commonjs(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
