import { Callback, Context, Handler } from 'aws-lambda';
import { Stage, UNIX_TIME } from '../../constants';
import { LambdaUtil } from '../../util/lambda';
import { Time } from '../../util/time';

const checkup: Handler = async (_event: any,
                                _context: Context,
                                _callback: Callback) => {

    const lambdaUtil = new LambdaUtil();

    const time = new Time();

    const today = new Date();
    const todayTime = today.getTime();
    const options = {
        body: {
            _limit: 7,
            end_date: time.format((todayTime + (UNIX_TIME.DAY)), 'YYYY-MM-DD')
        }
    };

    const getBookingParams = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_get_booking`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(options)
    };

    try {
        const res = await lambdaUtil.invoke(getBookingParams);

        console.log('bookings', res);
        /*

                const threadIdList: any[] = calendars
                    .filter((calendar: any) => !calendar.days[0].available)
                    .filter((calendar: any) => {
                        const checkInTime = new Date(calendar.days[0].reservation.start_date).getTime();
                        const daysStayed = (todayTime - checkInTime) / UNIX_TIME.DAY;
                        const daysLeftUntilCheckOut = calendar.days[0].reservation.nights - daysStayed;

                        return daysLeftUntilCheckOut === 1;
                    })
                    .map((calendar: any) => {
                        return calendar.days[0].reservation.thread_id;
                    });

                const sendMessageParams = {
                    FunctionName: `airbnb-manager-${Stage}-airbnb_send_message`,
                    InvocationType: 'Event',
                    Payload: JSON.stringify({
                        body: {
                            thread_id: threadIdList,
                            message: ''
                        }
                    })
                };

                lambdaUtil.invoke(sendMessageParams);
        */
        //callback(null, {body: JSON.stringify(bookings)});
    } catch (err) {
        console.error(err);
    }
};

export { checkup };
