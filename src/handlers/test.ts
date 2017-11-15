import { Callback, Context, Handler } from 'aws-lambda';
import { Booking } from '../booking/booking';
import { Stage, Tables } from '../constants';
import { Dynamodb } from '../db/dynamodb';
import { Message } from '../message/message';
import { Time } from '../util/time';

let fs = require('fs');
//const path = require('path');
let readline = require('readline');
let gmail;

const google = require('googleapis');
const message = Message.Singleton;
const time = Time.Singleton;
const db = Dynamodb.Singleton;
const booking = Booking.Singleton;

// let google = require('googleapis');


export let test: Handler = async (_event: any,
                                  _context: Context,
                                  _callback: Callback) => {

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
    let SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    let TOKEN_DIR = './.credentials/';
    let TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

    const credentials = require('../../client_secret.json');
    await authorizeIt(credentials, saveNewBookingsToDb);

// Load client secrets from a local file.
    /*fs.readFile(path.join('client_secret.json'), function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.

    });*/

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     *
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        let clientSecret = credentials.installed.client_secret;
        let clientId = credentials.installed.client_id;
        let redirectUrl = credentials.installed.redirect_uris[0];
        let oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                gmail = google.gmail({
                    version: 'v1',
                    auth: oauth2Client
                });
                callback();
            }
        });
    }

    async function authorizeIt(credentials, callback) {
        let token = require('../../.credentials/gmail-nodejs-quickstart.json');
        let clientSecret = credentials.installed.client_secret;
        let clientId = credentials.installed.client_id;
        let redirectUrl = credentials.installed.redirect_uris[0];
        let oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.credentials = token;
        gmail = gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });
        await callback();
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    function getNewToken(oauth2Client, callback) {
        let authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                storeToken(token);
                callback(oauth2Client);
            });
        });
    }

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     */
    function storeToken(token) {
        try {
            fs.mkdirSync(TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST') {
                throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + TOKEN_PATH);
    }

    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */

    function listLabels(auth) {
        gmail.users.labels.list({
            auth: auth,
            userId: 'me'
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            let labels = response.labels;
            if (labels.length == 0) {
                console.log('No labels found.');
            } else {
                console.log('Labels:');
                for (let i = 0; i < labels.length; i++) {
                    let label = labels[i];
                    console.log('-', label.name, label.id);
                }
            }
        });
    }

    async function saveNewBookingsToDb() {
        const emailList: any = (await getEmails()).threads;

        const bookingDtoList = await Promise.all(emailList.map(async (email) => {
            const dto = await booking.getBookingDto(email.id);

            console.log('dto', dto);

            return dto;
        }));

        const params = {
            RequestItems: {
                [Tables[Stage].BOOKINGS]: db.createBatchWriteParam(bookingDtoList)
            }
        };
        console.log('params', JSON.stringify(params));
        //await db.batchWrite(params);

        _callback(null, {body: JSON.stringify(bookingDtoList)})
    }

    function getEmails(): any {
        return new Promise((resolve, reject) => {
            gmail.users.threads.list({
                userId: 'stardom8387@gmail.com',
                labelIds: ['Label_16'],
                q: `after:${time.toEpoch(time.subMinutes(time.now(), 1440))}`
            }, (err, messages) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                return resolve(messages);

            });
        });
    }
};
