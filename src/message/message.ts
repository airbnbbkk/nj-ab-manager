import { AirApi } from "../api/air-api";
import { Stage, Tables } from '../constants';
import { Dynamodb } from '../db/dynamodb';
import { Singleton } from "../singleton/singleton";
import ThreadCounts = Message.Metadata.ThreadCounts;
import Thread = Message.Thread;
import ThreadDetailed = Message.ThreadDetailed;
import ThreadRequest = Message.ThreadRequest;
import ThreadResponse = Message.ThreadResponse;

export class Message extends Singleton {

    private _api: AirApi;
    private _db: Dynamodb;
    private readonly threadCountsTableName = Tables[Stage].AirbnbManagerThreadCounts;

    private constructor() {
        super();
        this._api = AirApi.Singleton;
        this._db = Dynamodb.Singleton;
    }

    async responseToNewReservations() {
        const newReservations = await this._fetchNewReservation();

        console.log('new reservations', newReservations);

        //await message.send(276569855, 'Nui!! We just got a new guest!! kihihihihihi');

        await this._sendAll(newReservations, 'we have a new booking Nui!');
    }

    private async _fetchNewReservation() {
        const threadResponse = await this.fetchThreadByRole('reservations');
        const newThreadCount = await this._updateThreadCounts();

        console.log('newThreadCountDoc', newThreadCount);

        return threadResponse.threads
            .filter((thread) => !thread.responded)
            .sort((a: ThreadDetailed, b: ThreadDetailed) =>
                new Date(b.inquiry_reservation.pending_expires_at).getTime() - new Date(a.inquiry_reservation.pending_expires_at).getTime())
            .slice(0, newThreadCount.reservations);
            //newThreadCount.reservations
    }

    async fetchThreadByRole(role: Message.Role) {
        const options: ThreadRequest = {
            role: role,
            _format: 'for_messaging_sync'
        };

        let threadResponse: ThreadResponse;

        try {
            threadResponse = await this._api.fetchThreads(options);
        } catch (e) {
            throw Error(`Failed to fetch threads! ${e}`);
        }

        return threadResponse;
    }

    async send(id: number, message: string) {
        try {
            await this._api.sendMessage({
                message: message,
                thread_id: id
            })
        } catch (e) {
            throw new Error(e);
        }
    }

    private async _sendAll(threads: Array<Thread>, message: string) {
        threads.forEach(async (_thread) => {
            try {
                await this._api.sendMessage({
                    message: message,
                    thread_id: 276569855
                })
            } catch (e) {
                throw new Error(e);
            }
        });
    }

    private async _getThreadMeta() {
        const options: ThreadRequest = {
            role: 'starred',
            _format: 'for_web_inbox'
        };

        const res = await this._api.fetchThreads(options);

        return res.metadata;
    }

    private async _updateThreadCounts() {
        const threadMetaData = await this._getThreadMeta();
        //const remoteThreadCountDoc = this._repo.toDocument(threadMetaData.filter_options, REPO.THREAD_META.docsId.counts);
        const remoteThreadCount = threadMetaData.filter_options;

        let localThreadCountDoc: any;

        try {
            localThreadCountDoc = await this._getThreadCounts();
        } catch (e) {
            localThreadCountDoc = remoteThreadCount;
        }


        console.log('localThreadCountDoc', localThreadCountDoc);

        await this._saveThreadCounts('threadCounts', remoteThreadCount);
        return await this._saveNewThreadCount(remoteThreadCount, localThreadCountDoc);
    }

    private async _saveNewThreadCount(remoteCounts: ThreadCounts, localCounts: ThreadCounts) {
        let newCounts: ThreadCounts = {} as any;

        for (let key in remoteCounts) {
            if (remoteCounts.hasOwnProperty(key)) {
                newCounts[key] = remoteCounts[key] - localCounts[key];
            }
        }

        console.log('newThreadCount', newCounts);

        await this._saveThreadCounts('newThreadCounts', newCounts);

        return newCounts;
    }

    private async _getThreadCounts() {
        /*let countsDoc: Document<ThreadCount> = await this._repo.get(REPO.THREAD_META.docsId.counts);

        if (countsDoc.error) {
            countsDoc = null;
        }*/

        const param = {
            TableName: this.threadCountsTableName,
            Key: {
                id: 'threadCounts'
            }
        };

        const threadCountsRes = await this._db.read(param);

        if (!threadCountsRes.Item) {
            throw Error('Cannot find thread counts from DB!')
        }

        return threadCountsRes.Item;
    }

    private async _saveThreadCounts(id: string, counts: any, _returnDoc?: boolean) {
        //const res = await this._repo.put(count);
        //return returnDoc ? await this._repo.get(count._id) : res;

        const params = {
            TableName: this.threadCountsTableName,
            Item: {
                id: id,
                counts: counts
            }
        };

        Object.assign(params.Item, counts);

        this._db.put(params);
    }
}