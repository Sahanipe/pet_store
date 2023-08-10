//init code
//import * as getStoreInventoryTest from '../store/getStoreInventoryTest.js';
import * as postCreateAndDeleteOrderTest from '../store/postCreateAndDeleteOrderTest.js';

// create consolidated options set using imported options from tests
let scenarioCollection = {};
//Object.entries(getStoreInventoryTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);
Object.entries(postCreateAndDeleteOrderTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);

let thresholdsCollection = {};
//Object.entries(getStoreInventoryTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);
Object.entries(postCreateAndDeleteOrderTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);

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
// export const getStoreInventory = (data) => {
//     getStoreInventoryTest.getStoreInventory(data);
// }

export const createUpdateAndDeleteOrder = (data) => {
    postCreateAndDeleteOrderTest.createUpdateAndDeleteOrder(data);
}