import { ACCOUNT } from '../constants';
import { AirApi } from "../api/air-api";
import { Http } from "../http/http";
import { Dynamodb } from '../db/dynamodb';
import { Singleton } from '../singleton/singleton';
import { Tables, Stage } from '../constants';

export class Authorizer extends Singleton {

    private readonly tokenTableName = Tables[Stage].AirbnbManagerToken;

    private _isAuthorized = false;
    private _http = Http.Singleton;
    private _api = AirApi.Singleton;
    private _db = Dynamodb.Singleton;

    private constructor() {
        super();
    }

    async init() {
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
                throw Error('Cannot found token in DB!')
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

        //await this._saveTokenToRepo(tokenResponse.access_token);

        await this._saveTokenToDB(token);

        return token;
    }

    private async _saveTokenToDB(token: string) {
        const param = {
            TableName: this.tokenTableName,
            Item: {
                token: "token",
                value: token
            }
        };

        await this._db.put(param);
    }

    private async _getTokenFromDB() {
        const param = {
            TableName: this.tokenTableName,
            Key: {
                token: "token"
            }
        };

        const response = await this._db.read(param);

        if (!response.Item) {
            throw Error('Token not found in DB!')
        } else {
            this._http.transformAuthRequest(response.Item.value);
            return response.Item.value
        }
    }

    /*private async _saveTokenToRepo(token: string) {
        const tokenDocument = {
            _id: REPO.AUTH.docsId.token,
            token: token,
            isValid: true
        };

        return await this._repo.put(tokenDocument);
    }

    private async _getTokenFromRepo() {
        const token: Authorizer.TokenDocument | DocumentError = await this._repo.get(REPO.AUTH.docsId.token);
        if ((token as DocumentError).error) {
            return false;
        }
        if (!(token as Authorizer.TokenDocument).isValid) {
            await this._repo.remove(token as Authorizer.TokenDocument);
            return false;
        }

        return token;

    }*/

    public async _invalidateToken(token: Authorizer.TokenDocument) {
        let tokenDto = Object.assign(token);
        tokenDto.isValid = false;
        //await this._repo.put(tokenDto);
    }
}