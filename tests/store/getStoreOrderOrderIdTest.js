//init code
import http from 'k6/http';
import {check} from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import * as configUtils from '../../lib/configUtils.js';
import * as CONFIG from "../../config.js";
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'

let orderDetails = new SharedArray('getStoreOrderOrderId', () => {
    return papaparse.parse(open('../../data/orderDetails.csv'), { header: true, skipEmptyLines: true }).data;
});

const failureRate = new Rate('GET Store/order/orderId - Failure Rate');
const requestCount = new Counter('GET Store/order/orderId - Req Count');
const latency = new Trend('GET Store/order/orderId - Latency');

const expectedRequestCount = configUtils.getExpectedRequestCount(12, 10);

//Options
export let options = {
    scenarios: {
        getStoreOrderOrderId: {
            executor: 'ramping-arrival-rate',
            exec: 'getStoreOrderOrderId',
            startRate: 0,
            timeUnit: `10s`,
            preAllocatedVUs: 10,
            maxVUs: 100,
            stages: [
                {target: 12, duration: `30s` }, //ramp up
                {target: 12, duration: `30s` }, //hold duration
                {target: 0, duration: `30s` } //ramp down
            ],
        },
    },
    thresholds: {
        'GET Store/order/orderId - Latency': [`p(90) < ${CONFIG.SLA_90PCT_RESPONSE_TIME}`],
        'GET Store/order/orderId - Req Count':  [`count >= ${expectedRequestCount}`],
        'GET Store/order/orderId - Failure Rate': [`rate < ${CONFIG.SLA_ERROR_RATE}`],
    },
}

// Setup code
export const setup = () => {
    return {
        testStartTime: Date.now()
    }
}

//vucode
export const getStoreOrderOrderId = (data) => {
   let x = parseInt(Math.random() * orderDetails.length);

    let params = {
        headers: {
            'accept' : 'application/json',
        },
        tags: {
            'name': 'GET Store/order/orderId',
        },
    }

    let res = http.get(`https://petstore.swagger.io/v2/store/order/${orderDetails[x].orderId}`, params);
    check(res, {'GET Store/order/orderId -> status was 200': (r) => r.status === 200});
    latency.add(res.timings.duration);
    failureRate.add(res.status !== 200);
    if (configUtils.isWithinHoldDuration(data.testStartTime)) {
        requestCount.add(1);
    }
}