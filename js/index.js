/* eslint-env browser */
import {initDataSet, dummyData} from "./initDataEntry.js";

import initListener from "./listener.js";

function init() {

	initListener();
	//DO NOT USE: initDataSet();
	//dummyData();
}

init();