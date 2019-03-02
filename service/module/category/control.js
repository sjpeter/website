/**
* 类型管理
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
var categoryClass = require('./model');
// 路由
var router = express.Router();
// 表单规则
const verification = {
  'name': ['required', x => /^\S{1,100}$/.test(x), '类名'],
  'desc': ['other', x => x, '描述'],
  'order': ['required', x => /^[0-9]{1,5}$/.test(x), '顺序'],
  'type': ['required', x => /^(article)$/.test(x), '类型分类'],
  'parentId': ['required', x => /^[0-9]{0,5}$/.test(x), 'parentId']
};
const queryAll = {
  'list': [['type', undefined, 'article', 'string']]
};

// 设置token是否验证
router.use(function(req, res, next) {
  // 不参与验证的地址
  let path = [];
  // 验证方法
  com.authToken(req, res, next, path);
});

// 获取类型数
router.get('/', function(req, res, next) {
  let error = con.errorInfo.common;
  let query = com.autoCheckQuery(queryAll['list'], req.query);

  if (typeof query == 'object') {
    // 验证通过
    let category = new categoryClass();
    category.getList(query).then(results => {
      res.json(results);
    });
  } else {
    error.message = query;
    res.json(com.responseFormat(error));
  }
});

// 获取类目详情信息
router.get('/:id', function(req, res) {
  let id = req.param('id');
  let error = con.errorInfo.common;

  if (id) {
    // 验证通过
    let category = new categoryClass();
    category.getInfo(id).then(results => {
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

// 创建类目
router.post('/', function(req, res, next) {
  let error = con.errorInfo.common;

  //数据检查
  let rule = com.assistCheck(['name', 'desc', 'order', 'type', 'parentId'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (!check) {
    // 验证通过
    let category = new categoryClass();
    category.create(req.body.Req).then(results => {
      if (typeof results == 'object') {
        let response = con.successInfo;
        response.id = results['0'];
        res.json(com.responseFormat(response));
      } else {
        error.message = results;
        res.json(com.responseFormat(error));
      }
    });
  } else {
    error.message = check;
    res.json(com.responseFormat(error));
  }
});

// 修改类目信息
router.put('/:id', function(req, res) {
  let id = req.param('id');
  let error = con.errorInfo.common;

  // 数据检查
  let rule = com.assistCheck(['name', 'desc'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (id && !check) {
    // 验证通过
    let category = new categoryClass();
    category.putInfo(id, req.body.Req).then(results => {
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

// 删除类目
router.delete('/', function(req, res) {
  let error = con.errorInfo.common;
  
  // 数据检查
  let rule = com.assistCheck(['id'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (!check) {
    // 验证通过
    let category = new categoryClass();
    category.batchDelete(req.body.Req.id).then(results => {
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
