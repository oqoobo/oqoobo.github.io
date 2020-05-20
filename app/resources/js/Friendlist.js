/* eslint-disable no-alert */
/* eslint-env browser */

import { getFriendslist, addFriend, deletFriend,
  getCollection } from "./DBController.js";

let username = null;

function initFriendList(name) {
  username = name;
  getFriendslist(username);
}

function emptyFriendlist() {
  let list = document.querySelector("#friendlist");
  while (list.firstChild) {
    list.removeChild(list.lastChild);
  }

}

function enterFriendName() {
  let input = window.prompt("Please Enter The Username of your friend.", ""),
    buttonF = document.createElement("button");
  if (input !== null ^ input !== "") {
    alert("Cancelled");
  } else {
    alert(input + " has been added to your friendlist");
    buttonF.innerText = input;
    buttonF.addEventListener("click", function() {
      getCollection(buttonF.innerText, 0);
    });
    document.querySelector("#friendlist").appendChild(buttonF);
    addFriend(input, username);
  }
}

function removeFriend() {
  let input = window.prompt(
    "Please enter the name of the friend you wish to remove.", "");
  if (input !== null ^ input !== "") {
    alert("Cancelled");

  } else {

    // search friend in html:
    let friends = document.querySelector("#friendlist").childNodes;
    for (let i = 0; i < friends.length; i++) {

      if (friends[i].textContent === input) {

        //remove button for friend in html:
        friends[i].remove();

        //Remove Friend from Database:
        deletFriend(input, username);
        alert(input + "  has been removed.");
        return;
      }
    }

    alert(input + " is not on your friendlist.");
  }
}

export default initFriendList;
export { enterFriendName, removeFriend, emptyFriendlist };