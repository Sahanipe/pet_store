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
const failureRate = new Rate('GET /user/login - Failure Rate');
const requestCount = new Counter('GET /user/login - Req Count');
const latency = new Trend('GET /user/login - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_GET_USER_LOGIN, CONFIG.TU_GET_USER_LOGIN);

//options
export let options = {
    scenarios: {
        getUserLogin: {
            executor: "ramping-arrival-rate",
            exec: 'getUserLogin',
            startRate: 0,
            timeunit: `${CONFIG.TU_GET_USER_LOGIN}s`,
            preAllocatedVUs: 10,
            maxVUs: `100`,
            stages: [
                { target: CONFIG.TPT_GET_USER_LOGIN, duration: `${CONFIG.RAMP_UP}s` },
                { target: CONFIG.TPT_GET_USER_LOGIN, duration: `${CONFIG.HOLD_DURATION}s` },
                { target: 0, duration: `${CONFIG.TEAR_DOWN}s` },
            ],
        },
    },
    thresholds: {
        'GET /user/login - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'GET /user/login - Req Count':  [`count >= ${expectedRequestCount}`],
        'GET /user/login - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
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
export const getUserLogin = (data) => {
    let x = parseInt(Math.random() * userDetails.length);
    let params = {
        headers: {
            'Accept': 'application/xml',
        },
        tags: {
            name: 'GET /user/login',
        },
    }   

    let res = http.get(`${CONFIG.PET_HOST}/api/v3/user/login?username=${userDetails[x].username}&password=${userDetails[x].password}`, params);
    check(res, { 'GET /user/login -> status was 200': (r) => r.status === 200 });
    latency.add(res.timings.duration);
    failureRate.add(res.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCount.add(1);
    }
}