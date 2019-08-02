import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import axios from "axios";

const TodoModel = {
  all() {
    return axios.get("http://localhost:1337/todos");
  },

  read(id) {},

  create(data) {
    const { title } = data;
    return axios.post("http://localhost:1337/todos", {
      title
    });
  },

  update(data) {
    const { id, title } = data;
    return axios.put("http://localhost:1337/todos/" + id, {
      title
    });
  },

  delete(id) {
    return axios.delete("http://localhost:1337/todos/" + id);
  }
};

const auth = {
  isAuthenticated: localStorage.getItem("todoUser") || false,

  login(credentials) {
    const { identifier, password } = credentials;
    return axios.post("http://localhost:1337/auth/local", {
      identifier,
      password
    });
  },

  logout() {}
};

function Login(e) {
  const [user, setUser] = useState(localStorage.getItem("todoUser") || {});

  function handleAuthenticate(e) {
    auth
      .login({
        identifier: e.target.querySelector("input[type='text']").value,
        password: e.target.querySelector("input[type='password']").value
      })
      .then(response => response.data)
      .then(data => {
        auth.isAuthenticated = true;
        setUser(data.user);
        localStorage.setItem("todoUser", JSON.stringify(data.user));
      })
      .catch(err => console.log(err));

    e.preventDefault();
  }

  if (auth.isAuthenticated) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return (
    <form method="post" onSubmit={handleAuthenticate}>
      <h2>Login Here</h2>
      <label>Username</label>
      <input type="text" name="username" />
      <label>Password</label>
      <input type="password" name="password" />
      <button>Login</button>
    </form>
  );
}

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    TodoModel.all().then(response => setTodos(response.data));
  }, []);

  function addTodo(e) {
    const newTodo = e.target.querySelector("input[type='text']").value;
    TodoModel.create({ title: newTodo }).then(addedTodo =>
      setTodos([...todos, addedTodo.data])
    );

    e.target.querySelector("input[type='text']").value = "";

    e.preventDefault();
  }

  function updateTodo(e, id) {
    console.log(e.target.innerText, id);
    const title = e.target.innerText;
    if (e.key === "Enter") {
      TodoModel.update({ title, id });

      e.preventDefault();
    }
  }

  function deleteTodo(id) {
    console.log(id);
    TodoModel.delete(id).then(deletedTodo =>
      setTodos(todos.filter(todo => todo.id !== deletedTodo.data.id))
    );
  }

  if (!auth.isAuthenticated) {
    return <Redirect to={{ pathname: "/login" }} />;
  }

  return (
    <>
      <form method="post" onSubmit={addTodo}>
        <input type="text" placeholder="What needs to be done?  " />
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              contentEditable="true"
              onKeyPress={e => updateTodo(e, todo.id)}
            >
              {todo.title}
            </span>{" "}
            <button onClick={e => deleteTodo(todo.id)}>x</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Main() {
  return (
    <Router>
      <Route path="/" exact component={App} />
      <Route path="/login" component={Login} />
    </Router>
  );
}

export default Main;
