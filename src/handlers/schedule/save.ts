import { Callback, Context, Handler } from 'aws-lambda';
import { Stage, Tables, UNIX_TIME } from '../../constants';
import { Dynamodb } from '../../db/dynamodb';
import { LambdaUtil } from '../../util/lambda';
import { Time } from '../../util/time';

const save: Handler = async (_event: any,
                             _context: Context,
                             callback: Callback) => {
    console.log('start!');
    const lambdaUtil = LambdaUtil.Singleton;
    const dynamodb = Dynamodb.Singleton;
    const time = Time.Singleton;

    const today = time.now();
    const todayDate = time.format(today, 'YYYY-MM-DD');
    const options = {
        body: {
            _limit: 100,
            start_date: todayDate,
            end_date: time.format(time.endOfMonth(time.now()), 'YYYY-MM-DD')
        }
    };

    const getBookingParams = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_get_booking`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(options)
    };

    console.log('try!');

    try {
        const res = await lambdaUtil.invoke(getBookingParams);
        const bookings = JSON.parse(res.body);
        console.log(bookings);

        const bookingDbInputKeyList = [
            'confirmation_code=id',
            'guest.id',
            'guest_details.number_of_adults',
            'id=booking_id',
            'thread_id',
            'listing_id',
            'nights',
            'start_date'
        ];

        const bookingDbInputList = dynamodb.createBatchWriteParam(bookings['reservations'], bookingDbInputKeyList);

        bookingDbInputList.forEach((booking: any) => {
            booking.PutRequest.Item.end_date =
                booking.PutRequest.Item.start_date +
                (booking.PutRequest.Item['nights'] * UNIX_TIME.DAY);

            booking.PutRequest.Item.is_greeted = false;
            booking.PutRequest.Item.is_checkedup = false;

            delete booking.PutRequest.Item['nights'];
        });

        const sendMessageParams = {
            FunctionName: `airbnb-manager-${Stage}-db_create`,
            InvocationType: 'Event',
            Payload: JSON.stringify({
                body: {
                    table: Tables[Stage].BOOKINGS,
                    data: bookingDbInputList
                }
            })
        };

        await lambdaUtil.invoke(sendMessageParams);

    } catch (err) {
        console.error(err);
    } finally {
        callback(null, null);
    }
};

export { save };
