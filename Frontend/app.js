const API_URL = "http://localhost:4000/todos"; // later replace with your deployed backend URL

// Load todos
async function loadTodos() {
  const res = await fetch(API_URL);
  const todos = await res.json();
  const list = document.getElementById("todo-list");
  list.innerHTML = "";
  todos.forEach(todo => {
    const li = document.createElement("li");
    li.textContent = todo.text + (todo.done ? " ✅" : "");
    li.onclick = () => toggleTodo(todo._id, !todo.done);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTodo(todo._id);
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Add new todo
async function addTodo() {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  input.value = "";
  loadTodos();
}

// Toggle todo
async function toggleTodo(id, done) {
  await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
  loadTodos();
}

// Delete todo
async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadTodos();
}

// Hook up form
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("todo-form").addEventListener("submit", e => {
    e.preventDefault();
    addTodo();
  });

  loadTodos();
});
