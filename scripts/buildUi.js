import fs from 'fs';
import { rollup } from 'rollup';

/**
 * @typedef {import('rollup').InputOptions} InputOptions
 * @typedef {import('rollup').OutputOptions} OutputOptions
 */

/** @type {InputOptions} */
const inputOptions = {
  input: 'src/ui/index.js',
  // TODO: enable tree shaking, when html fn calls will be removed
  treeshake: false
};
/** @type {OutputOptions} */
const outputOptions = {
  file: 'dist/bundle.js',
  format: 'cjs'
};

build();

async function build() {
  const bundle = await rollup(inputOptions);
  const { output: [ { code } ] } = await bundle.generate(outputOptions);
  const template = fs.readFileSync('./src/ui/template.html', 'utf8');
  // avoid replacer patterns usage
  const bundledTemplate = template.replace('$$JS_BUNDLE$$', () => code);
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  fs.writeFileSync('dist/bundledTemplate.html', bundledTemplate, 'utf8');
  await bundle.close();
}
