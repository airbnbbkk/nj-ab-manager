import { Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { ACCOUNT, AIRBNB_API } from '../../../constants';

const airbnb = Airbnb.Singleton;

const request: ProxyHandler = async (event: any,
                                     _context: Context,
                                     callback: ProxyCallback) => {

    const reqData = event.data || {};

    const qs = Object.assign({
        _format: 'for_creation',
        initiator_id: ACCOUNT.HOST_ID,
        receiver_id: 156193827,
        reason: 203,
        product_type: 'reservation',
        product_id: 513409840,
        beneficiary_id: ACCOUNT.HOST_ID,
        version: 2,
        request_source: 'Resolution Center'
    }, reqData);

    callback(null, await airbnb.request('POST', AIRBNB_API.ENDPOINTS.THREADS_PATH, qs));
};

export { request };
