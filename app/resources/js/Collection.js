/* eslint-env browser */

import { loadGamePage } from "./DBController.js";
import { refreshGameListeners } from "./Gamepage.js";

function clearCollection() {
  let collection = document.querySelector("#gamebox");
  while (collection.firstChild) {
    collection.removeChild(collection.lastChild);
  }
}

//This function is called upon in a loop
//it creates a single "game object" in the collection 
function displayCollection(username, gameName, publisher, genre, rating) {
  let div, header, pOne, pTwo, headerTwo, button;
  div = document.createElement("div");
  div.style.height = "35%";
  div.style.position = "relative";

  header = document.createElement("h2");
  header.innerText = gameName;

  pOne = document.createElement("p");
  pOne.innerText = publisher;

  pTwo = document.createElement("p");
  pTwo.innerText = genre;

  headerTwo = document.createElement("h3");
  headerTwo.innerText = rating.toFixed(1) + "/10";

  button = document.createElement("button");
  button.innerText = "To Game Page";

  button.addEventListener("click", function toGamePage() {
    let userNameforGame = username;

    refreshGameListeners(gameName);
    loadGamePage(gameName, userNameforGame);
  });

  div.appendChild(header);
  div.appendChild(pOne);
  div.appendChild(pTwo);
  div.appendChild(headerTwo);
  div.appendChild(button);

  button.style.position = "absolute";
  button.style.bottom = 0;
  button.style.left = 0;

  document.querySelector("#gamebox").appendChild(div);
}

function usersCollection(username) {
  document.querySelector("#usernameCollection").innerHTML = username +
    "'s Collection";
}

export { displayCollection, usersCollection, clearCollection };