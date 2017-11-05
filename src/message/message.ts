import { UNIX_TIME } from '../constants';
import { Singleton } from '../singleton/singleton';
import { LambdaUtil } from '../util/lambda';
import { Time } from '../util/time';

const time = Time.Singleton;
const lambdaUtil = LambdaUtil.Singleton;

export class Message extends Singleton {

    public sendMessage(threadIds: number | number[], message: string) {

        const sendMessageParams = lambdaUtil.getInvocationRequestParam(
            `airbnb_send_message`,
            'Event',
            {
                thread_id: threadIds,
                message
            }
        );

        lambdaUtil.invoke(sendMessageParams);
    }

    public async checkMessageLang(threadId: number) {
        const getThreadParam = lambdaUtil.getInvocationRequestParam(
            `airbnb_get_message`,
            'RequestResponse',
            {
                thread_id: threadId
            }
        );

        const res = await lambdaUtil.invoke(getThreadParam);

        return this.findLanguage(JSON.parse(res.body).thread.message_snippet);

    }

    public async messageBeforeCheckIn(calendars: any[]) {
        const threadIdList: any[] = calendars
            .filter((calendar: any) => !calendar.days[0].available)
            .filter((calendar: any) => this._getDaysLeftToCheckIn(calendar) === 1)
            .map((calendar: any) => calendar.days[0].reservation.thread_id);

        threadIdList.forEach(async (threadId: number) => {
            const messageLang = await this.checkMessageLang(threadId);
            this.sendMessage(threadId, this._getBeforeCheckInMessage(messageLang));
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
            this.sendMessage(threadId, this._getBeforeCheckOutMessage(messageLang));
        });
    }

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
        const todayTime = time.startOfDay(time.now()).getTime();
        const checkInTime = new Date(calendar.days[0].reservation.start_date).getTime();
        const daysLeft = (checkInTime - todayTime) / UNIX_TIME.DAY;

        return daysLeft;
    }

    private _getDaysLeftToCheckOut(calendar: any) {
        const todayTime = time.startOfDay(time.now()).getTime();
        const checkInTime = new Date(calendar.days[0].reservation.start_date).getTime();
        const daysStayed = (todayTime - checkInTime) / UNIX_TIME.DAY;

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
            'Thank you and have a safe trip to Bangkok ;)\n' +
            '\n,',
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
}
