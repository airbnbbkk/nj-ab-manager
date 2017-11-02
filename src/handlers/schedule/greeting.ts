import { Callback, Context, Handler } from 'aws-lambda';
import { Airbnb } from '../../airbnb/airbnb';
import { HOUSE_INFO, Stage, UNIX_TIME } from '../../constants';
import { LambdaUtil } from '../../util/lambda';

const greeting: Handler = async (_event: any,
                                 _context: Context,
                                 callback: Callback) => {

    const lambdaUtil = new LambdaUtil();
    const airbnb = new Airbnb();

    const nowTime = new Date().getTime();
    const options = {
        body: {
            role: 'unread',
            _limit: 5
        }
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_get_booking`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(options)
    };

    const result = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: ''
    };

    try {
        const res = await lambdaUtil.invoke(params);

        const threads = JSON.parse(res.body).threads;

        const newBookingList: any[] = threads
            .filter((thread: any) => !!thread.inquiry_reservation && thread.inquiry_reservation.status === 'accepted')
            .filter((thread: any) => {
                const threadCreatedTime =
                    new Date(thread.inquiry_reservation.pending_expires_at.match(/\d*-\d*-\d*/)[0]).getTime() - UNIX_TIME.DAY;

                return threadCreatedTime - nowTime >= 0;
            });

        newBookingList.forEach(async (thread) => {
            const sendMessageParams = {
                FunctionName: `airbnb-manager-${Stage}-airbnb_send_message`,
                InvocationType: 'Event',
                Payload: JSON.stringify({
                    body: {
                        thread_id: 276569855,
                        message: _getMessages(airbnb.findLanguage(thread.text_preview), thread.inquiry_listing.id)
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

const _getMessages = (lang: Locale, houseCode: number) => {

    const messages: { [lang: string]: any } = {
        en: 'Hello,\n' +
        '\n' +
        'Thank you for booking our house! \n' +
        '\n' +
        'Please check this guest page \n' +
        '\n' +
        `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[houseCode].code}\n` +
        '\n' +
        'where you can see: \n' +
        '\n' +
        '- A guide video of how to check in\n' +
        '- A Thai voice instruction of how to go to the house which you can play it to a driver.\n' +
        '- House rules and facilities information.\n' +
        '\n' +
        'Please kindly note that WE WILL NOT BE RESPONSIBLE for any unpleasant trouble caused from not reading the information in the guest page so please read them all carefully.\n' +
        '\n' +
        'Also we can provide paid shuttle service so please check below if you need\n' +
        '\n' +
        'https://airbnb-bangkok.com/#/services/pickup\n' +
        '\n' +
        `Lastly, the code for the door lock is ${HOUSE_INFO[houseCode].doorlock} and Wifi name and password is ${HOUSE_INFO[houseCode].wifi.name} / ${HOUSE_INFO[houseCode].wifi.pw}\n` +
        '\n' +
        'Feel free to ask any question anytime.\n' +
        '\n' +
        'Thank you!',
        ko: '안녕하세요, 저희 집을 예약해 주셔서 정말 감사드립니다.\n' +
        '\n' +
        '아래 저희 게스트 페이지를 꼭 체크해 주시기 바랍니다\n' +
        '\n' +
        `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[houseCode].code}?lang=ko\n` +
        '\n' +
        '게스트 페이지에서 다음 내용을 확인 하실 수 있습니다.\n' +
        '\n' +
        '- 체크인 하는 방법\n' +
        '- 숙소 가는 방법에 대한 태국어 음성 안내. 택시 기사분께 들려 드리면 됩니다.\n' +
        '- 숙소 규칙 및 시설 정보\n' +
        '\n' +
        '위 게스트 페이지를 읽지 않아 발생할 수 있는 모든 불미스러운 부분에 있어 책임을 지지 않습니다. 따라서 내용이 많지 않으니 5분만 시간을 내셔서 게스트 페이지에 있는 숙소규칙, 시설안내 등의 내용 전부를 꼭 읽어 주시기를 부탁드립니다.\n' +
        '\n' +
        '그리고 숙소 - 공항간 픽업서비스도 운영하고 있으니 아래 페이지를 확인하시고 필요하시면 신청해 주시면 됩니다.\n' +
        '\n' +
        'https://airbnb-bangkok.com/#/services/pickup?lang=ko\n' +
        '\n' +
        `마지막으로 현관 비밀번호는 ${HOUSE_INFO[houseCode].doorlock} 이며 WIFI이름은 ${HOUSE_INFO[houseCode].wifi.name} 패스워드는 ${HOUSE_INFO[houseCode].wifi.pw} 입니다.\n` +
        '\n' +
        '궁금한 점이 있으시면 언제든지 말씀주세요!\n' +
        '\n' +
        '감사합니다.',
        cn: '你好，\n' +
        '\n' +
        '谢谢你预订我们的房子！\n' +
        '\n' +
        '请查看下面的客人页面\n' +
        '\n' +
        `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[houseCode].code}\n?lang=cn` +
        '\n' +
        '在访客页面中，您可以看到以下内容，\n' +
        '\n' +
        '- 如何入住的指南视频\n' +
        '- 泰国语言教学如何去房子。\n' +
        '- 房屋规则和设施信息。\n' +
        '\n' +
        '请注意，我们不会对因访客页面中的信息不正确而引起的任何不愉快的麻烦负责，所以请仔细阅读。\n' +
        '\n' +
        '另外我们可以提供付费班车服务，所以如果需要，请检查下面\n' +
        '\n' +
        'https://airbnb-bangkok.com/#/services/pickup\n' +
        '\n' +
        `最后，门锁的代码是${HOUSE_INFO[houseCode].doorlock}，Wifi名称和密码是${HOUSE_INFO[houseCode].wifi.name} / ${HOUSE_INFO[houseCode].wifi.pw}\n` +
        '\n' +
        '随时随地问任何问题。\n' +
        '\n' +
        '谢谢！'
    };

    return messages[lang];
};

export { greeting };
