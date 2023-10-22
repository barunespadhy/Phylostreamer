import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage.jsx";
import CreateNode from "./components/CreateNode.jsx";
import Node from "./components/Node.jsx";
import Terminal from './components/Terminal';
import "./App.css";

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route exact path="/create" element={<CreateNode />} />
      <Route
        exact={true}
        path="/update/:slug"
        element={<CreateNode />}
      />
      <Route exact={true} path="/node/:slug" element={<Node />} />
      <Route exact={true} path="/terminal" element={<Terminal />} />
    </Routes>
  );
}

export default App;
