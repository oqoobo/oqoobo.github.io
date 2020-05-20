/* eslint-env browser */

import { loadGamePage, getCollection } from "./DBController.js";
import { refreshGameListeners } from "./Gamepage.js";

let ten = 10,
  limit = 100;

function createTimeline(array) {
  let timeline = [],
    picture = "",
    ratingRef = "",
    text = "",
    rating = "",
    date;

  for (let i = 0; i < array.length; i++) {
    let temp = array[i],
      value;
    // eslint-disable-next-line guard-for-in
    for (let key in temp) {

      value = temp[key];

      //The spaceholders get values if they exist
      if (value.ratingRef !== null) { ratingRef = value.ratingRef; }
      if (value.text !== null) { text = value.text; }
      if (value.picture !== null) { picture = value.picture; }
      if (value.rating !== null) { rating = value.rating; }

      //splitting date and time to fullfill correct format
      date = new Date(value.date);
      let month = date.getMonth(),
        day = date.getDate(),
        time = value.time.split(":"),
        entry;

      //necessary 0s are added through if clauses
      if (time[0] < ten) { time[0] = "0" + time[0]; }
      if (time[1] < ten) { time[1] = "0" + time[1]; }
      if (time[2] < ten) { time[2] = "0" + time[2]; }
      if (date.getDate() < ten) { day = "0" + date.getDate(); }
      if (date.getMonth() < ten) { month = "0" + date.getMonth(); }

      //if no exact time stamp is present, time will be 00:00:00 
      if (value.time !== null) {
        date = new Date(date.getFullYear() + "-" + month + "-" + day
          .toString() + "T" +
          time[0] + ":" + time[1] + ":" + time[2]);
      } else {
        date = new Date(date.getFullYear() + "-" + month + "-" + day
          .toString() + "T00:00:00");
      }

      //all single values combined in array as one activity and then entered in timeline
      entry = [date, value.game, value.name, text, rating, ratingRef, picture];
      timeline.push(entry);
    }
  }
  //timeline will be sorted and html elements created
  timeline = sortTimeline(timeline);
  createVisibleItems(timeline);
}

//function to sort timeline
function sortTimeline(array) {
  let sorted =
    true; //boolean to stop loop once no more changes happen after complete go through of list
  while (sorted === true) {
    sorted = false;
    for (let i = 0; i < array.length - 1; i++) {
      let temp;
      if (compareDates(array[i][0], array[i + 1][0]) === 1) {
        temp = array[i + 1];
        array[i + 1] = array[i];
        array[i] = temp;
        sorted = true;
      }
    }
  }
  return array;
}

//function to compare dates
function compareDates(dateA, dateB) {
  if (dateB - dateA > 0) {
    return 1;
  }
  return -1;
}

function createVisibleItems(activityArray) {
  for (let i = 0; i < limit; i++) {
    //creating elements to display activities
    let container = document.createElement("div"),
      date = document.createElement("p"),
      game = document.createElement("h3"),
      rating = document.createElement("h3"),
      user = document.createElement("h2"),
      text = document.createElement("p"),
      button = document.createElement("button"),
      img = document.createElement("img");

    //Filling elements with content
    date.innerHTML = activityArray[i][0];
    game.innerHTML = activityArray[i][1];
    user.innerHTML = activityArray[i][2];
    text.innerHTML = activityArray[i][3];
    rating.innerHTML = user.innerHTML + " has rated the game with: " +
      activityArray[i][4] + "/10";
    img.innerHTML = activityArray[i][6];
    button.innerHTML = "To Game";

    //Creating Listeners
    button.onclick = function() {
      loadGamePage(game.innerHTML, document.querySelector("#t4").value);
      refreshGameListeners(game.innerHTML);
    };
    user.onclick = function() { getCollection(user.innerHTML, 0); };

    //Appending all necessary elements to container
    container.appendChild(user);
    container.appendChild(button);
    container.appendChild(game);
    if (activityArray[i][3] !== undefined) {
      container.appendChild(text);
    }
    if (activityArray[i][4] !== undefined) {
      container.appendChild(rating);
    }
    container.appendChild(img);
    container.appendChild(date);

    //appending container to document
    document.querySelector("#activity_display").appendChild(container);

  }
}

export { createTimeline };