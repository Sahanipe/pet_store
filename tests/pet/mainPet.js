//init code
import * as getPetFindByStatusTest from '../pet/getPetFindByStatusTest.js';
import * as postAddUpdateAndDeletePetTest from '../pet/postAddUpdateAndDeletePetTest.js';

// create consolidated options set using imported options from tests
let scenarioCollection = {};
Object.entries(getPetFindByStatusTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);
Object.entries(postAddUpdateAndDeletePetTest.options.scenarios).forEach(item => scenarioCollection[item[0]] = item[1]);

let thresholdsCollection = {};
Object.entries(getPetFindByStatusTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);
Object.entries(postAddUpdateAndDeletePetTest.options.thresholds).forEach(item => thresholdsCollection[item[0]] = item[1]);

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
export const getFindByStatus = (data) => {
    getPetFindByStatusTest.getFindByStatus(data);
}

export const addUpdateAndDeletePets = (data) => {
    postAddUpdateAndDeletePetTest.addUpdateAndDeletePets(data);
}