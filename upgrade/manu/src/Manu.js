import React from 'react';
//import logo from './logo.svg';
import './Manu.css';

function Manu() {
  return (
    <div className="Manu">
      <header>Header</header>
      <main>
      <div class="content">
          <h1 class="title">manu: a minimalistic blog system</h1>
          <p>
            Created with simplicity in mind, <em>manu</em> aims to bring back the joy of blog writting by making extremily easy to create and edit a blog. By removing a many of the elements of more complex systems, manu let's your ideas flow easier from your mind to the web. 
          </p>
          <p>You can start right now by editing this text and select <a href="#">"publish"</a> in the menu next that will appear next to the title above. If you don't want to publish just yet, you can keep our modifications as a draft" and they will appear on the entries list below.
          </p> 
          
      </div>
      </main>
      <footer>Footer</footer>
    </div>
  );
}

export default Manu;
