import { listUsers, createUser, updateUser, deleteUser, getUser } from '../api/users.service';
import type { User, UserInput } from '../types';
import { validateUserInput } from '../core/validation';
import { el, clear, spinner } from '../core/dom';
import { createModal, confirmDialog } from '../core/modal';

interface State { page: number; limit: number; q: string; total: number; users: User[]; }
const state: State = { page: 1, limit: 5, q: '', total: 0, users: [] };

const modal = createModal();

export function initApp() {
  const app = document.querySelector('#app')!;
  app.innerHTML = '';

  const header = el('header', 'topbar');
  header.innerHTML = `
    <h1>Gerenciamento de Usuários</h1>
    <label class="search" aria-label="Buscar">
      <input id="search" type="search" placeholder="Buscar por nome ou e-mail" />
    </label>`;
  app.appendChild(header);

  const main = el('main', 'layout');
  app.appendChild(main);

  // Form de criação
  const formWrap = el('section', 'card');
  formWrap.innerHTML = `
    <h2>Novo usuário</h2>
    <form id="create-form" novalidate>
      <div class="grid">
        <label>Nome <input name="name" required minlength="3" /></label>
        <label>E-mail <input name="email" type="email" required /></label>
        <label>Função
          <select name="role" required>
            <option value="">Selecione</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>
        </label>
      </div>
      <div class="actions"><button class="btn primary" type="submit">Criar</button></div>
      <p class="form-error" aria-live="polite"></p>
    </form>`;
  main.appendChild(formWrap);

  const listWrap = el('section', 'card');
  listWrap.innerHTML = `
    <h2>Usuários</h2>
    <div id="list-area" class="table-wrap" aria-live="polite"></div>
    <div id="pagination" class="pagination" role="navigation" aria-label="Paginação"></div>`;
  main.appendChild(listWrap);

  app.appendChild(modal.root);

  // Eventos
  (document.getElementById('search') as HTMLInputElement).addEventListener('input', debounce(async (e) => {
    state.q = (e.target as HTMLInputElement).value;
    state.page = 1;
    await loadUsers();
  }, 300));

  (document.getElementById('create-form') as HTMLFormElement).addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input: UserInput = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      role: (form.elements.namedItem('role') as HTMLSelectElement).value as any,
    };
    const { valid, errors } = validateUserInput(input);
    const err = form.querySelector('.form-error') as HTMLElement;
    if (!valid) { err.textContent = Object.values(errors).filter(Boolean).join(' • '); return; }
    err.textContent = '';
    try {
      disableForm(form, true);
      const created = await createUser(input);
      form.reset();
      state.page = 1;
      await loadUsers();
      toast(`Usuário criado: ${created.name}`);
    } catch (error: any) {
      err.textContent = error?.message ?? String(error);
    } finally {
      disableForm(form, false);
    }
  });

  // Carrega primeira página
  loadUsers();
}

async function loadUsers() {
  const area = document.getElementById('list-area')!;
  clear(area);
  area.appendChild(spinner('Carregando usuários...'));
  try {
    const { items, total } = await listUsers({ page: state.page, limit: state.limit, q: state.q });
    state.users = items; state.total = total;
    renderTable(items);
    renderPagination();
  } catch (error: any) {
    area.innerHTML = `<div class="error">Erro ao buscar usuários. <button class="btn" id="retry">Tentar novamente</button><pre>${error?.message ?? error}</pre></div>`;
    area.querySelector('#retry')?.addEventListener('click', loadUsers);
  }
}

function renderTable(users: User[]) {
  const area = document.getElementById('list-area')!;
  clear(area);
  if (users.length === 0) { area.innerHTML = '<p>Nenhum usuário encontrado.</p>'; return; }
  const table = el('table', 'table');
  table.innerHTML = `
    <thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th>Ações</th></tr></thead>
    <tbody></tbody>`;
  const tbody = table.querySelector('tbody')!;
  users.forEach(u => {
    const tr = el('tr');
    const name = el('td'); name.innerHTML = `<a href="#/users/${u.id}" class="link">${u.name}</a>`;
    const email = el('td'); email.textContent = u.email;
    const role = el('td'); role.textContent = u.role;
    const actions = el('td');
    actions.innerHTML = `
      <button class="btn" aria-label="Editar ${u.name}" data-edit="${u.id}">Editar</button>
      <button class="btn danger" aria-label="Excluir ${u.name}" data-del="${u.id}">Excluir</button>`;
    tr.append(name, email, role, actions);
    tbody.appendChild(tr);
  });
  area.appendChild(table);

  tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', (e) => {
    const id = Number((e.currentTarget as HTMLElement).getAttribute('data-edit'));
    openEditModal(id);
  }));

  tbody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', (e) => {
    const id = Number((e.currentTarget as HTMLElement).getAttribute('data-del'));
    openDeleteConfirm(id);
  }));

  // Navegação de detalhes
  window.addEventListener('hashchange', handleHash);
  handleHash();
}

