/* eslint-env browser */
import { loadFrames } from "./listener.js";
import { addDescriptionListener,
  addCommentListener as addCommentListeners } from "./Gamepage.js"
import { displayCollection, usersCollection,
  clearCollection } from "./Collection.js";
import { createTimeline } from "./Activity.js";
import { emptyFriendlist } from "./Friendlist.js";
import { getNames } from "./GameAdding.js";
import { usersLastRating, checkMyCollection,
  createRecentActivity } from "./Homepage.js";

//The Number of Comments displayed on loading a Game Page.
let gameCommentsCount = 10;

/*--------------------------------------------------------------------------------------------------------------------------------
Der Teil Verbindet zu Firebase:
*/
var firebaseConfig = {
  apiKey: "AIzaSyDgkB19MvYOjB9xTzdjkU2T_PWVyTz5svk",
  authDomain: "gamecollection-dcadc.firebaseapp.com",
  databaseURL: "https://gamecollection-dcadc.firebaseio.com/",
  projectId: "gamecollection-dcadc",
  storageBucket: "gamecollection-dcadc.appspot.com",
  messagingSenderId: "922435945695",
  appId: "1:922435945695:web:78e1537e93640e5b0fd56a",
  measurementId: "G-45SWEY56SY"
},ref;
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
ref = firebase.database().ref();


/*--------------------------------------------------------------------------------------------------------------------------------
0. Check Return(Zeigt, dass wir die Return Funktion nicht mit Firebase benutzen können. Kein Programmteil sondern nur zum rumproberen, falls man es doch zum laufen kriegt)
*/
checkReturn();
async function checkReturn() {
  //let tempt = await getFriendslist("carl")
}

/*--------------------------------------------------------------------------------------------------------------------------------
1.  FreundesListe Ausgabe
    Input: name des Nutzers dessen Freundesliste ausgegeben werden soll.
    Output: Ein Array, das alle Freunde des Nutzers enthält.(Arraynamen friends)
*/
function getFriendslist(friendsName) {
  emptyFriendlist();
  ref.once("value", function(snapshot) {
    var temp = snapshot.child("user").child(friendsName).child(
      "friendsList").val();
    let json = JSON.parse(JSON.stringify(temp)),
      friends = Object.keys(json);
    //Creating Buttons for each friend
    for (let i = 0; i < friends.length; i++) {
      let button = document.createElement("button");
      button.innerText = friends[i];
      button.addEventListener("click", function() {
        getCollection(button.innerText, 0);
      });
      document.querySelector("#friendlist").appendChild(button);
    }
  }, function(error) {
    console.log("Error: " + error.code);
    return null;
  });
}

/*--------------------------------------------------------------------------------------------------------------------------------
2.  addFriend
    Input: Name des hinzuzufügenden Freundes; Name des Nutzers der einen Freund hinzufügen will.
    Output: In firebase wird dem Nutzer ein Freund in die Freundesliste hinzugefügt.
    Anmerkung: Es wird überprüft ob der angegebene Freund als nutzer existiert und ob der man diesen noch nicht als freund hat, nicht aber ob man sich selber hinzufügen will.
*/
function addFriend(friendName, addFriendUserName) {
  let userRef = ref.child("user").child(addFriendUserName).child("friendsList")
    .child(friendName);

  //Check if friend exists.
  ref.once("value", function(snapshot) {
    var temp = snapshot.child("user").val();
    let nameJson = JSON.parse(JSON.stringify(temp)),
      names = Object.keys(nameJson);
    if (names.includes(friendName)) {
      if (snapshot.child("user").child(addFriendUserName).child(
          "friendsList").child(friendName).exists()) {} else {
        userRef.set(true);
      }
    }
  }, function(error) {
    console.log("Error: " + error.code);
  });
}

/*--------------------------------------------------------------------------------------------------------------------------------
3.  delete Friend
    Input: Name des Freundes, der entfernt werden soll; Name des Nutzers, der den Freund entfernen will.
    Output: Der Freund wird entfernt.
    Anmerkung: Überprüfen ob der freund existiert ist nicht nötig, da falls er nicht existiert einfach nichts passiert.
*/
function deletFriend(friend, deletFriendUserName) {
  let userFriendlistRef = ref.child("user").child(deletFriendUserName).child(
    "friendsList").child(friend);
  userFriendlistRef.remove();
}


