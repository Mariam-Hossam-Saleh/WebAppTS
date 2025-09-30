document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');

  let todos = JSON.parse(localStorage.getItem('todos') || '[]');

  const save = () => localStorage.setItem('todos', JSON.stringify(todos));

  const render = () => {
    list.innerHTML = '';
    todos.forEach((t, idx) => {
      const li = document.createElement('li');
      li.dataset.index = idx;
      if (t.done) li.classList.add('done');

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = t.done;
      chk.className = 'toggle';

      const span = document.createElement('span');
      span.textContent = t.text;

      const del = document.createElement('button');
      del.textContent = '✖';
      del.className = 'delete';
      del.setAttribute('aria-label', 'Delete task');

      li.appendChild(chk);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    todos.push({ text, done: false });
    input.value = '';
    save();
    render();
  });

  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
      const idx = parseInt(e.target.parentElement.dataset.index, 10);
      todos.splice(idx, 1);
      save();
      render();
    } else if (e.target.classList.contains('toggle')) {
      const idx = parseInt(e.target.parentElement.dataset.index, 10);
      todos[idx].done = e.target.checked;
      save();
      render();
    }
  });

  render();
});
