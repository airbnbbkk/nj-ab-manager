import { Callback, Context, Handler } from 'aws-lambda';
import { Message } from '../../message/message';
import { LambdaUtil } from '../../util/lambda';
import { Time } from '../../util/time';

const beforeCheckin: Handler = async (_event: any,
                                      _context: Context,
                                      callback: Callback) => {
    const message = Message.Singleton;
    const time = Time.Singleton;
    const today = time.toLocalTime(time.now());
    const lambdaUtil = LambdaUtil.Singleton;

    const options = {
        data: {
            _limit: 7,
            start_date: time.format(time.addDays(today, 1), 'YYYY-MM-DD'),
            end_date: time.format(time.addDays(today, 1), 'YYYY-MM-DD')
        }
    };

    const getBookingParams = lambdaUtil.getInvocationRequestParam(
        'airbnb_get_calendar',
        'RequestResponse',
        options);

    try {
        const res = await lambdaUtil.invoke(getBookingParams);
        const calendars = JSON.parse(res.body).calendars;

        console.log('bookings', JSON.stringify(calendars));

        const threadIdList = await message.messageBeforeCheckIn(calendars);

        callback(null, {body: `sent a sending message request: ${threadIdList}`});

    } catch (err) {
        console.error(err);
        callback(null, {body: `failed a sending message request: ${err}`});
    }
};

export { beforeCheckin };
