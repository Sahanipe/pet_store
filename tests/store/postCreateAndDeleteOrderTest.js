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
let orderId = Math.floor((Math.random() * 100) + 1);
let petId = Math.floor((Math.random() * 1000) + 1);

const failureRateCreateOrder = new Rate('POST /store/order - Failure Rate');
const requestCountCreateOrder = new Counter('POST /store/order - Req Count');
const latencyCreateOrder = new Trend('POST /store/order - Latency');

const failureRateDeleteOrder = new Rate('DELETE /store/order - Failure Rate');
const requestCountDeleteOrder = new Counter('DELETE /store/order - Req Count');
const latencyDeleteOrder = new Trend('DELETE /store/order - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_POST_STORE_ORDER, CONFIG.TU_POST_STORE_ORDER);

//options
export let options = {
    scenarios: {
        createUpdateAndDeleteOrder: {
            executor: "ramping-arrival-rate",
            exec: 'createUpdateAndDeleteOrder',
            startRate: 0,
            timeunit: `${CONFIG.TU_POST_STORE_ORDER}s`,
            preAllocatedVUs: 10,
            maxVUs: `100`,
            stages: [
                { target: CONFIG.TPT_POST_STORE_ORDER, duration: `${CONFIG.RAMP_UP}s` },
                { target: CONFIG.TPT_POST_STORE_ORDER, duration: `${CONFIG.HOLD_DURATION}s` },
                { target: 0, duration: `${CONFIG.TEAR_DOWN}s` },
            ],
        },
    },
    thresholds: {
        'POST /store/order - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'POST /store/order - Req Count':  [`count >= ${expectedRequestCount}`],
        'POST /store/order - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],

        'DELETE /store/order - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'DELETE /store/order - Req Count':  [`count >= ${expectedRequestCount}`],
        'DELETE /store/order - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
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
export const createUpdateAndDeleteOrder = (data) => {
    let x = parseInt(Math.random() * petDetails.length);
    //Place a new order in store
    let paramsAddPet = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        tags: {
            name: 'POST /pet',
        },
    }

    let payloadAddPet = JSON.stringify({
        "id": `${orderId}`,
        "petId": `${petId}`,
        "quantity": 7,
        "shipDate": (data.testStartTime + 5),
        "status": "approved",
        "complete": true
      })

    let resCreateOrder = http.post(`${CONFIG.PET_HOST}/api/v3/store/order`, payloadAddPet, paramsAddPet);
    check(resCreateOrder, { 'POST /store/order -> status was 200': (r) => r.status === 200 });
    latencyCreateOrder.add(resCreateOrder.timings.duration);
    failureRateCreateOrder.add(resCreateOrder.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCountCreateOrder.add(1);
    }
    if (!resCreateOrder) {
        fail(
          `POST /pet -> status was *not* 200 [Actual Response -> code: ${
            resCreateOrder.status
          }, body: ${resCreateOrder.body}]`,
        );
      }

    //Delete an Order
    let paramsDeleteOrder
     = {
        headers: {
            'Accept': 'application/xml',
            'Content-Type': 'application/json',
        },
        tags: {
            name: 'Delete /store/order',
        },
    }
    

    let resDeleteOrder = http.del(`${CONFIG.PET_HOST}/api/v3/store/order/${orderId}`, null, paramsDeleteOrder);
    check(resDeleteOrder, { 'Delete /store/order -> status was 200': (r) => r.status === 200 });
    latencyDeleteOrder.add(resDeleteOrder.timings.duration);
    failureRateDeleteOrder.add(resDeleteOrder.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCountDeleteOrder.add(1);
    }
}