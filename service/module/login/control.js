/**
* 登录
*/
// 基础模块
const fs      = require('fs');
const util    = require('util');
const express = require('express');
const jwt     = require('jsonwebtoken');
// 必要模块
const con     = require('../../config/config');
const com     = require('../../config/mUtils');
const log     = require('../../log/config');
const db      = require('../../db/config');
const mysql   = db.mysqlp;

//读取加密文件
const secretKey = fs.readFileSync('./config/website').toString();

var router = express.Router();

// 设置token是否验证
router.use(function(req, res, next) {
  // 不参与验证的地址
  let path = ['/'];
  // 验证方法
  com.authToken(req, res, next, path);
});

router.post('/', function(req, res, next) {
  let error = {};
  let request = req.body.Req;
  let updateInfo = com.judgeTerminalBrowser(req.headers['user-agent']);
  updateInfo.ip = req.ip;
  updateInfo.lateDate = new Date().Format('yyyy-MM-dd hh:mm:ss');

  if (typeof request === 'object') {
    error = con.errorInfo.common;
    if (com.isNull(request.username)) {
      error.message = '账号为空';
    } else if (com.isNull(request.password)) {
      error.message = '密码为空';
    } else {
      let sql = 'select * from user where account = "' + request.username + '"';
      mysql.table('user').field().where('account = "' + request.username + '"').select().then(dataS => {
        if (dataS.length) {
          if (dataS[0]['password'] === request.password) {
            //生成token
            let token = jwt.sign({
                account: dataS[0]['account'],
                nickname: dataS[0]['nickname']
              }, secretKey, {
                expiresIn: con.config.tokenTime
              }
            );
            
            // 更新用户数据
            mysql.table('user').where('id = "' + dataS[0]['id'] + '"').update(updateInfo).then(dataU => {
              if (dataU) {
                log.sql.info(util.format('login update username: %s success', dataS[0]['account']));
              }
            }).catch(e => {
              log.sql.error(util.format('login update : %s', e));
            });

            // 登录计数
            mysql.table('user').where('id = "' + dataS[0]['id'] + '"').updateInc('visits', 1).then(dataU => {
              if (dataU) {
                log.sql.info(util.format('login update username: %s success', dataS[0]['account']));
              }
            }).catch(e => {
              log.sql.error(util.format('login update visits : %s', e));
            });

            // 登录返回token
            res.json({
              Res: {
                id: dataS[0]['id'],
                token: token
              }
            });
            log.login.info(util.format('login username: %s', dataS[0]['account']));
            return;
          } else {
            error.message = '密码错误';
          }
        } else {
          error.message = '账号不存在';
        }

        if (!com.isNull(error.message)) {
          res.json(com.responseFormat(error));
        }
      }).catch(e => {
        log.sql.error(util.format('login username: %s', e));
        res.json(com.responseFormat(con.errorInfo.db));
      });

      // mysql.query(sql, (err, results) => {
      //   if (err) {
      //     console.log('[SELECT ERROR] - ',err.message);
      //     return;
      //   }

      //   if (results.length) {
      //     if (results[0]['password'] === request.password) {
      //       res.json('ok');
      //       return;
      //       console.log('ddd')
      //     } else {
      //       error.message = '密码错误'
      //     }
      //   } else {
      //     error.message = '账号不存在'
      //   }
      // });
    }
  } else {
    error = con.errorInfo.error;
  }

  if (!com.isNull(error.message)) {
    res.json(com.responseFormat(error));
  }
});

module.exports = router;
