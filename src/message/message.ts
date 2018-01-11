import { Airbnb } from '../airbnb/airbnb';
import { AIRBNB_API, HOUSE_INFO, Stage, TIME_POLICY } from '../constants';
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
                    thread_id: Stage === 'dev' ? 276569855 : threadIds,
                    message: msg
                }
            });

        } else if (threadIds.constructor.name === 'Array') {
            (threadIds as number[]).forEach(async (threadId) => {
                const reqBody = {
                    thread_id: Stage === 'dev' ? 276569855 : threadId,
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

    public async messageAfterCheckIn(calendars: any[]) {
        const calendarList: any[] = calendars
            .filter((calendar: any) => calendar.days[0].reservation && calendar.days[1].reservation) // make sure both days have reservations.
            .filter((calendar: any) => calendar.days[0].date === calendar.days[1].reservation.start_date) // a guest who checked in yesterday
            .filter((calendar: any) => calendar.days[0].reservation.confirmation_code === calendar.days[1].reservation.confirmation_code); // a guest who doesn't check out today.

        console.log('calendarList', calendarList);

        calendarList.forEach(async (calendar: any) => {
            const threadId = calendar.days[1].reservation.thread_id;
            const messageLang = await this.checkMessageLang(threadId);
            this.send(threadId, this._getAfterCheckInMessage(messageLang));
        });
    }

    public async messageBeforeCheckIn(calendars: any[]) {
        const calendarList: any[] = calendars
            .filter((calendar: any) => !calendar.days[1].available)
            .filter((calendar: any) => calendar.days[0].available || this._isDifferentBooking(calendar));

        console.log('calendarList', calendarList);

        calendarList.forEach(async (calendar: any) => {
            const threadId = calendar.days[1].reservation.thread_id;
            const messageLang = await this.checkMessageLang(threadId);
            this.send(threadId, this._getBeforeCheckInMessage(messageLang, calendar.days[0]));
        });
    }

    public messageBeforeCheckOut(calendars: any[]) {
        const calendarList: any[] = calendars
            .filter((calendar: any) => !calendar.days[0].available)
            .filter((calendar: any) => calendar.days[1].available || this._isDifferentBooking(calendar));

        console.log('calendarList', calendarList);

        calendarList.forEach(async (calendar: any) => {
            const threadId = calendar.days[0].reservation.thread_id;
            const messageLang = await this.checkMessageLang(threadId);
            this.send(threadId, this._getBeforeCheckOutMessage(messageLang, calendar));
        });
    }

    private _geNewBookingtMessage = (newBookingDto: any) => {

        const messages: { [lang: string]: any } = {
            en: 'Hello,\n' +
            '\n' +
            'Thank you for booking our house! \n\n' +
            `${this._isAspireCondo(newBookingDto.listingId) ?
                'In order to check in, you *MUST* receive a key card of the house from our staff at the airport.\n' +
                'The staff will be waiting at between the gate number 3 and 4 holding a name card of you.\n' +
                'And Please tell us the followings so that our staff can be standing by on time.\n\n' :
                'In case that you arrive by flight, would you please tell us the followings?\n\n'}` +
            '- Flight name\n' +
            '- Flight number\n' +
            '- Arrival airport\n' +
            '- Arrival time\n\n' +
            'In case that you don\'t arrive by flight, please tell us the estimated time of your arrival to the house.\n\n' +
            'Also please don\'t forget to check our guest page: \n' +
            '\n' +
            `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[newBookingDto.listingId].code}\n` +
            '\n' +
            'where you can check: \n' +
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
            ko: '안녕하세요, 저희 집을 예약해 주셔서 정말 감사드립니다.\n\n' +
            `${this._isAspireCondo(newBookingDto.listingId) ?
                '공항에 도착하시면 *반드시* 숙소 카드키를 공항에서 저희 직원에게 받으시기 바랍니다. ' +
                '3번 게이트와 4번 게이트 사이에 있는 장소로 가시면 저희 직원이 네임 카드를 들고 대기하고 있을 예정입니다. ' +
                '아래 사항을 말씀해 주시면 시간에 맞춰 카드키를 전달해 드릴 수 있습니다.\n\n' :
                '항공편을 이용해 오신 다면 아래 사항을 말씀해 주실 수 있으실까요?\n\n'}` +
            '- 항공사명\n' +
            '- 항공편명\n' +
            '- 도착 공항\n' +
            '- 도착 시간\n\n' +
            '만약 항공편을 이용하시지 않는다면 숙소 도착 예정 시간을 말씀 주시기 바랍니다.\n\n' +
            '또한 아래 저희 게스트 페이지를 꼭 체크해 주시기 바랍니다\n' +
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
            '谢谢你预订我们的房子！\n\n' +
            `${this._isAspireCondo(newBookingDto.listingId) ?
                '您必须在机场领取钥匙卡。 我们的工作人员会给你钥匙卡' +
                '工作人员将在3号和4号门之间等候，持有你的名片。' +
                '请告诉我们以下情况，以便我们的员工能够准时出席。\n\n' :
                '如果您乘飞机到达，请告诉我们以下情况？。\n\n'}` +
            '- 航班名称\n' +
            '- 航班号\n' +
            '- 到达机场\n' +
            '- 到达时间\n\n' +
            '如果您没有乘飞机到达，请告诉我们您预计到达房屋的时间。\n\n' +
            '请查看下面的客人页面\n\n' +
            `https://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[newBookingDto.listingId].code}?lang=cn\n\n` +
            '在访客页面中，您可以看到以下内容，\n\n' +
            '- 如何入住的指南视频\n' +
            '- 泰国语言教学如何去房子。\n' +
            '- 房屋规则和设施信息。\n\n' +
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

    private _getBeforeCheckOutMessage(lang: string, calendar: any) {
        const messages: { [lang: string]: string } = {
            en: 'Hello, is everything OK with your stay?\n' +
            '\n' +
            'I hope you have been comfortable in our house and if you have anything to say to improve our service, please let us hear your valuable advices! \n' +
            '\n' +
            'And please be advised that ' +
            `${calendar.days[1].available ? `you can check out late up to ${TIME_POLICY.LATE_CHECKOUT_HOURS} hours as there's no guest checking in tomorrow. However, in case a new booking comes in, you will have to check out on time.` : 'there is another guest checking in tomorrow so your check out should be no later than 12:00 as our maid will go to the house between 12:00 to 12:30'}` +
            '\n' +
            'If you could, please let us know what time you are planning to check out tomorrow\n' +
            '\n' +
            'Lastly, please make sure to check \"how to check out\" section in our guest page.\n' +
            `\nhttps://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[calendar.days[0].listing_id].code}/checkin?frag=checkout` +
            '\n\n' +
            'Thank you.',
            ko: '안녕하세요, 지내시는데 별 문제 없으신가요?\n' +
            '\n' +
            '저희 집에서 편안히 지내시고 계셨길 바라며 혹시라도 저희 서비스 개선에 도움이 될만한 소중한 의견이 있으시다면 감사히 듣겠습니다.\n' +
            '\n' +
            `${calendar.days[1].available ? `현재 내일 체크인 고객이 아직 없기에 최대 ${TIME_POLICY.LATE_CHECKOUT_HOURS}시간까지 늦은 체크아웃이 가능합니다. 다만 혹시라도 예약이 들어오게 된다면 부득이 하게 정시 체크아웃을 요청드리게 되는점 참고 부탁드립니다.` : '내일 체크인 하는 다른 게스트가 있는 관계로 12:00시 이후 체크아웃은 삼가 부탁 드리며 집 청소를 위해 메이드가 12:00시 에서 12:30시 에 방문 예정입니다.'}` +
            '\n' +
            '가능 하시다면, 내일 몇시에 체크아웃 하실지 알려주시면 감사드리겠습니다.\n' +
            '\n' +
            '마지막으로 저희 게스트 페이지에서 체크아웃 하는 방법을 한번 더 확인해 주시기를 부탁드리겠습니다.\n' +
            `\nhttps://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[calendar.days[0].listing_id].code}/checkin?lang=ko&frag=checkout` +
            '\n\n' +
            '감사합니다.',
            cn: '你好，你住的地方一切都好吗？\n' +
            '\n' +
            '我希望你们在我们家舒服，如果你有什么话要改善我们的服务，请让我们听听你的宝贵意见！\n' +
            '\n' +
            '我可以知道明天你打算什么时候退房？\n' +
            `${calendar.days[1].available ? `您可以在${TIME_POLICY.LATE_CHECKOUT_HOURS}个小时内退房。如果有新的预订，您必须按时退房。` : '还有另一位客人明天检查，所以您的退房时间不得晚于12:00。 我们的女仆将在12:00至12:30之间前往酒店进行清洁'}` +
            '\n' +
            '所以如果可以的话，请告诉我们明天你打算退房的时间。\n' +
            '\n' +
            '最后，请确保在我们的访客页面中查看“如何退房”部分。\n' +
            `\nhttps://airbnb-bangkok.com/#/info/nj_${HOUSE_INFO[calendar.days[0].listing_id].code}/checkin?lang=cn&frag=checkout` +
            +'\n\n' +
            '谢谢。'
        };

        return messages[lang];
    };

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

    private _getAfterCheckInMessage(lang: string) {

        const messages: { [lang: string]: string } = {
            en: 'Good morning, is everything ok?\n' +
            'Please contact me anytime if you have a question :)\n\n' +
            'And I\'d like to gently remind you two things the most important during stay. \n\n' +
            '1. Please save electricity:\n\n' +
            ' We check your electricity usage upon your check out, and if the usage volume is excessive, we will have to charge you a usage fee.\n' +
            ' Please don\'t worry though, as long as you turn off the air conditioners and lights before going out, you will NEVER reach such excessive usage.\n' +
            ' Some guests never turn off ACs and lights so that\'s why we had to start checking the electricity usage.\n\n' +
            '2. Please do not lose key cards\n\n' +
            ' As written in House Rules section of our guest page, we charge 2,000 baht for losing a key card.\n' +
            ' It\'s very difficult to make a new key card due to unnecessarily complicated process which costs me a lot of time and efforts.\n' +
            ' So please be extra careful not to lose key cards.\n\n' +
            'Thank you for sparing your time to read my message and have a great day in Bangkok!',
            ko: '좋은 아침입니다! 지내시는데 불편한 점은 없으신가요?\n' +
            '문의 사항이 있으시면 언제든지 연락 주시기 바랍니다. ^^\n\n' +
            '그리고 지내시는 동안 꼭 중요한 포인트 2가지만 말씀드리고자 합니다.\n\n' +
            '1. 전기 절약:  \n\n' +
            ' 체크아웃 하실때 머무시는 동안 사용하신 전기량을 체크합니다. 만약 사용하신 전기사용량이 너무 과도할 경우에는 추가로 전기 사용료를 청구드립니다.\n' +
            ' 외출하실때 에어콘와 전등만 꼭 꺼주시면 \'절대\' 과도한 전기 사용량이 나올 수 없으니 이 부분만 지켜주시면 걱정하지 않으셔도 됩니다.\n' +
            ' 몇몇 게스트 분들께서 에어콘과 전등을 항상 켜 놓아 부득이 하게 전기 사용량 체크를 하게 된점 정중히 양해 부탁드립니다.\n\n' +
            '2. 카드키 분실 주의:\n\n' +
            ' 게스트 페이지에 있는 규칙란에도 써 놓았지만, 카드키를 분실하시게 되면 2,000 바트의 금액이 청구됩니다.\n' +
            ' 이는 카드키를 재발급 하는 과정이 과도하게 복잡하게 되어 있어서 제가 회사를 하루 쉬고 경찰서와 콘도 오피스를 방문해야만 하기 때문입니다.\n' +
            ' 따라서 카드키를 분실하지 않도록 정말 주의를 부탁 드리겠습니다.\n\n' +
            '메세지가 길었는데 시간내어 읽어주셔서 감사드리구요, 방콕에서 즐거운 시간 보내시기 바랍니다!',
            cn: '早安，一切都好吗？如果您有任何问题，请随时与我联系：）\n\n' +
            '我想让你提醒你在逗留期间最重要的两件事情。 \n\n' +
            '1。请省电：\n \n' +
            ' 我们检查您的电力使用情况，如果使用量过高，我们将不得不向您收取使用费。\n' +
            ' 请不要担心。只要您外出时关掉空调和灯光，就不会有这样的过度使用。\n' +
            ' 有些客人从不关掉空调和灯，所以我们不得不开始检查电力使用情况。\n \n' +
            '2。请不要丢失钥匙卡\n \n' +
            ' 正如我们访客页面的房屋规则部分所写，我们因丢失钥匙卡而收取2000泰铢。\n' +
            ' 由于不必要的复杂过程，制作新的密钥卡是非常困难的。为此，我甚至不得不休息一天，去参观警察局和公寓办公室。\n' +
            ' 所以请特别注意不要丢失钥匙卡。\n \n' +
            '谢谢你节省时间阅读我的信息，在曼谷度过美好的一天!'
        };

        return messages[lang];
    };

    private _getBeforeCheckInMessage(lang: string, calendarDay: any) {


        const messages: { [lang: string]: string } = {
            en: 'Hello, you are checking in tomorrow!\n\n' +
            'Please be advised that ' +
            `${this._isAspireCondo(calendarDay.listing_id) ?
                'the mailbox room is no longer accessible without a key card so you *MUST* meet our staff at the airport to receive a key card. ' +
                'Please meet our staff holding a name card of you at between gate number 3 and 4.\n' : ''}` +
            `${calendarDay.available ? 'you can check in early up to 6 hours so please let us know if you would' : 'there\'s a guest staying before you so your check-in should be after 14:00'}\n\n` +
            'And if you haven\'t yet, please tell us the followings:\n\n' +
            '- Flight name\n' +
            '- Flight number\n' +
            '- Arrival airport\n' +
            '- Arrival time\n' +
            'In case that you don\'t arrive by flight, please tell us the estimated time of your arrival to the house.\n\n' +
            'Before your arrival, please make sure that you know how to check in which is explained in the guest page I sent previously.\n' +
            '\n' +
            'Also, please read all other information in the guest page too so that you won\'t have any trouble upon your check in.\n' +
            '\n' +
            'Feel free to ask any question anytime.\n' +
            '\n' +
            'Thank you and have a safe trip to Bangkok!\n',
            ko: '안녕하세요, 내일 체크인 하시는 군요!\n\n' +
            `${this._isAspireCondo(calendarDay.listing_id) ?
                '이제 부터 우편함실은 카드키로만 출입 가능 하도록 바뀌어 더 이상 우편함에서 카드키를 가져 가실 수가 없게 되었습니다. ' +
                '따라서 *반드시* 공항에서 저희 직원을 만나 카드키를 받으시기 바랍니다. ' +
                '입국장으로 나오셔서 3번 게이트와 4번 게이트 사이에 있는 장소로 가시면 저희 직원이 네임카드를 들고 대기하고 있을 예정입니다.\n' : ''}` +
            `${calendarDay.available ?
                '만약 원하신다면 최대 6시간까지 일찍 체크인이 가능하니 말씀 주시기 바랍니다.' :
                '체크인 시간은 먼저 숙박중인 다른 게스트분이 있는 관계로 14:00시 이후부터 가능합니다.'}\n\n` +
            '그리고 혹시 아직 말씀주시지 않았다면 다음 사항을 알려주시기 바랍니다.\n\n' +
            '- 항공사명\n' +
            '- 항공편명\n' +
            '- 도착 공항\n' +
            '- 도착 시간\n' +
            '만약 항공편을 이용하지 않으신다면 숙소 도착 시간을 말씀 주시기 바랍니다.\n\n' +
            '\n\n' +
            '도착하시기 전에 제가 보내드린 게스트 페이지에서 체크인 하는 방법을 꼭 확인해 주시구요, 숙박에 필요한 다른 내용들도 게스트 페이지에 있으니 꼭 확인 부탁드립니다.\n' +
            '\n' +
            '언제든지 궁금한 점 있으시면 질문 주시기 바라며, 조심히 오세요!\n' +
            '\n' +
            '감사합니다.',
            cn: '你好。 你明天将登记入住！\n\n' +
            `${this._isAspireCondo(calendarDay.listing_id) ?
                '如果没有钥匙卡，邮箱房间将无法使用，因此您必须在机场与我们的工作人员会面以获得钥匙卡。\n' +
                '请在3号门和4号门之间见我们的工作人员持你的名片。\n' : ''}` +
            `${calendarDay.available ?
                '您可以提前6小时办理登机手续，请告诉我们' :
                '还有另一位客人在你面前，所以你的登记入住时间应该在14:00之后'}\n\n` +
            '如果您还没有告知，请告诉我们以下情况\n\n' +
            '- 航班名称\n' +
            '- 航班号\n' +
            '- 到达机场\n' +
            '- 到达时间\n' +
            '如果您没有乘飞机到达，请告诉我们您预计到达房屋的时间。\n\n' +
            '在您抵达之前，请确保您知道如何办理登机手续，在我之前寄给您的客人页面上的视频中有解释。\n\n' +
            '请阅读客人页面上的所有信息，以免在入住时遇到任何问题。\n' +
            '\n' +
            '随时随地问任何问题。\n' +
            '\n' +
            '谢谢，请安全前往曼谷。'
        };

        return messages[lang];
    };

    private _isDifferentBooking(calendar: any) {
        if (!calendar.days[0].reservation) {
            return false
        } else if (!calendar.days[1].reservation) {
            return true
        } else {
            return calendar.days[0].reservation.confirmation_code !== calendar.days[1].reservation.confirmation_code;
        }
    }

    private _isAspireCondo(listingId: number) {
        return HOUSE_INFO[listingId].code >= 4 && HOUSE_INFO[listingId].code <= 7
    }

    public messageNewBooking(newBookingDto: any) {
        const message = this._geNewBookingtMessage(newBookingDto);
        this.send(Stage === 'dev' ? 276569855 : newBookingDto.threadId, message);
    }
}