/*--------------------------------------------------------------------------------------------------------------------------------
4.  make Comment
    Input: name des spiel, das kommentiert wird; name des Nutzers, der es kommentiert; der Text des kommentars
    Output: Ein Kommentar wird beim spiel hinterlassen; Der Timline der Freunde wird eingetragen, dass der kommentar gemacht wurde; Beim Nutzer wird ein Eintrag mit KommentarID hinterlassen, dass er den kommentar gemacht hat;
    Anmerkung:  Der Kommentar wird so gespeichert: kommentarID{name(name des Nutzers),date(datum),text(kommentar Text),time(zeit als der kommentar gemacht wurde)}
                Die KommentarID setzt sich aus der SpielID, der NuterID und der wievielte Kommentar das von diesem Nutzer zu diesem spiel ist. 
                  (g1u1c1 was bedeutet game1user1comment1). Die gameID/NutzerID/ZählerID sind einfach zahlen die immer mitzählen.
                Beim eintrag in die Timline der Freunde kommt auch noch der Name des Nutzers hinzu.
                Beim eintrag bei dem Nutzerselber steht blos die kommentarID und der spielname dazu.
*/
//makeComments("Dark Souls","carl","its Good","g1u1r","BeispielTextFürBild:lkajlkjaslkj");
function makeComments(gameName, user, text, reviewLink, pictureText) {
  let comments = [],
    userID, gameID, commentNum = 0,
    today = new Date(),
    commentDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" +
    today.getDate(),
    commentTime = today.getHours() + ":" + today.getMinutes() + ":" + today
    .getSeconds(),
    commentName = user,
    commentText = text;
  ref.once("value", function(snapshot) {
    var temp = snapshot.child("game").child(gameName).child("commentList")
      .val();
    userID = snapshot.child("user").child(user).child("userID").val();
    gameID = snapshot.child("game").child(gameName).child("gameID").val();
    let json = JSON.parse(JSON.stringify(temp));
    comments = Object.keys(json);
    comments.forEach(element => {
      if (element.includes("u" + userID)) {
        commentNum++;
      }
    });
    commentNum++;
    commitComment(gameName, gameID, userID, commentNum, commentDate,
      commentText, commentTime, commentName, reviewLink, pictureText);
    let commentRef = ref.child("game").child(gameName).child("commentList")
      .child("g" + gameID + "u" + userID + "c" + commentNum),
      commentFriendsJson = snapshot.child("user").child(commentName).child(
        "friendsList").val(),
      commentJson = JSON.parse(JSON.stringify(commentFriendsJson)),
      commentFriends = Object.keys(commentJson),
      commentTag = "g" + gameID + "u" + userID + "c" + commentNum,
      commentFill = {
        name: commentName,
        text: commentText,
        date: commentDate,
        time: commentTime,
        game: gameName,
        ratingRef: reviewLink,
        picture: pictureText
      };
    timeLine(commentName, commentTag, commentFill);
    if (!(pictureText == "") && pictureText) {
      changeGameFoto(gameName, pictureText);
    }


  }, function(error) {
    console.log("Error: " + error.code);
  });

}

function commitComment(gameName, gameID, userID, commentNum, commentDate,
  commentText, commentTime, commentName, commentReviewLink, commentPictureText
  ) {
  let commentRef = ref.child("game").child(gameName).child("commentList").child(
      "g" + gameID + "u" + userID + "c" + commentNum),
    commentUserRef = ref.child("user").child(commentName).child("commentList")
    .child("g" + gameID + "u" + userID + "c" + commentNum);

  commentRef.set({
    date: commentDate,
    text: commentText,
    time: commentTime,
    userName: commentName,
    reviewLink: commentReviewLink,
    picture: commentPictureText
  });
  commentUserRef.set(gameName);

}

