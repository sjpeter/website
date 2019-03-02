var mysql  = require('mysql');
var mysqlp = require('node-mysql-promise');
const util    = require('util');
const log     = require('../log/config');
const con  = require('../config/config');

// 数据库地址
const mysql_configs = con.config.mysql;

var pool =  mysql.createPool(mysql_configs);
var conn = mysql.createConnection(mysql_configs);

var query = function(sql, callback) {
  pool.getConnection(function(err, conn){
    if(err){
      callback(err, null, null);
    }else{
      conn.query(sql, function(qerr, vals, fields){
        //释放连接
        conn.release();
        //事件驱动回调
        callback(qerr, vals, fields);
      });
    }
  });
};

/**
* table string 表
* pageNo string 页码
* pageSize string 页数
* wheres string 条件
* field string 返回数据要求 默认为 *
**/
let page = function(table, pageNo, pageSize, wheres, field) {
  let sql = 'select count(*) as count from ' + table + (wheres ? ' where ' + wheres : '') + '; ';
  sql += 'select ' + (field ? field : '*') + ' from ' + table + (wheres ? ' where ' + wheres : '') + ' limit ' + pageNo + ',' + pageSize + ';';
  console.log(sql);
  return new Promise(function(resolve, reject) {
    pool.getConnection(function(err, conn){
      console.log(err);
      if(err){
        log.sql.error(util.format('pool conn : %s', err));
      }else{
        conn.query(sql, function(qerr, results, fields){
          //释放连接
          conn.release();
          //事件驱动回调
          console.log(qerr);
          if (qerr) {
            log.sql.error(util.format('pool conn : %s', err));
            return;
          }

          console.log(results);
          let info = {
            totalCount: results[0][0]['count'],
            currentPage: pageNo,
            pageSize: pageSize,
            pageCount: Math.ceil(Number(results[0][0]['count']) / Number(pageSize))
          }
          info.nextPageNo = pageNo < info.pageCount ? Number(pageNo) + 1 : pageNo;
          info.results = results[1];
          resolve(info);
        });
      }
    });
  });
};

module.exports = {
  query: query,
  page: page,
  mysqlp: mysqlp.createConnection(mysql_configs)
}
