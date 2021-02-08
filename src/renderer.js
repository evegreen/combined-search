import fs from 'fs';
import { escapeForJsTemplateLiteral } from './utils.js';

// TODO: add "collapse all" results button

const template = fs.readFileSync(
  new URL('./resultTemplate.html', import.meta.url),
  'utf8'
);

export default function renderHtmlResult(initialState) {
  const { queryPatterns } = initialState;
  let result = template.replace(
    '$$INITIAL_STATE$$',
    escapeForJsTemplateLiteral(JSON.stringify(initialState))
  );
  result = result.replace('$$QUERY_PATTERNS_TITLE$$', queryPatterns);
  return result;
};
