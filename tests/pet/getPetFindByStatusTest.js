import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate, Trend } from 'k6/metrics';
import * as configUtils from '../../lib/configUtils.js';
import * as CONFIG from "../../config.js";
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

let status = ['pending', 'available', 'sold']

const failureRate = new Rate('GET /pet/findByStatus - Failure Rate');
const requestCount = new Counter('GET /pet/findByStatus - Req Count');
const latency = new Trend('GET /pet/findByStatus - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_GET_FINDBYSTATUS, CONFIG.TU_GET_FINDBYSTATUS);

//options
export let options = {
    scenarios: {
        getFindByStatus: {
            executor: "ramping-arrival-rate",
            exec: 'getFindByStatus',
            startRate: 0,
            timeunit: `${CONFIG.TU_GET_FINDBYSTATUS}s`,
            preAllocatedVUs: 10,
            maxVUs: `100`,
            stages: [
                { target: CONFIG.TPT_GET_FINDBYSTATUS, duration: `${CONFIG.RAMP_UP}s` },
                { target: CONFIG.TPT_GET_FINDBYSTATUS, duration: `${CONFIG.HOLD_DURATION}s` },
                { target: 0, duration: `${CONFIG.TEAR_DOWN}s` },
            ],
        },
    },
    thresholds: {
        'GET /pet/findByStatus - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'GET /pet/findByStatus - Req Count':  [`count >= ${expectedRequestCount}`],
        'GET /pet/findByStatus - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
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
export const getFindByStatus = (data) => {
    let x = parseInt(Math.random() * status.length);
    let params = {
        headers: {
            'Accept': 'application/xml',
        },
        tags: {
            name: 'GET /pet/findByStatus',
        },
    }   

    let res = http.get(`${CONFIG.PET_HOST}/api/v3/pet/findByStatus?status=${status[x]}`, params);
    check(res, { 'GET /pet/findByStatus -> status was 200': (r) => r.status === 200 });
    latency.add(res.timings.duration);
    failureRate.add(res.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCount.add(1);
    }
}