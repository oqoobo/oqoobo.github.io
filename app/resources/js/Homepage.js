/* eslint-env browser */
//getCollection (own)
//timeline (own)
//Timeline /(friends)

import { getCollection, getTimeLine, loadGamePage } from "./DBController.js";
import { sortDates, sortTimeline } from "./Activity.js";
import { refreshGameListeners } from "./Gamepage.js";

let hompageLimit = 4,
  recommList, maxRating = 10,
  minRating = 5;

function loadHomepage(username) {
  getTimeLine(username, 1); //usersLastRating
  getCollection(username, 1); //necessary to compare
  // numbers after username necessary for correct retrieval of data
  // eslint-disable-next-line no-magic-numbers
  getTimeLine(username, 2); //recent
}

function checkMyCollection(array) {
  //elementGame,collectionGamesRating,collectionGamesTotalRating,collectionGamesGenre,collectionGamesPublisher

  let gameInCollection = false;
  while (maxRating > minRating) {
    for (let i = 0; i < recommList.length; i++) {
      if (recommList[i][4] === maxRating) {
        for (let j = 0; j < array.length; j++) {
          if (recommList[i][1] === array[j][1]) {
            gameInCollection = true;
          }
        }
        if (!gameInCollection) {
          //Recommend 
          let div = createElement(recommList[i]);
          document.querySelector("#home_recommend").appendChild(div);
          maxRating = 0;
          i = recommList.length;
          break;
        }
      }
    }
    maxRating--;
  }
}

function createRecentActivity(array) {
  clearHomeRecent();

  let timeline = sortDates(array);
  //timeline will be sorted and html elements created
  timeline = sortTimeline(timeline);
  recommList = timeline;
  for (let i = 0; i < hompageLimit; i++) {
    //creating elements to display activities
    let container = createElement(timeline[i]);
    //appending container to document
    document.querySelector("#home_recent_activity").appendChild(container);
  }
}

function clearHomeRecent() {
  let recent = document.querySelector("#home_recent_activity"),
    last = document.querySelector("#home_last_activity");
  while (recent.firstChild) {
    recent.removeChild(recent.lastChild);
  }
  last.removeChild(last.lastChild);
}

function usersLastRating(array) {
  let lastRating = sortDates(array),
    container;
  lastRating = sortTimeline(lastRating);
  //Filling elements with content
  container = createElement(lastRating[0]);
  document.querySelector("#home_last_activity").appendChild(container);
}

function createElement(array) {
  let container = document.createElement("div"),
    date = document.createElement("p"),
    game = document.createElement("h3"),
    rating = document.createElement("h3"),
    user = document.createElement("h2"),
    text = document.createElement("p"),
    button = document.createElement("button"),
    img = document.createElement("img");

  //Filling elements with content
  date.innerHTML = array[0];
  game.innerHTML = array[1];
  user.innerHTML = array[2];
  text.innerHTML = array[3];
  rating.innerHTML = user.innerHTML + " has rated the game with: " +
    array[4] + "/10";
  img.innerHTML = array[6];
  button.innerHTML = "To Game";

  //Creating Listeners
  button.onclick = function() {
    loadGamePage(game.innerHTML, document.querySelector("#t4").value);
    refreshGameListeners(game.innerHTML);
  };
  user.onclick = function() { getCollection(user.innerHTML, 0); };
  //Appending all necessary elements to container
  container.appendChild(user);

  container.appendChild(game);
  if (array[3] !== undefined) {
    container.appendChild(text);
  }
  if (array[4] !== undefined) {
    container.appendChild(rating);
  }
  container.appendChild(img);
  container.appendChild(date);
  container.appendChild(button);

  return container;
}

export { loadHomepage, checkMyCollection, createRecentActivity,
  usersLastRating };