/*--------------------------------------------------------------------------------------------------------------------------------
5.  Ad activity to timline of friends. wird in makeComment und setRating benutzt 
    Input: Name des nutzers der eine Aktivität gemacht hat; TimeLineTag sind die Rating oder CommentarIDs; TimeLineFill ist der Inhalt
    Output: Allen Freunden des Nutzers wird die Aktivität in die Timeline geschrieben
    Hinweis:  es gibt kein Aufrufbeispiel, da die funktion wahrscheinlich nur von der makeComment und SetRating funktion selber benutzt wird
              Falls in der Freundesliste noch freunde stehen, die nichtmehr exitieren werden deren Akkounts nur bestehend aus dem PFad zur timline wieder hergestellt.
*/
function timeLine(timeLineUserName, timeLineTag, timeLineFill) {
  let timeLinefriendRef = ref.child("user").child(timeLineUserName).child(
    "timeline").child(timeLineTag);
  timeLinefriendRef.set(timeLineFill);
}

/*--------------------------------------------------------------------------------------------------------------------------------
6.  Set Rating
    Input: Name des bewerteten Spiels; Name des Nutzers, der das Spiel bewertet, Die bewertung
    Output: Dem Spiel wird eine Bewertung hinzugefügt; Der Timline der Freunden wird die Rating Aktivität hinzugefügt; Dem Nutzer wird in der ratingList eine Refferenz bestehend aus ratingID und dem bewerteten Spiel hinterlassen.
    Hinweis: Aufbau des Ratings: RatingID{rating}; Die RatingID ist wie die KommentarID aufgebaut, aber hat keinen Zähler der Rating nummer (g1u1r); 
      Der Aktivitätseintrag in der Timline der Freunde ist so aufgebaut: ratingID{date(datum), game(das bewertete Spiel), name(name des Nutzer der das SPiel bewertet hat) rating(die bewertung) time(die zeit er Bewertung)}
    Achtung: Es giebt keine begrenzung was als bewertung eingegeben werden kann, dass muss vorher geschehen.
    */
function setRating(ratingGame, ratingUser, ratingRating) {
  ref.child("user").child(ratingUser).child("userID").once("value", function(
    snapshot) {
    let ratingUserID = snapshot.val();
    setRatingGameStep(ratingGame, ratingUser, ratingRating, ratingUserID);
  }, function(error) {
    console.log("Error: " + error.code);
  });
}

function setRatingGameStep(ratingGame, ratingUser, ratingRating, ratingUserID) {

  ref.child("game").child(ratingGame).once("value", function(snapshot) {
    let ratingGameID = snapshot.child("gameID").val(),
      ratingRef = ref.child("game").child(ratingGame).child("ratingList")
      .child("g" + ratingGameID + "u" + ratingUserID + "r");
    setRatingEndStep(ratingGame, ratingUser, ratingRating, ratingUserID,
      ratingRef, ratingGameID);
  }, function(error) {
    console.log("Error: " + error.code);
  });

}

function setRatingEndStep(ratingGame, ratingUserE, ratingRating, ratingUserID,
  ratingRef, ratingGameID) {

  let ratingUserRef = ref.child("user").child(ratingUserE).child("gameList")
    .child(ratingGame),
    ratingUserRefVal = "g" + ratingGameID + "u" + ratingUserID + "r",
    ratingTimeLineTag = "g" + ratingGameID + "u" + ratingUserID + "r",
    today = new Date(),
    ratingDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" +
    today.getDate(),
    ratingTime = today.getHours() + ":" + today.getMinutes() + ":" + today
    .getSeconds(),
    ratingTimeLineFill = { name: ratingUserE, game: ratingGame,
      date: ratingDate, time: ratingTime, rating: ratingRating };
  ratingUserRef.set(ratingUserRefVal);
  timeLine(ratingUserE, ratingTimeLineTag, ratingTimeLineFill);

  let rateNum = ratingRating;
  ratingRef.set(rateNum);
  updateRating(ratingGame);
}
/*--------------------------------------------------------------------------------------------------------------------------------
7.  Get Rating
    Input: name des Spiels das der Nutzer bewertet hat; Den Namen des Nutzers, dessen Bewertung man haben will
    Output: Man bekommt das Rating, das ein Nutzer zu einem Spiel angegeben hat(Variablenname ratingResult.)
    Hinweis: das Ratings für die SammlungsSeite eines Nutzers wird in der getCollection sepperat rausgeholt(musste ich so machen, da returns nicht functionieren.) 
              
*/
function getRating(ratingGame, ratingUser) {
  ref.once("value", function(snapshot) {
    let ratingUserID = snapshot.child("user").child(ratingUser).child(
        "userID").val(),
      ratingGameID = snapshot.child("game").child(ratingGame).child(
        "gameID").val(),
      ratingResult = snapshot.child("game").child(ratingGame).child(
        "ratingList").child("g" + ratingGameID + "u" + ratingUserID + "r")
      .val();
  }, function(error) {
    console.log("Error: " + error.code);
  });
}

