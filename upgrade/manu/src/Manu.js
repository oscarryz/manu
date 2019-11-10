import React from 'react';
import logo from './logo.svg';
import './Manu.css';

function Manu() {
  return (
    <div className="Manu">
      <header>Header</header>
      <main>Main</main>
      <footer>Footer</footer>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

    </div>
  );
}

export default Manu;
