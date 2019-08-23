import 'reflect-metadata';
import { ConnectionOptions, createConnection } from 'typeorm';
import { JAWSDB_SCHEME, JAWSDB_URL } from './util/secrets';

const options: ConnectionOptions = {
  type: 'mysql',
  database: JAWSDB_SCHEME,
  url: JAWSDB_URL,
  synchronize: true,
  entities: [`${__dirname}/../**/*.entity{.js,.ts}`],
};

export default () => {
  createConnection(options).then(connection => {
    console.log('TypeORM successfully connect with DB');
  }).catch(reason => {
    console.error('TypeORM fail to connect with DB');
    console.error(reason);
    process.exit(2);
  });
};