/*--------------------------------------------------------------------------------------------------------------------------------
8.  getCollection
    Input: Name des Nutzers
    Output: Ein Array das aus dem namen der bewerteten Spiele besteht und die Bewertng dazu.
    Hinweis: Benutzt die collectionGames Variable für die Namen
              Benutzt das collectionRatings Array für die Ratings zu den Namen(oder auch für Namen). Es handelt sich um ein Array, welches das Namens/rating Paar in eigenen Arrays speichert.
                  ZB: collectionRatings[0][0] für den Namen des ersten Spiels. collectionRatings[0][1] für das Rating dazu. 
*/
function getCollection(collectionUserName, num) {
  clearCollection();
  if (num === 0) {
    loadFrames("#collection_content_frame");
    usersCollection(collectionUserName);
  }
  ref.once("value", function(snapshot) {
    let collectionInput = snapshot.child("user").child(collectionUserName)
      .child("gameList").val(),
      collectionJson = JSON.parse(JSON.stringify(collectionInput));
    let collectionGames = Object.keys(collectionJson),
      collectionRatings = [],
      collectionGamesRating,
      collectionGamesRatingRef,
      collectionGamesTotalRating,
      collectionGamesGenre,
      collectionGamesPublisher;
    collectionGames.forEach(elementGame => {
      collectionGamesRatingRef = snapshot.child("user").child(
        collectionUserName).child("gameList").child(elementGame).val();
      collectionGamesRating = snapshot.child("game").child(elementGame)
        .child("ratingList").child(collectionGamesRatingRef).val();
      collectionGamesTotalRating = snapshot.child("game").child(
        elementGame).child("rating").val();
      collectionGamesGenre = snapshot.child("game").child(elementGame)
        .child("genre").val();
      collectionGamesPublisher = snapshot.child("game").child(
        elementGame).child("publisher").val();
      collectionRatings.push([elementGame, collectionGamesRating,
        collectionGamesTotalRating, collectionGamesGenre,
        collectionGamesPublisher
      ]);
      // Extra methode die pro game ein div container an das collection div hängt. Übergeben wird name, publisher, genre, rating

      if (num === 0) { displayCollection(collectionUserName,
          elementGame, collectionGamesPublisher, collectionGamesGenre,
          collectionGamesTotalRating); }


    });
    if (num === 1) {
      checkMyCollection(collectionRatings);
    }
  }, function(error) {
    console.log("Error: " + error.code);
  });
}

/*--------------------------------------------------------------------------------------------------------------------------------
9.  new User
    Input: Der gewünschte Nutzername; Das Passwort
    Output: Erstellt einen neuen Nutzer in Firebase; Der Nutzercounter wird um eins erhöht
    Hinweis:  Es wird geschaut ob der name bereits existiert, falls noch nicht dann wird ein neuer Nutzer erstellt, falls der nahme vergeben ist wird in der console "name exists" ausgegeben
              Der erstellte Nutzer besteht aus: nutzerName{passwort,userID} 
    */
function createNewAccount(createNewAccountName, createAccountPassword) {

  ref.once("value", function(snapshot) {
    if (snapshot.child("user").child(createNewAccountName).exists()) {
      //Falls der Nutzer schon existiert
      alert("User already exists");
    } else {
      let createNewAccountNum = snapshot.child("userNum").val();
      createNewAccountNum++;
      ref.child("user").child(createNewAccountName).set({
        "commentList": {},
        "friendsList": {},
        "gameList": {},
        "password": createAccountPassword,
        "timeline": {},
        "userID": createNewAccountNum
      });
      ref.child("userNum").set(createNewAccountNum);
    }
  }, function(error) {
    console.log("Error: " + error.code);
  });

}


