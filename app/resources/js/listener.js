/* eslint-env browser */

import { getCollection, loadGamePage, getTimeLine,
  getGameNames } from "./DBController.js";
import autocomplete from "./GameAdding.js";
import { enterFriendName, removeFriend } from "./Friendlist.js";
import { loadHomepage } from "./Homepage.js";
import { loginExistingAccount, signOut, createUser } from "./login.js";
import { refreshGameListeners } from "./Gamepage.js";

/* creating a variable for every button */
let username = null,
  returnKeycode = 13,
  homeButton = document.querySelector("#overlay_button_home"),
  collectionButton = document.querySelector("#overlay_collection"),
  activityButton = document.querySelector("#overlay_activity"),
  addFriendButton = document.querySelector("#overlay_addfriend"),
  removeFriendButton = document.querySelector("#overlay_removefriend"),
  signOutButton = document.querySelector("#overlay_sign_out"),
  addGame = document.querySelector("#overlay_addgame"),
  gameAddingAutocomplete = document.querySelector("#myInput"),
  createAccountFrame = document.querySelector("#login_create_account"),
  existingAccountFrame = document.querySelector("#login_existing_account"),
  createUserButton = document.querySelector("#login_create_user_button"),
  loginButton = document.querySelector("#login_login_button"),
  loginText1 = document.querySelector("#t1"),
  loginText2 = document.querySelector("#t2"),
  loginText3 = document.querySelector("#t3"),
  loginText4 = document.querySelector("#t4"),
  loginText5 = document.querySelector("#t5"),

  enterGame = document.querySelector("#enterGame");

/* init the listeners for the buttons */
function initListener() {

  /* Following Buttons are used for the login screen */
  createAccountFrame.onclick = function() {
    document.querySelector("#login_login_frame").style.display = "none";
    document.querySelector("#login_create_user_frame").style.display =
      "block";
  };

  existingAccountFrame.onclick = function() {
    document.querySelector("#login_create_user_frame").style.display = "none";
    document.querySelector("#login_login_frame").style.display = "block";
  };

  loginButton.onclick = function() { loginExistingAccount();
    username = document.querySelector("#t4").value; };

  createUserButton.onclick = function() { createUser();
    username = document.querySelector("#t1").value; };

  /* Following Buttons are for changing the visible content (menu) */
  homeButton.onclick = function() {
    loadFrames("#home_content_frame");
    loadHomepage(username);
  };

  collectionButton.onclick = function() { getCollection(username, 0); };

  activityButton.onclick = function() {
    loadFrames("#activity_content_frame");
    getTimeLine(username, 0);
  };

  addGame.onclick = function() {
    loadFrames("#game_adding_frame");
    getGameNames();
  };

  //disable enter for Login and Signup
  loginText1.addEventListener("keypress", function(e) { if (e.keyCode ===
      returnKeycode) { e.preventDefault(); } });
  loginText2.addEventListener("keypress", function(e) { if (e.keyCode ===
      returnKeycode) { e.preventDefault(); } });
  loginText3.addEventListener("keypress", function(e) { if (e.keyCode ===
      returnKeycode) { e.preventDefault(); } });
  loginText4.addEventListener("keypress", function(e) { if (e.keyCode ===
      returnKeycode) { e.preventDefault(); } });
  loginText5.addEventListener("keypress", function(e) { if (e.keyCode ===
      returnKeycode) { e.preventDefault(); } });

  /*Following Buttons are the remaining options in the menu */
  addFriendButton.addEventListener("click", function() { enterFriendName(); });
  removeFriendButton.addEventListener("click", function() { removeFriend(); });
  signOutButton.addEventListener("click", signOut);

  /*Buttons etc on Game Adding Page */
  gameAddingAutocomplete.onclick = function() {
    autocomplete(document
      .querySelector("#myInput"));
  };
  enterGame.onclick = function() {
    let input = document.getElementById("myInput");
    loadGamePage(input.value, username);
    refreshGameListeners(input.value);
  };
}

function loadFrames(s) {
  document.querySelector("#home_content_frame").style.display = "none";
  document.querySelector("#activity_content_frame").style.display = "none";
  document.querySelector("#collection_content_frame").style.display = "none";
  document.querySelector("#game_adding_frame").style.display = "none";
  document.querySelector("#game_content_frame").style.display = "none";
  document.querySelector("#review_adding_frame").style.display = "none";

  document.querySelector(s).style.display = "block";
}

export default initListener;
export { loadFrames };