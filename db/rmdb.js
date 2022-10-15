const sqlite3 = require('sqlite3').verbose();
const path = require('path');
//const DBSOURCE = "rmdb.db";
const dbFolder = path.resolve(__dirname, '../db');



// ** Database Functions **
function getRepoGrpSel() {
    let db = new sqlite3.Database(dbFolder + '/rmdb.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log('Connected to the database.');
            return err;
        }
    });
    let dbResultSet = new Promise(function (resolve, reject) {
        let sql = `SELECT * FROM repo_grp_selector`;
        db.all(sql, [], (err, rows) => {
            if (err) { throw err; }
            let dbResult = rows;
            console.log("dbResult: " + JSON.stringify(dbResult));
            resolve(dbResult);
        });
    })
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Datbase Closed");
    });
    return dbResultSet;
}
module.exports = { getRepoGrpSel };
