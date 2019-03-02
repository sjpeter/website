const log4js = require('log4js');
const con    = require('../config/config');

//配置日志系统
log4js.configure({
  appenders: {
    login: {
      type: 'file',
      filename: con.config.log.login
    },
    everyday: {
      type: 'file',
      filename: con.config.log.everyday
    },
    sql: {
      type: 'file',
      filename: con.config.log.sql
    },
    all: {
      type: 'file',
      filename: con.config.log.all
    }
  },
  categories: {
    default: {
      appenders: ['login', 'everyday', 'sql', 'all'],
      level: 'DEBUG'
    }
  }
});

module.exports = {
  login : log4js.getLogger('login'),
  everyday : log4js.getLogger('everyday'),
  sql : log4js.getLogger('sql'),
  all : log4js.getLogger('all')
}
