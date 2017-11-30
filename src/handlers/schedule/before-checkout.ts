import { Callback, Context, Handler } from 'aws-lambda';
import { Calendar } from '../../calendar/calendar';
import { Message } from '../../message/message';
import { Time } from '../../util/time';

const sendMessage: Handler = async (_event: any,
                                    _context: Context,
                                    callback: Callback) => {
    const message = Message.Singleton;
    const time = Time.Singleton;
    const today = time.toLocalTime(time.now());
    const calendar = Calendar.Singleton;

    console.log('today', today);

    const options = {
        start_date: time.format(today, 'YYYY-MM-DD'),
        end_date: time.format(time.addDays(today, 1), 'YYYY-MM-DD')
    };

    try {

        const res = await calendar.get(options);
        const calendars = JSON.parse(res.body).calendars;

        console.log('bookings', JSON.stringify(calendars));

        const threadIdList = await message.messageBeforeCheckOut(calendars);

        callback(null, {body: `sent a sending message request: ${threadIdList}`});

    } catch (err) {
        console.error(err);
        callback(null, {body: `failed a sending message request: ${err}`});
    }
};

export { sendMessage };
