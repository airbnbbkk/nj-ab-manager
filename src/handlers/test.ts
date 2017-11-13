import { Callback, Context, Handler } from 'aws-lambda';
import * as google from 'googleapis';
import * as googleAuth from '../../node_modules/google-auth-library';
import { Message } from '../message/message';

let fs = require('fs');
//const path = require('path');
let readline = require('readline');
const message = Message.Singleton;

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
    authorizeIt(credentials, getEmails);

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
        let auth = new googleAuth();
        let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client);
            }
        });
    }

    function authorizeIt(credentials, callback) {
        let token = require('../../.credentials/gmail-nodejs-quickstart.json');
        let clientSecret = credentials.installed.client_secret;
        let clientId = credentials.installed.client_id;
        let redirectUrl = credentials.installed.redirect_uris[0];
        let auth = new googleAuth();
        let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.credentials = token;
        callback(oauth2Client);
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
        let gmail = google.gmail('v1');
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

    function getEmails(auth) {
        const gmail = google.gmail({
            version: 'v1',
            auth: auth
        });

        gmail.users.threads.list({
            userId: 'stardom8387@gmail.com',
            labelIds: ['Label_16'],
            q: `after:2017/11/11`
        }, (err, messages) => {
            //will print out an array of messages plus the next page token
            console.log(err);
            console.dir(messages);
        });
    }

    function getEmail(auth) {
        const gmail = google.gmail({
            version: 'v1',
            auth: auth
        });

        gmail.users.threads.get({
            userId: 'stardom8387@gmail.com',
            id: '15fa8ae9b6bae1b3'
        }, (err, messages) => {
            //will print out an array of messages plus the next page token
            console.log(err);
            const message = _decodeMessage(messages.messages[0].payload.parts[0].body.data);
            const results = _convertToBookingDto(message);
            console.dir(JSON.stringify(results));
            _callback(null, {body: JSON.stringify(results)})
        });
    }

    function _decodeMessage(msg: string) {
        return Buffer.from(msg.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    }

    function _findValue(text: string, regex: RegExp) {
        const results = regex.exec(text);

        return results[1];
    }

    function _checkLangByCountry(country: string) {
        if (country.match(/korea/i)) {
            return 'ko'
        } else if (country.match(/china/i)) {
            return 'cn'
        } else {
            return null;
        }
    }

    function _convertToBookingDto(text: string) {
        const regMap = {
            id: /Confirmation code\r\n(\w.*)/g,
            message: /since \d{4}(.*)\r\n\r\nSend/g,
            threadId: /airbnb.com\/z\/q\/(\d+)/g,
            listingId: /airbnb.com\/rooms\/show\?euid=.+&id=(\d+)/g,
            country: /([A-Z][\w ]+)\r\nOn Airbnb/g,
            name: /! ([\w ]+) arrives/g
        };

        const dto: any = {
            id: _findValue(text, regMap.id),
            threadId: _findValue(text, regMap.threadId),
            listingId: _findValue(text, regMap.listingId),
            lang: _checkLangByCountry(_findValue(text, regMap.country)) || message.findLanguage(_findValue(text, regMap.message)),
            name: _findValue(text, regMap.name)
        };

        return dto;
    }
};