const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas (replace with your own URI later)
mongoose.connect("mongodb+srv://mariamhossamkeshk_db_user:%23Traffic%232023@cluster0.4qwkxek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schema & model
const Todo = mongoose.model("Todo", new mongoose.Schema({
  text: String,
  done: Boolean,
}));

// Routes
app.get("/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const todo = new Todo({ text: req.body.text, done: false });
  await todo.save();
  res.json(todo);
});

app.patch("/todos/:id", async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(todo);
});

app.delete("/todos/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
