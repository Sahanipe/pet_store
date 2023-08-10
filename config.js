//const { ConfigHelper } = require('./lib/core/configHelper.js');

// Durations in seconds
export const RAMP_UP = __ENV.RAMP_UP ? __ENV.RAMP_UP : 30;
export const HOLD_DURATION = __ENV.HOLD_DURATION ? __ENV.HOLD_DURATION : 60;
export const TEAR_DOWN = __ENV.TEAR_DOWN ? __ENV.TEAR_DOWN : 30;

// Environment specific
export const PET_HOST = __ENV.PET_HOST ? __ENV.OS_HOST : 'https://petstore3.swagger.io';

// SLA
export const SLA_90PCT_RESPONSE_TIME = 750;
export const SLA_ERROR_RATE = 0.001;
export const THROUGHPUT_TOLERANCE_PCT = 0.90;

// GA Load percentage
// Eg: 1 for 100% GA, 0.5 for 50% GA and likewise
export const TARGET_LOAD = __ENV.TARGET_LOAD ? __ENV.TARGET_LOAD : .25;

// 100% GA load (TPS)
//pet
const TPS_GET_FINDBYSTATUS = 5.6;
const TPS_POST_PET = 1.2;
//user
const TPS_GET_USER_LOGIN = 0.5;
const TPS_POST_USER = 1.2;
//store
const TPS_GET_STORE_INVENTORY = 1.2;
const TPS_POST_STORE_ORDER = 1.2;


// Time units (in seconds)
// Above TPS values will be multiplied by this, to get a whole number (especially for smaller loads)
// Eg: If TPS is 0.5, and Time unit is 10 it will be converted as 5 transactions per 10 seconds (0.5 * 10)
//pet
export const TU_GET_FINDBYSTATUS = 10;
export const TU_POST_PET = 10;
//user
export const TU_GET_USER_LOGIN = 10;
export const TU_POST_USER = 10;
//store
export const TU_GET_STORE_INVENTORY = 10;
export const TU_POST_STORE_ORDER = 10;
// ------------------------------------------------------------------------------------------------
// Returns converted load (TPT) according to below formula
// TPT =  timeUnit * TARGET_LOAD
// Note: TPT will always be >= 1
const getConvertedLoad = (gaLoad, timeUnit) => {
    let convertedLoad = Math.round(gaLoad * timeUnit);
    if (convertedLoad <= 0) {
        convertedLoad = 1;
    }
    return convertedLoad;
}

// Converted load for the test
// Call getConvertedLoad(GA_TPT, TPT_TU) to define converted load
//pet
export const TPT_GET_FINDBYSTATUS = getConvertedLoad(TPS_GET_FINDBYSTATUS, TU_GET_FINDBYSTATUS);
export const TPT_POST_PET = getConvertedLoad(TPS_POST_PET, TU_POST_PET);
//user
export const TPT_GET_USER_LOGIN = getConvertedLoad(TPS_GET_USER_LOGIN, TU_GET_USER_LOGIN);
export const TPT_POST_USER = getConvertedLoad(TPS_POST_USER, TU_POST_USER);
//store
export const TPT_GET_STORE_INVENTORY = getConvertedLoad(TPS_GET_STORE_INVENTORY, TU_GET_STORE_INVENTORY);
export const TPT_POST_STORE_ORDER = getConvertedLoad(TPS_POST_STORE_ORDER, TU_POST_STORE_ORDER);
