import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate, Trend } from 'k6/metrics';
import * as configUtils from '../../lib/configUtils.js';
import * as CONFIG from "../../config.js";
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

let userDetails = new SharedArray('getUserLoginTestData', () => {
    return papaparse.parse(open('../../data/userData.csv'), { header: true, skipEmptyLines: true }).data;
});
let userId = Math.floor((Math.random() * 100) + 1);

const failureRateCreateUser = new Rate('POST /user - Failure Rate');
const requestCountCreateUser = new Counter('POST /user - Req Count');
const latencyCreateUser = new Trend('POST /user - Latency');

// const failureRateUpdatePet = new Rate('PUT /user - Failure Rate');
// const requestCountUpdatePet = new Counter('PUT /user - Req Count');
// const latencyUpdatePet = new Trend('PUT /user - Latency');

// const failureRateDeletePet = new Rate('DELETE /user - Failure Rate');
// const requestCountDeletePet = new Counter('DELETE /user - Req Count');
// const latencyDeletePet = new Trend('DELETE /user - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_POST_USER, CONFIG.TU_POST_USER);

//options
export let options = {
    scenarios: {
        createUpdateAndDeleteUsers: {
            executor: "ramping-arrival-rate",
            exec: 'createUpdateAndDeleteUsers',
            startRate: 0,
            timeunit: `${CONFIG.TU_POST_USER}s`,
            preAllocatedVUs: 10,
            maxVUs: `100`,
            stages: [
                { target: CONFIG.TPT_POST_USER, duration: `${CONFIG.RAMP_UP}s` },
                { target: CONFIG.TPT_POST_USER, duration: `${CONFIG.HOLD_DURATION}s` },
                { target: 0, duration: `${CONFIG.TEAR_DOWN}s` },
            ],
        },
    },
    thresholds: {
        'POST /user - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'POST /user - Req Count':  [`count >= ${expectedRequestCount}`],
        'POST /user - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],

        // 'PUT /user - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        // 'PUT /user - Req Count':  [`count >= ${expectedRequestCount}`],
        // 'PUT /user - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],

        // 'DELETE /user - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        // 'DELETE /user - Req Count':  [`count >= ${expectedRequestCount}`],
        // 'DELETE /user - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
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
export const createUpdateAndDeleteUsers = (data) => {
    let x = parseInt(Math.random() * userDetails.length);
    //Create a user
    let paramsCreateUser = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        tags: {
            name: 'POST /user',
        },
    }

    let payloadCreateUser = JSON.stringify({
        "id": `${userId}`,
        "username": `${userDetails[x].username}`,
        "firstName": `${userDetails[x].firstName}`,
        "lastName": `${userDetails[x].lastName}`,
        "email": `${userDetails[x].email}`,
        "password": `${userDetails[x].password}`,
        "phone": `${userDetails[x].phone}`,
        "userStatus": 1
      })

    let resCreateUser = http.post(`${CONFIG.PET_HOST}/api/v3/user`, payloadCreateUser, paramsCreateUser);
    console.log(JSON.stringify(resCreateUser));
    check(resCreateUser, { 'POST /user -> status was 200': (r) => r.status === 200 });
    latencyCreateUser.add(resCreateUser.timings.duration);
    failureRateCreateUser.add(resCreateUser.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCountCreateUser.add(1);
    }
    if (!resCreateUser) {
        fail(
          `POST /user -> status was *not* 200 [Actual Response -> code: ${
            resCreateUser.status
          }, body: ${resCreateUser.body}]`,
        );
      }


    //update an exisiting user
    // let newStatus = ['pending','sold']
    // let y = parseInt(Math.random() * newStatus.length);

    // let paramsUpdatePet = {
    //     headers: {
    //         'Accept': 'application/xml',
    //         'Content-Type': 'application/json',
    //     },
    //     tags: {
    //         name: 'PUT /pet',
    //     },
    // }
    
    // let payloadUpdatePet = JSON.stringify({
    //     "id": `${petId}`,
    //     "name": `${petDetails[x].name}`,
    //     "category": {
    //       "id": `${petDetails[x].catagoryId}`,
    //       "name":`${petDetails[x].catagoryName}`
    //     },
    //     "photoUrls": [
    //       "string"
    //     ],
    //     "tags": [
    //       {
    //         "id": 0,
    //         "name": "string"
    //       }
    //     ],
    //     "status": `${newStatus[y]}`
    //   })

    // let resUpdatePet = http.put(`${CONFIG.PET_HOST}/api/v3/pet`, payloadUpdatePet, paramsUpdatePet);
    // console.log(resUpdatePet)
    // check(resUpdatePet, { 'PUT /pet -> status was 200': (r) => r.status === 200 });
    // latencyUpdatePet.add(resUpdatePet.timings.duration);
    // failureRateUpdatePet.add(resUpdatePet.status !== 200);
    // if (configUtils.isWithinHoldDuration(data.testStartTime)) {
    //     requestCountUpdatePet.add(1);
    // }
    // if (!resUpdatePet) {
    //     fail(
    //       `PUT /pet -> status was *not* 200 [Actual Response -> code: ${
    //         resUpdatePet.status
    //       }, body: ${resUpdatePet.body}]`,
    //     );
    //   }

    // //Delete a user
    // let paramsDeletePet = {
    //     headers: {
    //         'Accept': 'application/xml',
    //         'Content-Type': 'application/json',
    //     },
    //     tags: {
    //         name: 'Delete /pet',
    //     },
    // }
    

    // let resDeletePet = http.del(`${CONFIG.PET_HOST}/api/v3/pet/${petId}`, null, paramsDeletePet);
    // check(resDeletePet, { 'Delete /pet -> status was 200': (r) => r.status === 200 });
    // latencyDeletePet.add(resDeletePet.timings.duration);
    // failureRateDeletePet.add(resDeletePet.status !== 200);
    // if (configUtils.isWithinHoldDuration(data.testStartTime)) {
    //     requestCountDeletePet.add(1);
    // }
}