function renderPagination() {
  const elp = document.getElementById('pagination')!;
  clear(elp);
  const pages = Math.max(1, Math.ceil(state.total / state.limit));
  const prev = el('button', 'btn', '‹'); prev.disabled = state.page <= 1;
  const next = el('button', 'btn', '›'); next.disabled = state.page >= pages;
  prev.addEventListener('click', async () => { state.page = Math.max(1, state.page - 1); await loadUsers(); });
  next.addEventListener('click', async () => { state.page = Math.min(pages, state.page + 1); await loadUsers(); });
  const info = el('span', 'page-info', `Página ${state.page} de ${pages}`);
  elp.append(prev, info, next);
}

async function openEditModal(id: number) {
  const user = await getUser(id);
  const form = el('form') as HTMLFormElement;
  form.innerHTML = `
    <h2 id="modal-title">Editar usuário</h2>
    <label>Nome <input name="name" value="${user.name}" required minlength="3" /></label>
    <label>E-mail <input name="email" value="${user.email}" type="email" required /></label>
    <label>Função
      <select name="role" required>
        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
        <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Editor</option>
        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
      </select>
    </label>
    <p class="form-error" aria-live="polite"></p>
    <div class="actions">
      <button class="btn primary" type="submit">Salvar</button>
      <button class="btn" type="button" id="cancel-edit">Cancelar</button>
    </div>`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input: UserInput = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      role: (form.elements.namedItem('role') as HTMLSelectElement).value as any,
    };
    const { valid, errors } = validateUserInput(input);
    const err = form.querySelector('.form-error') as HTMLElement;
    if (!valid) { err.textContent = Object.values(errors).filter(Boolean).join(' • '); return; }
    err.textContent = '';
    const dialog = confirmDialog('Confirmar alterações deste usuário?', async () => {
      try {
        await updateUser(id, input);
        modal.close();
        await loadUsers();
        toast('Usuário atualizado');
      } catch (error: any) {
        err.textContent = error?.message ?? String(error);
      }
    }, () => modal.close());
    modal.open(dialog);
  });
  form.querySelector('#cancel-edit')!.addEventListener('click', () => modal.close());
  modal.open(form);
}

function openDeleteConfirm(id: number) {
  const content = confirmDialog('Tem certeza que deseja excluir este usuário?', async () => {
    await deleteUser(id);
    modal.close();
    await loadUsers();
    toast('Usuário excluído');
  }, () => modal.close());
  modal.open(content);
}

function handleHash() {
  const hash = location.hash;
  const match = hash.match(/#\/users\/(\d+)/);
  if (match) {
    const id = Number(match[1]);
    showDetail(id);
  } else {
    const detail = document.querySelector('.detail');
    detail?.remove();
  }
}

async function showDetail(id: number) {
  const parent = document.querySelector('#list-area')!;
  const existing = document.querySelector('.detail'); existing?.remove();
  const card = el('div', 'card detail');
  card.appendChild(spinner('Carregando detalhes...'));
  parent.appendChild(card);
  try {
    const user = await getUser(id);
    card.innerHTML = `
      <h3>Detalhes</h3>
      <dl>
        <dt>Nome</dt><dd>${user.name}</dd>
        <dt>E-mail</dt><dd>${user.email}</dd>
        <dt>Função</dt><dd>${user.role}</dd>
        <dt>Criado em</dt><dd>${new Date(user.createdAt).toLocaleString()}</dd>
      </dl>
      <div class="actions"><button class="btn" id="close-detail">Fechar</button></div>`;
    card.querySelector('#close-detail')!.addEventListener('click', () => { location.hash = ''; card.remove(); });
  } catch (error) {
    card.innerHTML = '<p>Erro ao carregar detalhes.</p>';
  }
}

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms) as unknown as number;
  };
}

function disableForm(form: HTMLFormElement, disabled: boolean) {
  Array.from(form.elements).forEach((el) => { (el as any).disabled = disabled; });
}

function toast(message: string) {
  const t = el('div', 'toast', message);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); t.remove(); }, 2500);
}