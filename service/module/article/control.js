/**
* 文章管理
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
var articleClass = require('./model');
// 路由
var router = express.Router();
// 表单规则
const verification = {
  'title': ['required', x => /^\S{1,150}$/.test(x), '标题'],
  'keywords': ['other', x => /^\S{1,150}$/.test(x), '关键字'],
  'summary': ['other', x => x, '摘要'],
  'content': ['required', x => /^\S$/.test(x), '内容'],
  'author': ['other', x => /^\S{1,100}$/.test(x), '作者'],
  'publishDate': ['other', x => /^(\d{4})-([0-1][0-9])-([0-3][0-9]) ([0-2][0-9]):([0-5][0-9]):([0-5][0-9])$/.test(x), '发布时间'],
  'status': ['required', x => /^(1|2)$/.test(x), '类型分类'],
  'id': ['required', x => /^[0-9·a-z]{32}$/.test(x), 'id'],
  'categoryId': ['required', x => /^[0-9·a-z]{32}$/.test(x), '类目id']
};
const queryAll = {
  'list': [
    ['title', undefined, undefined, 'string'],
    ['publishDate', undefined, undefined, 'string'],
    ['views', undefined, undefined, 'string'],
    ['pageNo', undefined, con.config.pageNo, 'number'],
    ['pageSize', undefined, con.config.pageSize, 'number']
  ]
};

// 设置token是否验证
router.use(function(req, res, next) {
  // 不参与验证的地址
  let path = [];
  // 验证方法
  com.authToken(req, res, next, path);
});

// 获取文章列表
router.get('/', function(req, res, next) {
  let error = con.errorInfo.common;
  let query = com.autoCheckQuery(queryAll['list'], req.query);

  if (typeof query == 'object') {
    // 验证通过
    let article = new articleClass();
    article.getList(query).then(results => {
      res.json(results);
    });
  } else {
    error.message = query;
    res.json(com.responseFormat(error));
  }
});

// 获取文章详情信息
router.get('/:id', function(req, res) {
  let id = req.param('id');
  let error = con.errorInfo.common;

  if (id) {
    // 验证通过
    let article = new articleClass();
    article.getInfo(id).then(results => {
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

// 创建文章
router.post('/', function(req, res, next) {
  let error = con.errorInfo.common;

  //数据检查
  let rule = com.assistCheck(['categoryId', 'title', 'keywords', 'summary', 'content', 'publishDate', 'status'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (!check) {
    // 验证通过
    let article = new articleClass();
    article.create(req.body.Req, req.nickname).then(results => {
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

// 修改文章信息
router.put('/:id', function(req, res) {
  let id = req.param('id');
  let error = con.errorInfo.common;

  // 数据检查
  let rule = com.assistCheck(['categoryId', 'title', 'keywords', 'summary', 'content', 'publishDate', 'status'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (id && !check) {
    // 验证通过
    let article = new articleClass();
    article.putInfo(id, req.body.Req, req.nickname).then(results => {
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

// 删除文章
router.delete('/', function(req, res) {
  let error = con.errorInfo.common;
  
  // 数据检查
  let rule = com.assistCheck(['id'], verification);
  let check = com.autoCheckForm(rule, req.body.Req);

  if (!check) {
    // 验证通过
    let article = new articleClass();
    article.batchDelete(req.body.Req.id).then(results => {
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
