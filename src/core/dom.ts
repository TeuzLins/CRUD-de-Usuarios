export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function clear(node: Element) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function spinner(text = 'Carregando...'): HTMLElement {
  const s = el('div', 'spinner');
  s.innerHTML = `<span class="loader" aria-hidden="true"></span><span>${text}</span>`;
  return s;
}