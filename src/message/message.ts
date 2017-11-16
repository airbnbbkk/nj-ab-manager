import { Airbnb } from '../airbnb/airbnb';
import { AIRBNB_API, HOUSE_INFO, Stage } from '../constants';
import { Singleton } from '../singleton/singleton';
import { Time } from '../util/time';

const airbnb = Airbnb.Singleton;
const time = Time.Singleton;

export class Message extends Singleton {

    public send(threadIds: number | number[], msg: string) {

        if (threadIds.constructor.name !== 'Array') {
            return airbnb.request({
                method: 'POST',
                path: AIRBNB_API.ENDPOINTS.MESSAGE_PATH,
                data: {
                    thread_id: threadIds,
                    message: msg
                }
            });

        } else if (threadIds.constructor.name === 'Array') {
            (threadIds as number[]).forEach(async (threadId) => {
                const reqBody = {
                    thread_id: threadId,
                    message: msg
                };
                return airbnb.request({
                    method: 'POST',
                    path: AIRBNB_API.ENDPOINTS.MESSAGE_PATH,
                    data: reqBody
                });
            });
        }
    }

    public async get(threadId?: number, option: Dict = {}) {
        const qs = Object.assign({
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
        }, option);

        const param = {
            method: 'GET',
            path: `${AIRBNB_API.ENDPOINTS.THREADS_PATH}${threadId ? '/' + threadId : ''}`,
            data: qs
        };

        if (threadId) {
            console.log('Getting a single message', param);
        } else {
            console.log('Getting messages', param);
        }

        return await airbnb.request(param);
    }

    public async checkMessageLang(threadId: number) {
        const res = await this.get(threadId);

        return this.findLanguage(JSON.parse(res.body).thread.message_snippet);

    }

    public async messageBeforeCheckIn(calendars: any[]) {
        const threadIdList: any[] = calendars
            .filter((calendar: any) => !calendar.days[0].available)
            .filter((calendar: any) => this._getDaysLeftToCheckIn(calendar) === 1)
            .map((calendar: any) => calendar.days[0].reservation.thread_id);

        console.log('threadIdList', threadIdList);

        threadIdList.forEach(async (threadId: number) => {
            const messageLang = await this.checkMessageLang(threadId);
            this.send(threadId, this._getBeforeCheckInMessage(messageLang));
        });
    }

    public messageBeforeCheckOut(calendars: any[]) {
        const threadIdList: any[] = calendars
            .filter((calendar: any) => !calendar.days[0].available)
            .filter((calendar: any) => this._getDaysLeftToCheckOut(calendar) === 1)
            .map((calendar: any) => calendar.days[0].reservation.thread_id);

        console.log('threadIdList', threadIdList);

        threadIdList.forEach(async (threadId: number) => {
            const messageLang = await this.checkMessageLang(threadId);
            this.send(threadId, this._getBeforeCheckOutMessage(messageLang));
        });
    }

    private _geNewBookingtMessage = (newBookingDto: any) => {

        const messages: { [lang: string]: any } = {
            en: 'Hello,\n' +
            '\n' +
            'Thank you for booking our house! \n' +
            '\n' +
            'Please check this guest page \n' +
            '\n' +
            `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[newBookingDto.listingId].code}\n` +
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
            `https://airbnb-bangkok.com/#/services/pickup?code=${newBookingDto.id}\n` +
            '\n' +
            `Lastly, the code for the door lock is ${HOUSE_INFO[newBookingDto.listingId].doorlock} and Wifi name and password is ${HOUSE_INFO[newBookingDto.listingId].wifi.name} / ${HOUSE_INFO[newBookingDto.listingId].wifi.pw}\n` +
            '\n' +
            'Feel free to ask any question anytime.\n' +
            '\n' +
            'Thank you!',
            ko: '안녕하세요, 저희 집을 예약해 주셔서 정말 감사드립니다.\n' +
            '\n' +
            '아래 저희 게스트 페이지를 꼭 체크해 주시기 바랍니다\n' +
            '\n' +
            `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[newBookingDto.listingId].code}?lang=ko\n` +
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
            `https://airbnb-bangkok.com/#/services/pickup?code=${newBookingDto.id}&lang=ko\n` +
            '\n' +
            `마지막으로 현관 비밀번호는 ${HOUSE_INFO[newBookingDto.listingId].doorlock} 이며 WIFI이름은 ${HOUSE_INFO[newBookingDto.listingId].wifi.name} 패스워드는 ${HOUSE_INFO[newBookingDto.listingId].wifi.pw} 입니다.\n` +
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
            `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[newBookingDto.listingId].code}\n?lang=cn` +
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
            `https://airbnb-bangkok.com/#/services/pickup?code=${newBookingDto.id}\n` +
            '\n' +
            `最后，门锁的代码是${HOUSE_INFO[newBookingDto.listingId].doorlock}，Wifi名称和密码是${HOUSE_INFO[newBookingDto.listingId].wifi.name} / ${HOUSE_INFO[newBookingDto.listingId].wifi.pw}\n` +
            '\n' +
            '随时随地问任何问题。\n' +
            '\n' +
            '谢谢！'
        };

        return messages[newBookingDto.lang];
    };

