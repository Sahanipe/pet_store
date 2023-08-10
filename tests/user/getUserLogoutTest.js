import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import * as configUtils from '../../lib/configUtils.js';
import * as CONFIG from "../../config.js";

const failureRate = new Rate('GET /user/logout - Failure Rate');
const requestCount = new Counter('GET /user/logout - Req Count');
const latency = new Trend('GET /user/logout - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(CONFIG.TPT_GET_USER_LOGIN, CONFIG.TU_GET_USER_LOGIN);

//options
export let options = {
    scenarios: {
        getUserLogout: {
            executor: "ramping-arrival-rate",
            exec: 'getUserLogout',
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
        'GET /user/logout - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'GET /user/logout - Req Count':  [`count >= ${expectedRequestCount}`],
        'GET /user/logout - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
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
export const getUserLogout = (data) => {
    let params = {
        headers: {
            'Accept': 'application/xml',
        },
        tags: {
            name: 'GET /user/logout',
        },
    }   

    let res = http.get(`${CONFIG.PET_HOST}/api/v3/user/logout`, params);
    check(res, { 'GET /user/logout -> status was 200': (r) => r.status === 200 });
    latency.add(res.timings.duration);
    failureRate.add(res.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCount.add(1);
    }
}