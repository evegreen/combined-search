import { escapeHtml } from '../utils.js';

export default function renderQueryTitle(unifiedQuery) {
  const escapedUnifiedQuery = escapeHtml(unifiedQuery);
  const queryTitle = document.createElement('div');
  queryTitle.className = 'QueryTitle';
  queryTitle.innerHTML = `<code><span class="Highlight">${escapedUnifiedQuery}</span></code>`;
  return queryTitle;
}
