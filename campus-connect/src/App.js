// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Home from './components/Home';
import About from './components/About';
import Repo from './components/Repo';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path='/CampusConnect' element={<Home />}/>
          <Route path="/CampusConnect/about" element={<About />} />
          <Route path="/CampusConnect/repo" element={<Repo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
