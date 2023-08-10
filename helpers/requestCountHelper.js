import * as CONFIG from '../config.js'

export const getExpectedRequestCount = (throughput, timeunit) => {
    return ((throughput / timeunit) * CONFIG.HOLD_DURATION) * CONFIG.THROUGHPUT_TOLERANCE_PCT;
}

export const isWithinHoldDuration = (testStartTime) => {
    let currentDuration = Date.now() - testStartTime;
    return currentDuration >= (CONFIG.RAMP_UP * 1000) && currentDuration < ((CONFIG.RAMP_UP + CONFIG.HOLD_DURATION) * 1000);
}
