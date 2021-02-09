export default function renderQueryTitle(query) {
  const queryTitle = document.createElement('div');
  queryTitle.className = 'QueryTitle';
  queryTitle.innerHTML = `cs <span class="Highlight">${query}</span>`;
  return queryTitle;
}
