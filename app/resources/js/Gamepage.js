/* eslint-env browser */

import {
  loadGamePage,
  makeComments,
  setRating,
  changeDescription,
} from "./DBController.js";
import imageUpload from "./Images.js";
import { loadFrames } from "./listener.js";

let username = null,
  timeOut = 800,
  gameDescriptionButton = document.querySelector("#game_description_button"),
  reviewButton = document.querySelector("#game_rating_button"),

  // These Elements/Buttons are Used for the Review-Page
  revSubmit = document.querySelector("#review_submit"),
  revBack = document.querySelector("#review_back"),
  revYes = document.querySelector("#review_yes"),
  revNo = document.querySelector("#review_no"),
  revText = document.querySelector("#review_text"),
  revRating = document.getElementsByName("rating"),
  revAlert = document.querySelector("#review_alert"),
  revGameName = document.querySelector("#review_game_name"),
  revImage = document.querySelector("#uploadImage"),

  //Not a button: this variable is used to change the Header to identify a friend's collection
  gameHeader = document.querySelector("#game_header"),
  gameDescriptionInput = document.querySelector("#game_description_addtext"),

  templateComment = document.querySelector("#comment_template"),
  gameDescription = document.querySelector("#game_description");

function checkUsername(name) {
  username = name;
}

function refreshGameListeners(gameName) {
  //add a Listener to open the correct game Page to each <button>To Game Page</button> of each game display.
  //ON Click: Updates Listeners on Game Page for Navigating to the correct 'Review Adding' page.
  //Adds functionality to Preview uploaded images
  gameHeader.innerHTML = "Game: " + gameName + " ";

  let userCname = username,
    //reset Review-Button
    resetButton = reviewButton.cloneNode(true);
  reviewButton.replaceWith(resetButton);
  reviewButton = document.querySelector("#game_rating_button");
  //button-reset done.
  reviewButton.addEventListener("click", function addReview() {
    loadFrames("#review_adding_frame");
    clearReviewListeners();

    revBack.addEventListener("click", function backAlert() {
      revAlert.style.display = "block";
      revBack.style.display = "none";
      revSubmit.style.display = "none";
    });
    revNo.addEventListener("click", function() {
      revAlert.style.display = "none";
      revBack.style.display = "inline-block";
      revSubmit.style.display = "inline-block";
    });
    revYes.addEventListener("click", function backToGamePage() {
      revAlert.style.display = "none";
      revBack.style.display = "inline-block";
      revSubmit.style.display = "block";
      loadGamePage(gameName, userCname);
    });

    let img = new imageUpload(revImage);
    img.img.src = "";
    //imgURL for saving = img.img.src;  (is null if no img has been loaded!)
    revGameName.textContent = "Review for: " + gameName;

    revSubmit.addEventListener("click", function submitReview() {
      let imgURL = "",
        commentText = revText.value,
        userCname = username,
        ratingNum = 0;

      if (img.img.src && !(img.img.src.includes("http://127."))) {
        imgURL = img.img.src;
      }

      for (let i = 0; i < revRating.length; i++) {
        if (revRating[i].checked === true) {
          ratingNum = revRating[i].value;
          // eslint-disable-next-line no-alert
          if (confirm("You have rated the game with " + revRating[i]
              .value + "/10 . Is that correct?")) {
            setRating(gameName, userCname, ratingNum);
            break;
          } else {
            return;
          }
        }
      }
      //Notiz zu ReviewID: id = spielId +  UserID +  R
      makeComments(gameName, userCname, commentText, "", imgURL);
      revText.value = "";
      setTimeout(function() { loadGamePage(gameName, userCname); },
        timeOut);
    });

  });

}

function addCommentListeners(showButton, commentButton, reviewID,
  reviewElement) {
  /*Add Listeners to a review to: 1. Show/Hide comments of this review
                                  2. Open Text Area to Comment
                                  3. Add Text as comment to Review to Database
  */
  let reviewContent = reviewElement.childNodes,
    //Content[13] = text area
    textArea = reviewContent[13],
    submitButton = reviewContent[15];
  commentButton.addEventListener("click", function() {
    if (submitButton.style.display === "none") {
      commentButton.innerHTML = "close";
      submitButton.style.display = "block";
      textArea.style.display = "block";
    } else {
      commentButton.innerHTML = "add comment";
      submitButton.style.display = "none";
      textArea.style.display = "none";
    }
  });

  showButton.addEventListener("click", function() {
    if (showButton.innerHTML === "show comments") {
      showButton.innerHTML = "hide comments";
      for (let i = 17; i < reviewContent.length; i++) {
        //end for-loop if no comments to show/hide remain;
        //if(reviewContent[i]==='undefined'){break;};
        if (reviewContent[i].style === undefined) { continue; }
        reviewContent[i].style.display = "block";
      }
    } else {
      showButton.innerHTML = "show comments";
      for (let i = 17; i < reviewContent.length; i++) {
        //end for-loop if no comments to show/hide remain
        if (reviewContent[i] === undefined) { break; }
        if (reviewContent[i].style === undefined) { continue; }
        reviewContent[i].style.display = "none";
      }
    }
  });

  submitButton.addEventListener("click", function() {

    let text = textArea.value;

    if (!(text === "")) {
      let gameName = document.querySelector("#game_name").innerHTML,
        commentDiv = templateComment.cloneNode(true),
        divParts;
      commentDiv.id = "";
      divParts = commentDiv.childNodes;
      //divParts[1] = header; divParts[3]= text;
      divParts[1].innerHTML = "Comment by: " + username;
      divParts[3].innerHTML = text + "\n written just now";
      reviewElement.appendChild(commentDiv);
      commentDiv.style.display = "block";
      //save comment in Database:
      makeComments(gameName, username, text, reviewID, "");
      textArea.value = "";
    }
  });
}

