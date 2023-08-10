import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import * as configUtils from '../../lib/configUtils.js';
import * as CONFIG from "../../config.js";

const failureRate = new Rate('GET /store/inventory - Failure Rate');
const requestCount = new Counter('GET /store/inventory - Req Count');
const latency = new Trend('GET /store/inventory - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_GET_STORE_INVENTORY, CONFIG.TU_GET_STORE_INVENTORY);

//options
export let options = {
    scenarios: {
        getStoreInventory: {
            executor: "ramping-arrival-rate",
            exec: 'getStoreInventory',
            startRate: 0,
            timeunit: `${CONFIG.TU_GET_STORE_INVENTORY}s`,
            preAllocatedVUs: 10,
            maxVUs: `100`,
            stages: [
                { target: CONFIG.TPT_GET_STORE_INVENTORY, duration: `${CONFIG.RAMP_UP}s` },
                { target: CONFIG.TPT_GET_STORE_INVENTORY, duration: `${CONFIG.HOLD_DURATION}s` },
                { target: 0, duration: `${CONFIG.TEAR_DOWN}s` },
            ],
        },
    },
    thresholds: {
        'GET /store/inventory - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'GET /store/inventory - Req Count':  [`count >= ${expectedRequestCount}`],
        'GET /store/inventory - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
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
export const getStoreInventory = (data) => {
    let params = {
        headers: {
            'Accept': 'application/json',
        },
        tags: {
            name: 'GET /store/inventory`',
        },
    }   

    let res = http.get(`${CONFIG.PET_HOST}/api/v3/store/inventory`, params);
    check(res, { 'GET /store/inventory` -> status was 200': (r) => r.status === 200 });
    latency.add(res.timings.duration);
    failureRate.add(res.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCount.add(1);
    }
}