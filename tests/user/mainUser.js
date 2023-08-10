//init code
import * as getUserLoginTest from '../user/getUserLoginTest.js';
import * as getUserLogoutTest from '../user/getUserLogoutTest.js';
//import * as postCreateUpdateAndDeleteUserTest from '../user/postCreateUpdateAndDeleteUserTest.js';

// create consolidated options set using imported options from tests
let scenarioCollection = {};
Object.entries(getUserLoginTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);
Object.entries(getUserLogoutTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);
//Object.entries(postCreateUpdateAndDeleteUserTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);

let thresholdsCollection = {};
Object.entries(getUserLoginTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);
Object.entries(getUserLogoutTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);
//Object.entries(postCreateUpdateAndDeleteUserTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);

// options
export let options = {
    scenarios: scenarioCollection,
    thresholds: thresholdsCollection,
    discardResponseBodies: true,
    userAgent: 'k6',
}

// Setup code
export const setup = () =>
  // Return collective data object
  ({
    testStartTime: Date.now(),
  });

// VU code -> tests
export const getUserLogin = (data) => {
    getUserLoginTest.getUserLogin(data);
}

export const getUserLogout = (data) => {
    getUserLogoutTest.getUserLogout(data);
}

// export const createUpdateAndDeleteUsers = (data) => {
//     postCreateUpdateAndDeleteUserTest.createUpdateAndDeleteUsers(data);
// }