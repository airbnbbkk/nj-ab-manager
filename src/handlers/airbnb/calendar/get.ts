import { Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { Calendar } from '../../../calendar/calendar';

const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    const calendar = Calendar.Singleton;
    const reqData = event.body as Dict || {};

    callback(null, await calendar.get(reqData));
};


export { get };