/*--------------------------------------------------------------------------------------------------------------------------------
10. new Game
    Input: Name des hinzuzufügenden Spiels; Die Spielbeschreibung; genre des Spiels; erscheinungsjahr; Publisher ; developer ; Operating System
    Output: ein neues Spiel in der Datenbank; der Spielcounter wird um eins erhöht.
*/
function newGame(newGameName, newGameDiscription, newGameGenre,
  newGamePublished, newGamePublisher, newGameDeveloper, newGameOS, id) {
  ref.once("value", function(snapshot) {

    let newGameID = id,
      newGameCommentFill,
      newGameRatingFill;

    newGameID++;
    newGameRatingFill = "g" + newGameID + "u0" + "r";
    newGameCommentFill = "g" + newGameID + "u0";
    ref.child("game").child(newGameName).set({
      "commentList": {
        [newGameCommentFill]: true
      },
      "discription": newGameDiscription,
      "gameID": newGameID,
      "genre": newGameGenre,
      "published": newGamePublished,
      "publisher": newGamePublisher,
      "developer": newGameDeveloper,
      "ratingList": {
        [newGameRatingFill]: 0 },
      "opperatingSystem": newGameOS,
      "rating": 0
    });
    ref.child("gameNum").set(newGameID);
  }, function(error) {
    console.log("Error: " + error.code);
  });

}



/*--------------------------------------------------------------------------------------------------------------------------------
11. login
    Input: NutzerName, passwort
    Output: wo console.log("login steht") ist der Pfad zum einloggen. Wo "Not login" sthet ist der Pfad für ein fehlgeschlagener login
    Hinweis: die funktion ist nur die Basis fürs Einlogen und liefert nur die Abfrage ob ie Daten stimmen.
*/
function login(loginName, loginPassword) {
  let count = 0;
  ref.once("value", function(snapshot) {
    if (snapshot.child("user").child(loginName).child("password").val() ===
      loginPassword) {
      document.querySelector("#login").style.display = "none";
      document.querySelector("#main_body").style.display = "block";
    } else {
      if (count > 5) {
        alert("Wrong User or Password");
      } else {
        count++;
        login(loginName, loginPassword);
      }
    }

  }, function(error) {
    console.log("Error: " + error.code);
  });

}

/*--------------------------------------------------------------------------------------------------------------------------------
12. gamePage
    Input: Name des Spiels; Nutzernamen
    Output:gamePageComments(Array aller Kommentare);gamePageRating(das insgesamte Rating des Spiels); gamePageMyRating(das Rating das der Nutzer abgegeben hat);gamePageDiscription(spielbeschreibung);gamePageGenre(Spiel Genre);gamePagePublished(Veröffentlichung des Spiels)
    Hinweis:  Beim laden der Game Page Seite wird das Gesammtrating geupdated;
              Das aufrufen weiterer Funktionen oder Weiterverarbeiten am Ende der Funktion gamePage machen, da dann alle Variablen geladen sein sollten
      //gamePageComments sind so aufgebaut: 0. KommentarId   1. Datum    2.Text    3.Time    5.Name des Komentators
      //gamePageComments sind so aufgebaut: 0. KommentarId   1. Datum    2.Text    3.Text    4.Time    5.Name des Komentators 6. Link zum Review 7. Der Bildtext.
        //Um zb den name des Kommentators von dem Komentar an Stelle 10 zu bekommen: gamePageComments[10][5]
    
  */

function loadGamePage(loadGamePageGame, loadGamePageUserName) {
  let loadGamePageRef = ref.child("user").child(loadGamePageUserName);
  loadGamePageRef.once("value", function(snapshot) {
    let loadGamePageUserId = snapshot.child("userID").val();
    gamePage(loadGamePageGame, loadGamePageUserId);
  }, function(error) {
    console.log("Error: " + error.code);
  });
}

