/*
import { Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { ACCOUNT } from '../../../constants';
import AirbnbResolutionRequest = AirbnbType.ResolutionRequest;

const request: ProxyHandler = async (_event: any,
                                     _context: Context,
                                     _callback: ProxyCallback) => {

    // const reqData = event.data || {};

    const qs: AirbnbResolutionRequest = {
        _format: 'for_creation',
        initiator_id: ACCOUNT.HOST_ID,
        receiver_id: 156193827,
        reason: 203,
        product_type: 'reservation',
        product_id: 513409840,
        beneficiary_id: ACCOUNT.HOST_ID,
        version: 2,
        request_source: 'Resolution Center'
    };

    // const res = await airbnb.request('POST', AIRBNB_API.ENDPOINTS.THREADS_PATH, qs);
};

export { request };
*/
