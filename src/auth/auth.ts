import { AirApi } from '../api/air-api';
import { ACCOUNT, Stage, Tables } from '../constants';
import { Dynamodb } from '../db/dynamodb';
import { Http } from '../http/http';
import { Singleton } from '../singleton/singleton';

export class Authorizer extends Singleton {

    private readonly tokenTableName = Tables[Stage].AirbnbManagerToken;

    private _isAuthorized = false;
    private _http = Http.Singleton;
    private _api = AirApi.Singleton;
    private _db = Dynamodb.Singleton;

    private constructor() {
        super();
    }

    public async init() {
        try {
            const token = await this._getToken();
            this._http.transformAuthRequest(token);
            this._isAuthorized = true;
        } catch (e) {
            throw Error(`Failed the authorization: ${e}`);
        }
    }

    private async _getToken() {
        let token: any;
        try {
            token = await this._getTokenFromDB();
            if (!token) {
                throw Error('Cannot found token in DB!');
            }
        } catch (e) {
            console.log('error _getToken ', e);
            token = await this._fetchToken();
        }

        console.log('token', token);

        return token;
    }

    private async _fetchToken() {
        let token: string;

        token = await this._api.fetchToken(ACCOUNT.ID, ACCOUNT.PW);

        console.log('token has retrieved', token);

        // await this._saveTokenToRepo(tokenResponse.access_token);

        await this._saveTokenToDB(token);

        return token;
    }

    private async _saveTokenToDB(token: string) {
        const param = {
            TableName: this.tokenTableName,
            Item: {
                token: 'token',
                value: token
            }
        };

        await this._db.put(param);
    }

    private async _getTokenFromDB() {
        const param = {
            TableName: this.tokenTableName,
            Key: {
                token: 'token'
            }
        };

        const response = await this._db.read(param);

        if (!response.Item) {
            throw Error('Token not found in DB!');
        } else {
            this._http.transformAuthRequest(response.Item.value);
            return response.Item.value;
        }
    }
}