function gamePage(gamePageGameName, gamePageUserID) {
  let gamePageRef = ref.child("game").child(gamePageGameName),
    gamePageDiscription, gamePageGenre, gamePagePublished, gamePageRating,
    gamePageMyRating, gamePageComments = [],
    gamePageCommentKeys, gamePageDeveloper, gamePagePubisher, gamePageOs,
    gamePagePicture;


  gamePageRef.once("value", function(snapshot) {
    gamePageDiscription = snapshot.child("discription").val();
    gamePageGenre = snapshot.child("genre").val();
    gamePagePublished = snapshot.child("published").val();
    gamePageDeveloper = snapshot.child("developer").val();
    gamePagePubisher = snapshot.child("publisher").val();
    gamePageOs = snapshot.child("opperatingSystem").val();
    gamePagePicture = snapshot.child("thumbnail").val();
    let gamePageRatingList = snapshot.child("ratingList").val(),
      gamePageRatingJson = JSON.parse(JSON.stringify(gamePageRatingList)),
      gamePageRatingKeyArray = Object.keys(gamePageRatingJson),
      gamePageRatingAgregat = [],
      gamePageGameID, gamePageAllRatings = [];
    gamePageRatingKeyArray.forEach(gamePageRatingElement => {
      let tempNum = snapshot.child("ratingList").child(
        gamePageRatingElement).val();
      gamePageAllRatings.push([gamePageRatingElement, tempNum]);
    });
    gamePageRating = snapshot.child("rating").val();
    //get my rating
    gamePageGameID = snapshot.child("gameID").val();
    gamePageMyRating = snapshot.child("ratingList").child("g" +
      gamePageGameID + "u" + gamePageUserID + "r").val();
    //get comments
    let gamePageCommentKeysList = snapshot.child("commentList").val(),
      gamePageCommentgJson = JSON.parse(JSON.stringify(
        gamePageCommentKeysList)),
      gamePageCommentTrashArray;
    gamePageCommentKeys = Object.keys(gamePageCommentgJson)
    gamePageCommentKeys.forEach(gamePageCommentElement => {
      let gamePageCommentDate = snapshot.child("commentList").child(
          gamePageCommentElement).child("date").val(),
        gamePageCommentText = snapshot.child("commentList").child(
          gamePageCommentElement).child("text").val(),
        gamePageCommentTime = snapshot.child("commentList").child(
          gamePageCommentElement).child("time").val(),
        gamePageCommentUser = snapshot.child("commentList").child(
          gamePageCommentElement).child("userName").val(),
        gamePageCommentReviewLink = snapshot.child("commentList").child(
          gamePageCommentElement).child("reviewLink").val(),
        gamePageCommentPicture = snapshot.child("commentList").child(
          gamePageCommentElement).child("picture").val();
      gamePageComments.push([gamePageCommentElement,
        gamePageCommentDate, gamePageCommentText,
        gamePageCommentTime, gamePageCommentUser,
        gamePageCommentReviewLink, gamePageCommentPicture
      ]);
    });
    gamePageCommentTrashArray = gamePageComments.splice(0, 1);
    gamePageCommentTrashArray = gamePageAllRatings.splice(0, 1);

    //Das Benutzen der Variablen oder Aufrufen von Funktionen hier!
    //-----------------------------------------------------------------------------------------------------------------
    /* Note: First Div in Array is GameDisplaybox, second Div is the Preview Image
     there is always two texts and a <br> between the Divs
    gameDisplayElements[1] = displaybox
    gameDisplayElements[3] = Image
    gameDisplayElements[7] = Template-node first comment */

    let gameInfoBox = document.querySelector("#game_info").childNodes,
      gameImageDisplay = document.querySelector("#game_image"),
      templateReview = document.querySelector("#review_template"),
      templateComment = document.querySelector("#comment_template"),
      reviewList = document.querySelector("#game_reviews");

    //load Game Display Frame to display generic game page
    loadFrames("#game_content_frame");

    // Update Game Info start ----------------------------------------------------------------------------------------------
    gameImageDisplay.src = "";
    if (gamePagePicture) {
      if (!(gamePagePicture.includes("https://oqoobo"))) {
        gameImageDisplay.src = gamePagePicture;
      }
    }
    //Upadate Game Name
    gameInfoBox[1].textContent = gamePageGameName;
    //Update publisher
    gameInfoBox[3].textContent = "Publisher: " + gamePagePubisher;
    //Update Dev
    gameInfoBox[5].textContent = "Developer: " + gamePageDeveloper;
    //Update Genres
    gameInfoBox[7].textContent = "Genres: " + gamePageGenre;
    //Update Description
    if (gamePageDiscription === "") {
      gameInfoBox[9].textContent = "No Description has been added yet!";
    } else {
      gameInfoBox[9].textContent = gamePageDiscription;
    }
    addDescriptionListener(gamePageGameName);
    //Note: Description Listener needs to run here to ensure Description is Updated before calling addDescriptionListener();
    // Update Release Date
    gameInfoBox[11].textContent = "Released " + gamePagePublished;
    //Update OS
    if (gamePageOs === "") {
      gameInfoBox[13].textContent = "No OS information has been added yet!";
    } else {
      gameInfoBox[13].textContent = "Runs on: " + gamePageOs;
    }
    //Update Average Rating
    gameInfoBox[15].textContent = "Average Rating: " + gamePageRating +
      "/10";
    if (gamePageMyRating) {
      gameInfoBox[17].textContent = " My Rating: " + gamePageMyRating +
        "/10";
    } else {
      gameInfoBox[17].textContent = " No rating by you! ";
    }

    // Update Game Info  done ----------------------------------------------------------------------------------------------

    //remove Comments from other Games

    while (reviewList.firstChild) {
      reviewList.removeChild(reviewList.lastChild);
    }
    //unhide the Template-node firstcomment
    templateReview.style.display = "block";

    let comments = [],
      reviews = [];

    gamePageComments.forEach(element => {
      if (element[5] === "") {
        //gamePageComments (aka element in dieser Methode) sind so aufgebaut: 0. KommentarId   1. Datum    2.Text    3.Time    4.Name des Komentators 5. Link zum Review 6. Der Bildtext.   
        let review = templateReview.cloneNode(true);
        //review.id = "";
        let reviewContent = review.childNodes;

        //content[1] = Username     content[3] = Rating    content[5] = ReviewText    content[7] = Picture     content[9] = Comment-Button

        //Username
        reviewContent[1].textContent = "Review by: " + element[4];

        //Rating from DataBase
        let userRating = snapshot.child("ratingList").child("g" +
          gamePageGameID + "u" + gamePageUserID + "r").val();
        reviewContent[3].textContent = userRating + "/10";

        //text, Date, Time:            text         endline             Date                time
        reviewContent[5].textContent = element[2] + "\n" + "written " +
          element[1] + ", " + element[3];

        //Picture  
        if (!(element[6] === "") && element[6]) {

          //Note: When a Comment contains no Picture, gamePageComments[][6] contains "https://oqoobo". Setting the img.src to this URL would result in a "Broken Picture"
          //This is a workaround to avoid such broken pictures
          if (!(element[6].includes("https://oqoobo"))) {
            reviewContent[7].src = element[6];
          }else{
            reviewContent[7].style.display = "none";
          }
        }

        //add Listeners to Comment-buttons, method in Listeners.js, needs: "show comments"-Button, "add comment"-Button, ID of Review, Review-element
        addCommentListeners(reviewContent[9], reviewContent[11],
          element[0], review);

        //write own ID to last element of Div. This is a hidden element used to get ID in the next for-loop.
        reviewContent[1].id = element[0];
        //save to array
        reviews.push(review);
        //Append Review
        reviewList.appendChild(review);

      } //Else: if element is a comment, save it to comments
      else {
        //save to array
        comments.push(element);
      }
    });
    //append Comments to correct Reviews an Hide them
    reviews.forEach(review => {
      let contentOfReview = review.childNodes;
      let idOfReview = contentOfReview[1].id;
      comments.forEach(comment => {
        //gamePageComments (aka comment in dieser Methode) sind so aufgebaut: 0. KommentarId   1. Datum    2.Text    3.Time    4.Name des Komentators 5. Link zum Review 6. Der Bildtext.
        if (idOfReview === comment[5]) {
          let divComment = templateComment.cloneNode(true);

          let divParts = divComment.childNodes;
          //divParts[1] = header; divParts[3]= text;
          divParts[1].innerHTML = "Comment by: " + comment[4];
          divParts[3].innerHTML = comment[2] + "\n written " +
            comment[1] + ", " + comment[3];


          review.appendChild(divComment);

          //comment.style.display = "none";
          //remove comment from array
          let index = comments.indexOf(comment);
          comments.splice(index, 1);
        }
      });
    });
    comments = null;
    reviews = null;
    //Hide Template-node
    templateReview.style.display = "none";
  }, function(error) {
    console.log("Error: " + error.code);
  });
}




