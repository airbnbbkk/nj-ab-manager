import { Callback, Context, Handler } from 'aws-lambda';
import { Calendar } from '../../calendar/calendar';
import { Message } from '../../message/message';
import { Time } from '../../util/time';

const handler: Handler = async (_event: any,
                                _context: Context,
                                callback: Callback) => {
    const message = Message.Singleton;
    const time = Time.Singleton;
    const today = time.toLocalTime(time.now());
    const calendar = Calendar.Singleton;

    console.log('today', today);

    const options = {
        start_date: time.format(time.subDays(today, 1), 'YYYY-MM-DD'),
        end_date: time.format(today, 'YYYY-MM-DD')
    };

    try {
        const res = await calendar.get(options);
        const calendars = JSON.parse(res.body).calendars;

        console.log('bookings', JSON.stringify(calendars));

        const threadIdList = await message.messageAfterCheckIn(calendars);

        callback(null, {body: `sent a sending message request: ${threadIdList}`});

    } catch (err) {
        console.error('Error', err);
        callback(null, {body: `failed a sending message request: ${err}`});
    }
};

export { handler };
