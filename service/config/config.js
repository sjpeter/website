/**
* 配置文件
*/
const config = {
  pageNo: 1,
  pageSize: 30,
  order: 'asc',
  tokenTime: 28800,
  mysql: {
    user: 'root',
    password: '123456',
    server: 'localhost',
    database: 'website',
    post: '3306',
    connectionLimit: 30,
    connectTimeout: 3000000,
    acquireTimeout: 6000000,
    // multipleStatements: true,
    logSql: true
  },
  log: {
    login: './log/login.log',
    everyday: './log/everyday.log',
    sql: './log/sql.log',
    all: './log/all.log'
  }
}

const errorInfo = {
  common: {
    code: '200',
    message: ''
  },
  error: {
    code: '400',
    message: '请求参数有误！'
  },
  invalidToken: {
    code: '401',
    message: 'invalid token'
  },
  db: {
    code: '403',
    message: '数据库错误！'
  }
}

const successInfo = {
  id: '',
  message: '操作成功'
}

module.exports = {
  errorInfo: errorInfo,
  successInfo: successInfo,
  config: config
}