/*--------------------------------------------------------------------------------------------------------------------------------
13. spielNamen ausgeben
    Input: 
    Output: Ein Array, das alle Spiele  enthält.(Arraynamen friends)
*/
//getGameNames();
function getGameNames() {
  ref.once("value", function(snapshot) {
    var temp = snapshot.child("game").val();
    let json = JSON.parse(JSON.stringify(temp)),
      gameNames = Object.keys(json);
    //hier weiterarbeiten
    getNames(gameNames);
  }, function(error) {
    console.log("Error: " + error.code);
    return null;
  });
}
/*--------------------------------------------------------------------------------------------------------------------------------
14. Timeline ausgeben.
    Input: 
    Output: 
*/
//getTimeLine("carl");
function getTimeLine(getTimeLineUser, num) {
  //alle  freundes namen. und dann die Timline von allen in ein Array.
  let timeLineArray = [];

  switch (num) {
    case 1:
      ref.once("value", function(snapshot) {
        var temp = snapshot.child("user").child(getTimeLineUser).child(
          "timeline").val();
        let json, timeline;
        if (temp != null) {
          json = JSON.parse(JSON.stringify(temp)), timeline = Object.keys(
            json);
          timeLineArray.push(json);
        }
        usersLastRating(timeLineArray);
      }, function(error) {
        console.log("Error: " + error.code);
        return null;
      });
      break;

    default:
      ref.once("value", function(snapshot) {
        var temp = snapshot.child("user").child(getTimeLineUser).child(
          "friendsList").val();
        let json = JSON.parse(JSON.stringify(temp)),
          friends = Object.keys(json);
        friends.forEach(timeLineElement => {
          var timeLineTemp = snapshot.child("user").child(
            timeLineElement).child("timeline").val();
          let timeLineJson, timeLineOneUser;
          if (timeLineTemp != null) {
            timeLineJson = JSON.parse(JSON.stringify(timeLineTemp)),
              timeLineOneUser = Object.keys(timeLineJson);
            timeLineArray.push(timeLineJson);
          }
        });
        if (num === 2) {
          createRecentActivity(timeLineArray);
        } else {
          createTimeline(timeLineArray);
        }

      }, function(error) {
        console.log("Error: " + error.code);
        return null;
      });
      break;
  }
}

