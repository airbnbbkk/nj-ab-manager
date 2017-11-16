import { Singleton } from '../singleton/singleton';
import { Time } from '../util/time';

const google = require('googleapis');
const time = Time.Singleton;

export class GoogleApi extends Singleton {
    private _gmailClient: any;
    private _oauth2Client: any;

    constructor() {
        super();
        this._createOAuth2Client();
    }

    public getNewBookingEmails(minutes: number) {
        this._createGmailClient();

        return new Promise((resolve, reject) => {
            this._gmailClient.users.threads.list({
                userId: 'stardom8387@gmail.com',
                labelIds: ['Label_16'],
                // q: `after:${time.toEpoch(time.addDays(time.now(), -1))}`
                q: `after:${time.toEpoch(time.subMinutes(time.startOfMinute(time.now()), minutes))}`
            }, (err, messages) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                return resolve(messages);
            });
        })
            .then((res: any) => res.threads)
            .catch(err => {
                console.error(JSON.stringify(err));
                throw Error(JSON.stringify(err));
            });
    }

    public getNewBookingEmail(emailId: string) {
        this._createGmailClient();

        return new Promise((resolve, reject) => {
            this._gmailClient.users.messages.get({
                userId: 'stardom8387@gmail.com',
                id: emailId
            }, (err, messages) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                const message = this._decodeMessage(messages.payload.parts[0].body.data);
                resolve(message);
            });
        })
            .then((res: any) => res)
            .catch(err => {
                console.error(JSON.stringify(err));
                throw Error(JSON.stringify(err));
            });
    }

    private _createGmailClient() {
        if (!this._oauth2Client) {
            this._createOAuth2Client();
        }

        if (!this._gmailClient) {
            this._gmailClient = google.gmail({
                version: 'v1',
                auth: this._oauth2Client
            });
        }
    }

    private _createOAuth2Client() {
        const credentials = require('../../client_secret.json');
        const token = require('../../.credentials/gmail-nodejs-quickstart.json');
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.credentials = token;

        this._oauth2Client = oauth2Client;
    }

    private _decodeMessage(msg: string) {
        return Buffer.from(msg.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    }
}