import { Callback, Context, Handler } from 'aws-lambda';

const test: Handler = async (_event: any,
                             _context: Context,
                             _callback: Callback) => {

    const a = {a: 1, b: 2, c: 3};
    console.log(Object.entries(a));

};

export { test };
