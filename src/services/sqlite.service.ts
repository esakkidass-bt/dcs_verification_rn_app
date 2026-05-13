import config from "../config";
import { openDatabase } from "react-native-sqlite-storage";

// async function openDatabase(dbName: string): Promise<SQLite.WebSQLDatabase> {
//   const pathToDatabaseFile = FileSystem.documentDirectory + "SQLite/" + config.localDb;
//   if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")).exists) {
//     await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "SQLite");
//   }
//   // await FileSystem.downloadAsync(
//   //   Asset.fromModule(require(pathToDatabaseFile)).uri,
//   //   FileSystem.documentDirectory + `SQLite/${dbName}`
//   // );
//   return SQLite.openDatabase(`${dbName}`);
// }

class SQLiteService {
   async getDb() {
    const db =  await openDatabase({name: config.localDb, location: 'default'});

    //  SQLite.openDatabase(config.localDb);
    // db.readTransaction(e=>console.log('Read trans > ', e.))
    return db;
  }
  // getDb() {
  //   const db = SQLite.openDatabase(config.localDb)
  //   return db
  // }
}

export default SQLiteService;
