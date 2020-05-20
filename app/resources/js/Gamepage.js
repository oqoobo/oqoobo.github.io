
/* eslint-env browser */

import { getCollection, loadGamePage, makeComments,
    setRating, changeDescription} from "./DBController.js";
  import imageUpload from "./images.js";
import { loadFrames } from "./listener.js";

let username = null, 
  timeOut = 3000,
  gameDescriptionButton = document.querySelector("#game_description_button"),
  reviewButton = document.querySelector("#game_rating_button"),

  //
  // These Elements/Buttons are Used for the Review-Page
  revSubmit = document.querySelector("#review_submit"),
  revSubmitRating = document.querySelector("#review_submitR"),
  revBack = document.querySelector("#review_back"),
  revYes = document.querySelector("#review_yes"),
  revNo = document.querySelector("#review_no"),
  revText = document.querySelector("#review_text"),
  revRating = document.querySelector("#review_rating"),
  revAlert = document.querySelector("#review_alert"),
  revGameName = document.querySelector("#review_game_name"),
  revImage = document.querySelector("#uploadImage"),

  //Not a button: this variable is used to change the Header to identify a friend's collection
  gameHeader = document.querySelector("#game_header"),
  gameDescriptionInput = document.querySelector("#game_description_addtext"),

  templateComment = document.querySelector("#comment_template"),
  gameDescription = document.querySelector("#game_description");

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
      /*
      revSubmit = document.querySelector("#review_submit"),
      revBack = document.querySelector("#review_back"),
      revYes = document.querySelector("#review_yes"),
      revNo = document.querySelector("#review_no"),
      revText = document.querySelector("#review_text"),
      revRating = document.querySelector("#review_rating"),
      revAlert = document.querySelector("#review_alert"),
      revGameName = document.querySelector("#review_game_name"),
      revImage = document.querySelector("#uploadImage");
      */
  
      let img = new imageUpload(revImage);
      //imgURL for saving = img.img.src;  (is null if no img has been loaded!)
      revGameName.textContent = "Review for: " + gameName;
  
      revSubmit.addEventListener("click", function submitReview() {
        let imgURL = "",
          commentText = revText.value;
  
        if (img.img.src) {
          imgURL = img.img.src;
        }
  
        //Notiz zu ReviewID: id = spielId +  UserID +  R
        //Vorschlag zu ReviewID: "" (leer-string), wenn der Comment ein Review ist, "commentID des kommentierten Reviews", wenn der Comment "nur" ein Kommentar ist.
        makeComments(gameName, userCname, commentText, "", imgURL);
        revText.value = "";
        setTimeout(loadGamePage(gameName, userCname), timeOut);
      });
  
      revSubmitRating.addEventListener("click", function submitRating() {
        let userCname = username,
          rating = revRating.value;
        setRating(gameName, userCname, rating);
        revRating.value = "";
        setTimeout(getCollection(username, 0),timeOut);
      });
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
        revBack.style.display = "block";
        revSubmit.style.display = "block";
        loadGamePage(gameName, userCname);
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
          //end for-loop if no comments to show/hide remain; note that this shouldn't happen
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
        textArea.value="";
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
  
    //console.log(gameDescription.innerHTML);
    //console.log(gameDescription.innerHTML!="No Description has been added yet!");
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
    //console.log("submitting  description for "+ nameOfGame +". Description is: "+ inputText);
    changeDescription(nameOfGame, inputText);
  }
  
  //----------------------------------------------------------------------------------------------------------------------------------
  
  function clearReviewListeners() {
    let resetYes = revYes.cloneNode(true),
      resetSubmit = revSubmit.cloneNode(true),
      resetSubmitR = revSubmitRating.cloneNode(true),
      resetBack = revBack.cloneNode(true),
      resetNo = revNo.cloneNode(true),
      resetText = revText.cloneNode(true),
      resetRating = revRating.cloneNode(true),
      resetAlert = revAlert.cloneNode(true),
      resetGameName = revGameName.cloneNode(true),
      resetImage = revImage.cloneNode(true);
  
    revYes.replaceWith(resetYes);
    revSubmit.replaceWith(resetSubmit);
    revSubmitRating.replaceWith(resetSubmitR);
    revBack.replaceWith(resetBack);
    revText.replaceWith(resetText);
    revNo.replaceWith(resetNo);
    revRating.replaceWith(resetRating);
    revAlert.replaceWith(resetAlert);
    revGameName.replaceWith(resetGameName);
    revImage.replaceWith(resetImage);
  
    revSubmit = document.querySelector("#review_submit");
    revSubmitRating = document.querySelector("#review_submitR");
    revBack = document.querySelector("#review_back");
    revYes = document.querySelector("#review_yes");
    revNo = document.querySelector("#review_no");
    revText = document.querySelector("#review_text");
    revRating = document.querySelector("#review_rating");
    revAlert = document.querySelector("#review_alert");
    revGameName = document.querySelector("#review_game_name");
    revImage = document.querySelector("#uploadImage");
  }

  export {refreshGameListeners, addCommentListeners as addCommentListener, addDescriptionListener};