/*--------------------------------------------------------------------------------------------------------------------------------
15. Change Description
    Input: Name des Spiels, Der Beschreibungstext.
    Output: 
*/
function changeDescription(cDGameName, cDDescriptionText) {
  ref.child("game").child(cDGameName).child("discription").set(
    cDDescriptionText);
}

/*--------------------------------------------------------------------------------------------------------------------------------
18. changeGameFoto
    Input: Name des Spiels, Das Foto.
    Output: 
*/
function changeGameFoto(cFGameName, cFFoto) {
  ref.child("game").child(cFGameName).child("thumbnail").set(cFFoto);
}

/*--------------------------------------------------------------------------------------------------------------------------------
19. updateRating
    Input: Name des Spiels.
    Output:
    Der grund fr den Verdoppelten Kode Ist, dass SetRating auch die Funktion braucht und in GamePage der Code sowieso schon sehr viel ähnliches braucht, es dort also nur eine Sicherstellen ist, dass das Rating immer auf demNeusten stand ist. 
*/

function updateRating(uRGameName) {
  let uRRating, uRRef = ref.child("game").child(uRGameName);
  uRRef.once("value", function(snapshot) {

    let uRRatingList = snapshot.child("ratingList").val(),
    uRRatingJson = JSON.parse(JSON.stringify(uRRatingList)), 
    uRRatingKeyArray = Object.keys(uRRatingJson),uRRatingAgregat=[];

    uRRatingKeyArray.forEach(uRRatingElement => {  
    let tempNum = snapshot.child("ratingList").child(uRRatingElement).val();
    if(tempNum > 0)
    {uRRatingAgregat.push(tempNum);}
    });

    if(uRRatingAgregat !== 0){
          let sum = 0, count = uRRatingAgregat.length;
      for(let i=0; i< count; i++){
          sum+= parseInt(uRRatingAgregat[i]);
          console.log(uRRatingAgregat[i]);
          console.log("sum "+ sum);
      }

      uRRating = sum/count;

      console.log(uRRatingAgregat);
      console.log(uRRating);
    }else {uRRating = 0}
    uRRef.child("rating").set(uRRating);}, function (error) {
    console.log("Error: " + error.code);
  });
}

export default checkReturn;
export { newGame, addFriend, login, createNewAccount, getFriendslist,
  deletFriend, getCollection, loadGamePage, getTimeLine, makeComments,
  changeDescription, setRating, getGameNames, updateRating }