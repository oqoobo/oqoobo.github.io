/* eslint-env browser */
import { login, createNewAccount } from "./DBController.js";
import initFriendlist, { emptyFriendlist } from "./Friendlist.js";
import { loadHomepage } from "./Homepage.js";
import { loadFrames } from "./listener.js";
import { refreshGameListeners, checkUsername } from "./Gamepage.js";

let username;

function createUser() {
  let input = [document.querySelector("#t1").value, document.querySelector(
    "#t2").value, document.querySelector("#t3").value];
  if (input[1] === input[2]) {
    createNewAccount(input[0], input[1]);
    username = input[0];
    document.querySelector("#username").value = username;
    emptyFriendlist();
    initFriendlist(username);
    login(username, input[1]);
    checkUsername(username);
    loadHomepage(username);
  } else {
    // eslint-disable-next-line no-alert
    alert("Password and 'repeat Password' must be the same!");
  }
}

function loginExistingAccount() {
  let input = [document.querySelector("#t4").value, document.querySelector(
    "#t5").value];
  username = input[0];
  login(username, input[1]);
  checkUsername(username);
  emptyFriendlist();
  initFriendlist(username);
  loadFrames("#home_content_frame");
  refreshGameListeners();
  loadHomepage(username);
}

function signOut() {
  document.querySelector("#main_body").style.display = "none";
  document.querySelector("#login").style.display = "block";
  document.querySelectorAll("textarea").forEach(element => { element.value =
      ""; });
}

export { createUser, loginExistingAccount, signOut };