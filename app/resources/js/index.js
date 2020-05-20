/* eslint-env browser */
// eslint-disable-next-line no-unused-vars
import { initDataSet, dummyData } from "./initDataEntry.js";

import initListener from "./listener.js";

function init() {

  initListener();
  //DO NOT USE: 
  /*initDataSet();
  dummyData();*/
}

init();