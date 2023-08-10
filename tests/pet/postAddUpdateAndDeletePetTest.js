import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate, Trend } from 'k6/metrics';
import * as configUtils from '../../lib/configUtils.js';
import * as CONFIG from "../../config.js";
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

let petDetails = new SharedArray('addUpdateAndDeletePetsTestData', () => {
    return papaparse.parse(open('../../data/petDetails.csv'), { header: true, skipEmptyLines: true }).data;
});
let petId = Math.floor((Math.random() * 100) + 1);

const failureRateAddPet = new Rate('POST /pet - Failure Rate');
const requestCountAddPet = new Counter('POST /pet - Req Count');
const latencyAddPet = new Trend('POST /pet - Latency');

const failureRateUpdatePet = new Rate('PUT /pet - Failure Rate');
const requestCountUpdatePet = new Counter('PUT /pet - Req Count');
const latencyUpdatePet = new Trend('PUT /pet - Latency');

const failureRateDeletePet = new Rate('DELETE /pet - Failure Rate');
const requestCountDeletePet = new Counter('DELETE /pet - Req Count');
const latencyDeletePet = new Trend('DELETE /pet - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_POST_PET, CONFIG.TU_POST_PET);

//options
export let options = {
    scenarios: {
        addUpdateAndDeletePets: {
            executor: "ramping-arrival-rate",
            exec: 'addUpdateAndDeletePets',
            startRate: 0,
            timeunit: `${CONFIG.TU_POST_PET}s`,
            preAllocatedVUs: 10,
            maxVUs: `100`,
            stages: [
                { target: CONFIG.TPT_POST_PET, duration: `${CONFIG.RAMP_UP}s` },
                { target: CONFIG.TPT_POST_PET, duration: `${CONFIG.HOLD_DURATION}s` },
                { target: 0, duration: `${CONFIG.TEAR_DOWN}s` },
            ],
        },
    },
    thresholds: {
        'POST /pet - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'POST /pet - Req Count':  [`count >= ${expectedRequestCount}`],
        'POST /pet - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],

        'PUT /pet - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'PUT /pet - Req Count':  [`count >= ${expectedRequestCount}`],
        'PUT /pet - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],

        'DELETE /pet - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'DELETE /pet - Req Count':  [`count >= ${expectedRequestCount}`],
        'DELETE /pet - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
    },
    discardResponseBodies: true,
};

// Setup code
export const setup = () => {
    return {
        testStartTime: Date.now()
    }
}

//vu code
export const addUpdateAndDeletePets = (data) => {
    let x = parseInt(Math.random() * petDetails.length);
    //Add new pet to the store
    let paramsAddPet = {
        headers: {
            'Accept': 'application/xml',
            'Content-Type': 'application/json',
        },
        tags: {
            name: 'POST /pet',
        },
    }

    let payloadAddPet = JSON.stringify({
        "id": `${petId}`,
        "name": `${petDetails[x].name}`,
        "category": {
          "id": `${petDetails[x].catagoryId}`,
          "name": `${petDetails[x].catagoryName}`
        },
        "photoUrls": [
          "string"
        ],
        "tags": [
          {
            "id": 0,
            "name": "string"
          }
        ],
        "status": `${petDetails[x].status}`
      })

    let resAddPet = http.post(`${CONFIG.PET_HOST}/api/v3/pet`, payloadAddPet, paramsAddPet);
    check(resAddPet, { 'POST /pet -> status was 200': (r) => r.status === 200 });
    latencyAddPet.add(resAddPet.timings.duration);
    failureRateAddPet.add(resAddPet.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCountAddPet.add(1);
    }
    if (!resAddPet) {
        fail(
          `POST /pet -> status was *not* 200 [Actual Response -> code: ${
            resAddPet.status
          }, body: ${resAddPet.body}]`,
        );
      }


    //update an exisiting pet
    let newStatus = ['pending','sold']
    let y = parseInt(Math.random() * newStatus.length);

    let paramsUpdatePet = {
        headers: {
            'Accept': 'application/xml',
            'Content-Type': 'application/json',
        },
        tags: {
            name: 'PUT /pet',
        },
    }
    
    let payloadUpdatePet = JSON.stringify({
        "id": `${petId}`,
        "name": `${petDetails[x].name}`,
        "category": {
          "id": `${petDetails[x].catagoryId}`,
          "name":`${petDetails[x].catagoryName}`
        },
        "photoUrls": [
          "string"
        ],
        "tags": [
          {
            "id": 0,
            "name": "string"
          }
        ],
        "status": `${newStatus[y]}`
      })

    let resUpdatePet = http.put(`${CONFIG.PET_HOST}/api/v3/pet`, payloadUpdatePet, paramsUpdatePet);
    check(resUpdatePet, { 'PUT /pet -> status was 200': (r) => r.status === 200 });
    latencyUpdatePet.add(resUpdatePet.timings.duration);
    failureRateUpdatePet.add(resUpdatePet.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCountUpdatePet.add(1);
    }
    if (!resUpdatePet) {
        fail(
          `PUT /pet -> status was *not* 200 [Actual Response -> code: ${
            resUpdatePet.status
          }, body: ${resUpdatePet.body}]`,
        );
      }

    //Delete a Pet
    let paramsDeletePet = {
        headers: {
            'Accept': 'application/xml',
            'Content-Type': 'application/json',
        },
        tags: {
            name: 'Delete /pet',
        },
    }
    

    let resDeletePet = http.del(`${CONFIG.PET_HOST}/api/v3/pet/${petId}`, null, paramsDeletePet);
    check(resDeletePet, { 'Delete /pet -> status was 200': (r) => r.status === 200 });
    latencyDeletePet.add(resDeletePet.timings.duration);
    failureRateDeletePet.add(resDeletePet.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCountDeletePet.add(1);
    }
}