//----------------------------------------------------------------------------------------------------------------------------------
//This Method adds listeners to edit a Game's Description to a Game Page
function addDescriptionListener(gameName) {
  let submitAlert = document.querySelector("#game_description_alert"),
    newButton;
  //Reset to initial state

  gameDescriptionInput.style.display = "none";
  gameDescriptionButton.innerHTML = "Add Description";

  if (gameDescription.innerHTML !== "No Description has been added yet!") {
    gameDescriptionButton.innerHTML = "Edit Description";
    gameDescriptionInput.value = gameDescription.innerHTML;
  }

  //Remove any Listeners on gameDescriptionButton
  newButton = gameDescriptionButton.cloneNode(true);
  gameDescriptionButton.replaceWith(newButton);
  gameDescriptionButton = document.querySelector("#game_description_button");

  if (submitAlert.style.display === "block") {
    submitAlert.style.display = "none";
  }

  gameDescriptionButton.addEventListener("click", function() {
    //If description-Input-Textfield isn't shown, show it
    if (gameDescriptionInput.style.display === "none") {
      gameDescriptionInput.style.display = "block";
      gameDescriptionButton.innerHTML = "Submit Description";
      submitAlert.innerHTML =
        "Note: Pressing [Submit Description] while text is empty or unchanged closes text area.";
      submitAlert.style.display = "block";
    } else {
      if (gameDescriptionInput.value === "") {
        gameDescriptionInput.style.display = "none";
        gameDescriptionButton.innerHTML = "Add Description";
        submitAlert.style.display = "none";
      } else {
        if (gameDescriptionInput.value !== gameDescription.innerHTML) {
          submitDescription(gameName);
          gameDescription.innerHTML = gameDescriptionInput.value;
          gameDescriptionInput.style.display = "none";
          submitAlert.innerHTML = "Description has been changed.";
          submitAlert.style.display = "block";
          gameDescriptionButton.innerHTML = "Edit Description";
        } else {
          submitAlert.style.display = "none";
          gameDescriptionInput.style.display = "none";
          gameDescriptionButton.innerHTML = "Edit Description";
        }
      }
    }

  });

}

//----------------------------------------------------------------------------------------------------------------------------------

function submitDescription(nameOfGame) {
  let inputText = gameDescriptionInput.value;
  changeDescription(nameOfGame, inputText);
}

//----------------------------------------------------------------------------------------------------------------------------------
//This Function rebuilds all listeners on the review Adding-Page. Used in refreshgameListeners
function clearReviewListeners() {
  let resetYes = revYes.cloneNode(true),
    resetSubmit = revSubmit.cloneNode(true),
    resetBack = revBack.cloneNode(true),
    resetNo = revNo.cloneNode(true),
    resetText = revText.cloneNode(true),
    resetAlert = revAlert.cloneNode(true),
    resetGameName = revGameName.cloneNode(true),
    resetImage = revImage.cloneNode(true);

  revYes.replaceWith(resetYes);
  revSubmit.replaceWith(resetSubmit);
  revBack.replaceWith(resetBack);
  revText.replaceWith(resetText);
  revNo.replaceWith(resetNo);
  revAlert.replaceWith(resetAlert);
  revGameName.replaceWith(resetGameName);
  revImage.replaceWith(resetImage);

  revSubmit = document.querySelector("#review_submit");
  revBack = document.querySelector("#review_back");
  revYes = document.querySelector("#review_yes");
  revNo = document.querySelector("#review_no");
  revText = document.querySelector("#review_text");
  revAlert = document.querySelector("#review_alert");
  revGameName = document.querySelector("#review_game_name");
  revImage = document.querySelector("#uploadImage");
}

export {
  refreshGameListeners,
  addCommentListeners as addCommentListener,
  addDescriptionListener,
  checkUsername,
};