export class Singleton {
    private static _instance: any;

    constructor() {
    }

    static get Singleton() {
        if (this._instance === null || this._instance === undefined) {
            console.log('creating a new instance of ', this.name);
            this._instance = new this();
        }

        return this._instance;
    }
}