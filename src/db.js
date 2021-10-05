import * as mysql from "mysql";

const OPTIONS = {
  host: "192.168.1.2",
  user: "apskaita",
  password: "apskaita",
  database: "apskaita",
  multipleStatements: true,
};

const pool = mysql.createPool(OPTIONS);

function connect() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        return reject(err);
      }
      // SET autocommit = {0 | 1}
      query(conn, "set autocommit = 0")
        .then(() => {
          /*
            READ UNCOMMITTED
            READ COMMITTED
            REPEATABLE READ
            SERIALIZABLE
          */
          return query(
            conn,
            "set session transaction isolation level read uncommitted",
          );
        })
        .then(() => {
          resolve(conn);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

function query(conn, sql, values) {
  return new Promise((resolve, reject) => {
    conn.query({
      sql,
      values,
    }, (err, results, fields) => {
      if (err) {
        return reject(err);
      }
      resolve({ results, fields });
    });
  });
}

function start(conn) {
  return new Promise((resolve, reject) => {
    conn.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function commit(conn) {
  return new Promise((resolve, reject) => {
    conn.commit((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function rollback(conn) {
  return new Promise((resolve, reject) => {
    conn.rollback((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function end(conn) {
  return new Promise((resolve, reject) => {
    if (conn) {
      conn.release();
    }
    resolve();
  });
}

export { commit, connect, end, query, rollback, start };
