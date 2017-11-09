import { Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { Airbnb } from '../airbnb/airbnb';
import { ACCOUNT, AIRBNB_API } from '../constants';

const airbnb = Airbnb.Singleton;

const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    const reqData = event.data as Dict || {};

    const qs = Object.assign({
        _format: 'for_host_dashboard',
        _offset: 5,
        _order: 'start_date',
        _limit: 2,
        host_id: ACCOUNT.HOST_ID,
        currency: 'THB',
        locale: 'en'
    }, reqData);

    callback(null, await airbnb.request('GET', AIRBNB_API.ENDPOINTS.RESERVATIONS_PATH, qs));
};

export { get };
