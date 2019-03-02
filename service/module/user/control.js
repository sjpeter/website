/**
* 人员管理
*/
// 基础模块
const util      = require('util');
const express   = require('express');
const validator = require('validator');
// 必要模块
const con       = require('../../config/config');
const com       = require('../../config/mUtils');
const log       = require('../../log/config');
const db        = require('../../db/config');
const mysql     = db.mysqlp;
// 模块引入
var userClass = require('./model');
// 路由
var router = express.Router();
// 表单规则
const verification = {
  'account': ['required', x => /^[0-9·a-z·A-Z]{1,32}$/.test(x), '账号'],
  'password': ['required', x => /^[0-9·a-z·A-Z·@·_]{6,32}$/.test(x), '密码'],
  'nickname': ['other', x => /^[\u4E00-\u9FA5\uf900-\ufa2d·a-z·A-Z]{1,32}$/.test(x), '昵称'],
  'birthday': ['other', x => /^(\d{4})-([0-1][0-9])-([0-3][0-9]) ([0-2][0-9]):([0-5][0-9]):([0-5][0-9])$/.test(x), '出生日期'],
  'email': ['other', x => validator.isEmail(x), '邮箱'],
  'phone': ['other', x => validator.isMobilePhone(x, ['zh-CN', 'zh-HK', 'zh-TW']), '手机号码'],
  'id': ['required', x => /^[0-9·a-z]{32}$/.test(x), 'id']
};
const queryAll = {
  'list': [['pageNo', undefined, con.config.pageNo, 'number'], ['pageSize', undefined, con.config.pageSize, 'number']]
};

// 设置token是否验证
router.use(function(req, res, next) {
  // 不参与验证的地址
  let path = [];
  // 验证方法
  com.authToken(req, res, next, path);
});

// 获取用户列表
router.get('/', function(req, res, next) {
  let error = con.errorInfo.common;
  let query = com.autoCheckQuery(queryAll['list'], req.query);

  if (typeof query == 'object') {
    // 验证通过
    let user = new userClass();
    user.getList(query).then(results => {
      res.json(results);
    });
  } else {
    error.message = query;
    res.json(com.responseFormat(error));
  }
});

// 获取用户详情信息
router.get('/:id', function(req, res) {
  let id = req.param('id');
  let error = con.errorInfo.common;

  if (id) {
    // 验证通过
    let user = new userClass();
    user.getInfo(id).then(results => {
      if (results) {
        res.json(com.responseFormat(results));
      } else {
        error.message = '数据为空';
        res.json(com.responseFormat(error));
      }
    });
  } else {
    error.message = 'id为空';
    res.json(com.responseFormat(error));
  }
});

// 创建用户
router.post('/', function(req, res, next) {
  let error = con.errorInfo.common;

  //数据检查
  let rule = com.assistCheck(['account', 'password', 'nickname', 'birthday', 'email', 'phone'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (!check) {
    // 插入参数
    let person = req.body.Req;
    person['id'] = com.uuid();
    person['createDate'] = new Date().Format('yyyy-MM-dd hh:mm:ss');
    // 插入条件
    let where = {
      'account': person['account']
    }
    mysql.table('user').thenAdd(person, where, true).then(function (dataA) {
      if (dataA.type === 'exist') {
        error.message = '账号已存在！';
        res.json(com.responseFormat(error));
      } else {
        let response = con.successInfo;
        response.id = dataA.id;
        res.json(com.responseFormat(response));
      }
    }).catch(function (e) {
      // 失败
      log.sql.error(util.format('user create: %s, %s', person.account, e));
      res.json(com.responseFormat(con.errorInfo.db));
    });
  } else {
    error.message = check;
    res.json(com.responseFormat(error));
  }
});

// 修改用户信息
router.put('/:id', function(req, res) {
  let id = req.param('id');
  let error = con.errorInfo.common;

  // 数据检查
  let rule = com.assistCheck(['nickname', 'birthday', 'email', 'phone'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (id && !check) {
    // 验证通过
    let user = new userClass();
    user.putInfo(id, req.body.Req).then(results => {
      if (results) {
        res.json(com.responseFormat(con.successInfo));
      } else {
        error.message = '数据为空';
        res.json(com.responseFormat(error));
      }
    });
  } else {
    // 不通过反应
    if (id) {
      error.message = check;
    } else {
      error.message = 'id为空';
    }
    res.json(com.responseFormat(error));
  }
});

// 删除用户
router.delete('/', function(req, res) {
  let error = con.errorInfo.common;
  
  // 数据检查
  let rule = com.assistCheck(['id'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (!check) {
    // 验证通过
    let user = new userClass();
    user.batchDelete(req.body.Req.id).then(results => {
      if (results == 1) {
        res.json(com.responseFormat(con.successInfo));
      } else {
        if (typeof results == 'object') {
          error.id = results
          error.message = 'id有误';
        } else {
          error.message = results;
        }
        res.json(com.responseFormat(error));
      }
    });
  } else {
    error.message = check;
    res.json(com.responseFormat(error));
  }
});

module.exports = router
