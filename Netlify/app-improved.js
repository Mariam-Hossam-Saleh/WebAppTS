// Frontend configuration
const config = {
  // Use environment variable or fallback to your deployed backend
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/todos'  // Local development
    : 'https://webappts-production.up.railway.app/todos'  // Production
};

// Load todos
async function loadTodos() {
  try {
    const res = await fetch(config.API_URL);
    if (!res.ok) throw new Error('Failed to fetch todos');
    
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
  } catch (error) {
    console.error('Error loading todos:', error);
    showError('Failed to load todos. Please check your connection.');
  }
}

// Add new todo
async function addTodo() {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;
  
  try {
    const response = await fetch(config.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('Failed to add todo');
    
    input.value = "";
    loadTodos();
  } catch (error) {
    console.error('Error adding todo:', error);
    showError('Failed to add todo. Please try again.');
  }
}

// Toggle todo
async function toggleTodo(id, done) {
  try {
    const response = await fetch(`${config.API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done })
    });
    
    if (!response.ok) throw new Error('Failed to update todo');
    loadTodos();
  } catch (error) {
    console.error('Error updating todo:', error);
    showError('Failed to update todo. Please try again.');
  }
}

// Delete todo
async function deleteTodo(id) {
  try {
    const response = await fetch(`${config.API_URL}/${id}`, { 
      method: "DELETE" 
    });
    
    if (!response.ok) throw new Error('Failed to delete todo');
    loadTodos();
  } catch (error) {
    console.error('Error deleting todo:', error);
    showError('Failed to delete todo. Please try again.');
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error-message') || createErrorDiv();
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function createErrorDiv() {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'error-message';
  errorDiv.style.cssText = `
    background: #fee; 
    color: #c33; 
    padding: 10px; 
    border-radius: 5px; 
    margin: 10px 0; 
    display: none;
  `;
  document.querySelector('.container').insertBefore(errorDiv, document.querySelector('form'));
  return errorDiv;
}

// Hook up form
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("todo-form").addEventListener("submit", e => {
    e.preventDefault();
    addTodo();
  });

  loadTodos();
});