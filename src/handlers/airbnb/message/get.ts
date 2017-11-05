import { Callback, Context, Handler } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { AIRBNB_API } from '../../../constants';

const airbnb = Airbnb.Singleton;

const qs = {
    role: 'reservations',
    _format: 'for_web_inbox',
    _offset: 0,
    _limit: 5,
    locale: 'en',
    currency: 'thb',
    selected_inbox_type: 'host',
    include_mt: true,
    include_help_threads: true,
    include_support_messaging_threads: true
};

const list: Handler = async (event: any,
                             _context: Context,
                             callback: Callback) => {

    const reqData = event.data || {};

    Object.assign(qs, reqData);

    callback(null, await airbnb.request('GET', AIRBNB_API.ENDPOINTS.THREADS_PATH, qs));
};

const get: Handler = async (event: any,
                            _context: Context,
                            callback: Callback) => {

    const reqData = event.data || {};

    Object.assign(qs, reqData);

    callback(null, await airbnb.request('GET', AIRBNB_API.ENDPOINTS.THREADS_PATH + `/${event.body.thread_id}`, qs));

};

export { list, get };
