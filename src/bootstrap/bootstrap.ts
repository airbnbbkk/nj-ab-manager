import { AirbnbAuthorizer } from '../auth/auth';
import { Singleton } from '../singleton/singleton';

const Stage = process.env.OPT_STAGE;

export class Bootstrap extends Singleton {

    private _isBootstrapped = false;

    private constructor() {
        super();
    }

    public async init() {
        console.log('current stage: ', Stage);
        console.log('begin bootstrapping');
        if (this._isBootstrapped) {
            console.warn('The app has already been bootstrapped.');
            return;
        }
        return AirbnbAuthorizer.Singleton.init().then(() => {
            this._isBootstrapped = true;
            console.log('bootstrapping finished');
        }).catch((e: any) => {
            throw Error(`Failed on Authorizer initialization: ${e}`);
        });
    }
}