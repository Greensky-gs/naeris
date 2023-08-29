import { createConnection } from 'mysql';
import { DefaultQueryResult, QueryResult } from '../typings/database';

export const database = createConnection({
    database: process.env.db,
    user: process.env.user,
    host: process.env.host,
    password: process.env.password
});

export const query = <T = DefaultQueryResult>(query: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
        database.query(query, (error, request) => {
            if (error) return reject(error);
            return resolve(request);
        });
    });
};
