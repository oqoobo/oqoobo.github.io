
/* eslint-env browser */
//getCollection (own)
//timeline (own)
//Timeline /(friends)

import { getCollection, getTimeLine } from "./DBController.js";

function loadHomepage(username)
{
    getTimeLine(username, 1);
    getCollection(username, 1);
    getTimeLine(username, 2);
}

function checkMyCollection(array){
    //elementGame,collectionGamesRating,collectionGamesTotalRating,collectionGamesGenre,collectionGamesPublisher
    setTimeout(console.log(array), 2000);
}

function createRecentActivity(array)
{
    setTimeout(console.log(array), 2000);
}

function usersLastRating(array)
{
    setTimeout(console.log(array), 2000);}

export { loadHomepage,checkMyCollection, createRecentActivity, usersLastRating};