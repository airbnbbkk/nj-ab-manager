/*
import { Callback, Context, Handler } from 'aws-lambda';
import { HOUSE_INFO, Stage, UNIX_TIME } from '../../constants';
import { Message } from '../../message/message';
import { LambdaUtil } from '../../util/lambda';
import { Time } from '../../util/time';

const newBooking: Handler = async (_event: any,
                                 _context: Context,
                                 callback: Callback) => {

    const lambdaUtil = LambdaUtil.Singleton;
    const message = Message.Singleton;
    const time = Time.Singleton;

    const nowLocalTime = time.toLocalTime(time.now()).getTime();
    const options = {
        body: {
            role: 'reservations',
            _format: 'for_mobile_inbox',
            _limit: 10
        }
    };

    const params = lambdaUtil.getInvocationRequestParam(
        'airbnb_list_message',
        'RequestResponse',
        options);

    const result = {
        statusCode: 200,
        body: ''
    };

    try {
        const res = await lambdaUtil.invoke(params);

        const threads = JSON.parse(res.body).threads;

        const newBookingList: any[] = threads
            .filter((thread: any) => !!thread.inquiry_reservation && thread.inquiry_reservation.status === 'accepted')
            .filter((thread: any) => !thread.responded)
            .filter((thread: any) => {
                const threadCreatedTime =
                    time.toLocalTime(
                        new Date(thread.inquiry_reservation.pending_expires_at)
                    ).getTime() - UNIX_TIME.DAY;

                return threadCreatedTime - nowLocalTime >= 0;
            });

        newBookingList.forEach(async (thread) => {
            const sendMessageParams = {
                FunctionName: `airbnb-manager-${Stage}-airbnb_send_message`,
                InvocationType: 'Event',
                Payload: JSON.stringify({
                    body: {
                        thread_id: 276569855,
                        message: _getMessages(message.findLanguage(thread.text_preview), thread.inquiry_listing.id)
                    }
                })
            };

            console.log('sendMessageParams', sendMessageParams);

            await lambdaUtil.invoke(sendMessageParams);
        });

        result.body = `Sending messages has requested.`;

    } catch (err) {
        console.error(err);
        result.statusCode = 500;
        result.body = JSON.stringify(err);
    } finally {
        callback(null, result);
    }
};

export { greeting };
*/
