import * as petTests from './tests/pet/mainPet.js';
import * as storeTests from './tests/store/mainStore.js';
import * as userTests from './tests/user/mainUser.js';

// create consolidated options set using imported options from tests
let scenarioCollection = {};
Object.entries(petTests.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);
Object.entries(storeTests.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);
Object.entries(userTests.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);

let thresholdsCollection = {};
Object.entries(petTests.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);
Object.entries(storeTests.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);
Object.entries(userTests.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);


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

// VU code -> 
// tests -> pets 
export const getFindByStatus = (data) => {
    petTests.getFindByStatus(data);
}

export const addUpdateAndDeletePets = (data) => {
    petTests.addUpdateAndDeletePets(data);
}

// tests -> Store
export const getStoreInventory = (data) => {
    storeTests.getStoreInventory(data);
}

export const createUpdateAndDeleteOrder = (data) => {
    storeTests.createUpdateAndDeleteOrder(data);
}

// tests -> user
export const getUserLogin = (data) => {
    userTests.getUserLogin(data);
}

export const getUserLogout = (data) => {
    userTests.getUserLogout(data);
}

export const createUpdateAndDeleteUsers = (data) => {
    userTests.createUpdateAndDeleteUsers(data);
}
