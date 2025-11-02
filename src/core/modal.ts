export function createModal(): { root: HTMLElement; open: (content: HTMLElement) => void; close: () => void } {
  const root = document.createElement('div');
  root.className = 'modal-overlay hidden';
  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-content"></div>
    </div>`;
  const modalContent = root.querySelector('.modal-content') as HTMLElement;

  function open(content: HTMLElement) {
    modalContent.innerHTML = '';
    modalContent.appendChild(content);
    root.classList.remove('hidden');
    (root.querySelector('.modal') as HTMLElement).focus();
  }

  function close() {
    root.classList.add('hidden');
    modalContent.innerHTML = '';
  }

  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });

  return { root, open, close };
}

export function confirmDialog(message: string, onConfirm: () => void, onCancel?: () => void): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <h2 id="modal-title">Confirmação</h2>
    <p>${message}</p>
    <div class="actions">
      <button id="confirm" class="btn primary">Confirmar</button>
      <button id="cancel" class="btn">Cancelar</button>
    </div>`;
  wrap.querySelector('#confirm')!.addEventListener('click', () => onConfirm());
  wrap.querySelector('#cancel')!.addEventListener('click', () => onCancel?.());
  return wrap;
}