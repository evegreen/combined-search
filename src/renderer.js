import fs from 'fs';
import { escapeForJsTemplateLiteral } from './utils.js';

// TODO: add "collapse all" results button

const template = fs.readFileSync(
  new URL('../dist/bundledTemplate.html', import.meta.url),
  'utf8'
);

export default function renderHtmlResult(initialState) {
  const { queryPatterns } = initialState;
  // avoid replacer patterns usage
  let result = template.replace(
    '$$INITIAL_RESULTS_STATE$$',
    () => escapeForJsTemplateLiteral(JSON.stringify(initialState, null, 2)) //// NICE DEBUG
  );
  // avoid replacer patterns usage
  result = result.replace('$$QUERY_PATTERNS_TITLE$$', () => queryPatterns);
  return result;
};
