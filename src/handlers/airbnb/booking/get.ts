import { Context, ProxyCallback, ProxyHandler, ProxyResult } from 'aws-lambda';
import { AWSError } from 'aws-sdk/lib/error';
import { Airbnb } from '../../../airbnb/airbnb';
import { ACCOUNT, AIRBNB_API } from '../../../constants';

const airbnb = Airbnb.Singleton;

const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    const reqData = event.body as Dict || {};

    const qs = {
        _format: 'for_host_dashboard',
        _offset: 5,
        _order: 'start_date',
        _limit: 2,
        host_id: ACCOUNT.HOST_ID,
        currency: 'THB',
        locale: 'en'
    };

    Object.assign(qs, reqData);

    const response = {
        statusCode: 200,
        body: ''
    };

    try {
        const res = await airbnb.request('GET', AIRBNB_API.ENDPOINTS.RESERVATIONS_PATH, qs);
        response.statusCode = (res as AWSError).statusCode || response.statusCode;
        response.body = (res as ProxyResult).body;
    } catch (e) {
        console.error('batch error', e);
        response.body = JSON.stringify(e, null, 2);
    } finally {
        callback(null, response);
    }
};

export { get };
