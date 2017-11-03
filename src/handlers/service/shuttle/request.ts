import { Context, ProxyCallback, ProxyHandler, ProxyResult } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { ACCOUNT, AIRBNB_API } from '../../../constants';

const airbnb = Airbnb.Singleton;

const request: ProxyHandler = async (event: any,
                                     _context: Context,
                                     callback: ProxyCallback) => {

    const reqData = event.body || {};

    const qs = {
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

    Object.assign(qs, reqData);

    const resBody = await airbnb.request('POST', AIRBNB_API.ENDPOINTS.THREADS_PATH, qs);

    const result = {
        statusCode: (resBody as any).error_code || 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: (resBody as ProxyResult).body
    };

    callback(null, result);
};

export { request };