    /*public messageNewBooking(threadList: any[]) {
        const newBookingList: any[] = threadList
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
            const messageLang = await this.checkMessageLang(threadId) ;
            this.sendMessage(threadId, this._geNewBookingtMessage(messageLang, thread.inquiry_listing.id));

            console.log('sendMessageParams', sendMessageParams);

            await lambdaUtil.invoke(sendMessageParams);
        });
    }*/

    public findLanguage(text: string): Locale {
        let lang: Locale = 'en';

        if (!text) {
            return lang;
        }

        const tests = [
            {regex: /[\uac00-\ud7af]+/g, lang: 'ko'},
            {regex: /[\u4e00-\u9fff]+/g, lang: 'cn'}];

        tests.forEach((test: any) => {
            if (text.match(test.regex)) {
                lang = test.lang;
                return;
            }
        });

        return lang;
    }

    private _getDaysLeftToCheckIn(calendar: any) {
        const todayDate = time.startOfDay(time.toLocalTime(time.now())).getTime();
        const checkInDate = new Date(calendar.days[0].reservation.start_date).getTime();
        const daysLeft = time.differenceInDays(checkInDate, todayDate);

        return daysLeft;
    }

    private _getDaysLeftToCheckOut(calendar: any) {
        const todayDate = time.startOfDay(time.toLocalTime(time.now()));
        const checkInDate = new Date(calendar.days[0].reservation.start_date).getTime();
        const daysStayed = time.differenceInDays(todayDate, checkInDate);

        return calendar.days[0].reservation.nights - daysStayed;
    };

    private _getBeforeCheckOutMessage(lang: string) {
        const messages: { [lang: string]: string } = {
            en: 'Hello, is everything OK with your stay?\n' +
            '\n' +
            'I hope you have been comfortable in our house and please let us know if you have any trouble or any question.\n' +
            '\n' +
            'And may I know what time are you planning to check out tomorrow?\n' +
            '\n' +
            'Thank you.',
            ko: '안녕하세요, 지내시는데 별 문제 없으신가요?\n' +
            '\n' +
            '저희 집에서 편안히 지내시고 계셨길 바라며 만약 문제가 있으시거나 궁금한 점이 있으시면 언제든지 문의 주시기 바랍니다.\n' +
            '\n' +
            '그리고 혹시 내일 몇시에 체크아웃 하실 예정인지 알 수 있을까요?\n' +
            '\n' +
            '감사합니다.',
            cn: '你好，你住的地方一切都好吗？\n' +
            '\n' +
            '我希望你在我们家里有一个舒适的住宿，如果你有任何困难或问题，请告诉我们。\n' +
            '\n' +
            '我可以知道明天你打算什么时候退房？\n' +
            '\n' +
            '谢谢。'
        };

        return messages[lang];
    };

    private _getBeforeCheckInMessage(lang: string) {
        const messages: { [lang: string]: string } = {
            en: 'Hello, you are checking in tomorrow!\n' +
            '\n' +
            'Before your arrival, please make sure that you know how to check in which is explained in the video that\'s on the guest page I sent you previously.\n' +
            '\n' +
            'And please read all the information in the guest page so that you won\'t have any trouble upon your check in.\n' +
            '\n' +
            'Feel free to ask any question anytime.\n' +
            '\n' +
            'Thank you and have a safe trip to Bangkok!\n',
            ko: '안녕하세요, 내일 체크인 하시는 군요!\n' +
            '\n' +
            '도착하시기 전에 제가 보내드린 게스트 페이지에서 체크인 하는 방법을 꼭 확인해 주시구요, 숙박에 필요한 다른 내용들도 게스트 페이지에 있으니 꼭 확인 부탁드립니다.\n' +
            '\n' +
            '언제든지 궁금한 점 있으시면 질문 주시구요, 조심히 오세요!\n' +
            '\n' +
            '감사합니다.',
            cn: '你好。 你明天将登记入住！\n' +
            '\n' +
            '在您抵达之前，请确保您知道如何办理登机手续，在我之前寄给您的客人页面上的视频中有解释。\n' +
            '\n' +
            '请阅读客人页面上的所有信息，以免在入住时遇到任何问题。\n' +
            '\n' +
            '随时随地问任何问题。\n' +
            '\n' +
            '谢谢，请安全前往曼谷。'
        };

        return messages[lang];
    };

    public messageNewBooking(newBookingDto: any) {
        const message = this._geNewBookingtMessage(newBookingDto);
        this.send(Stage === 'dev' ? 276569855 : newBookingDto.threadId, message);
    }
}
