/**
* 文章对象
* author songjian <sjpeter212@163.com>
*/
// 基础模块
const util      = require('util');
const express   = require('express');
const validator = require('validator');
const sql       = require('mysql');
// 必要模块
const con       = require('../../config/config');
const com       = require('../../config/mUtils');
const log       = require('../../log/config');
const db        = require('../../db/config');
const mysql     = db.mysqlp;

class article {
  // 构造函数
  constructor() {}

  //创建
  async create(body, user) {
    // 插入参数
    let data = body;
    data['id'] = com.uuid();
    data['createDate'] = data['publishDate'] = new Date().Format('yyyy-MM-dd hh:mm:ss');
    data['author'] = user;
    if (data['status'] == 2) {
      data['publisher'] = user;
      data['publishDate'] = com.dateFormat(data['publishDate'], 'yyyy-MM-dd hh:mm:ss');
    }
    // 防止sql注入
    data['summary'] = sql.escape(data['summary']);
    data['content'] = sql.escape(data['content']);
    // 取出所属类目
    let category = data['categoryId'];
    delete data['categoryId'];
    // 数据库写入
    let info = await mysql.table('article').add(data);
    if (/^[0-9]$/.test(info)) {
      let relation = []
      for (let key in category) {
        relation.push({
          type: 'article',
          id: data['id'],
          category: category[key],
        });
      }
      // 写入关联
      let infos = await mysql.table('relation').addAll(relation);
      if (/^[0-9]$/.test(infos)) {
        return [data['id']];
      } else {
        await mysql.table('article').where('id = ' + data['id']).delete();
        log.sql.error(util.format('relation create: %s, %s', data.name, e));
        return '类目关联失败';
      }
    } else {
      log.sql.error(util.format('article create: %s, %s', data.name, e));
      return '文章写入失败';
    }
  }

  // 获取列表
  async getList(query) {
    // 获取数据筛选
    let field = ['id', 'title', 'publishDate', 'status', 'views'];
    let where = {'status': ['!=', '0']}
    // 获取总条数
    let count = await mysql.table('article').where(where).count('*');
    let articleInfo = await mysql.table('article').field(field).where(where).page(query.pageNo, query.pageSize).select();
    for (let key in articleInfo) {
      articleInfo[key]['publishDate'] = com.isNull(articleInfo[key]['publishDate']) ? articleInfo[key]['publishDate'] : com.dateFormat(articleInfo[key]['publishDate'], 'yyyy-MM-dd hh:mm:ss');
    }

    let info = com.paging(query.pageNo, query.pageSize, count);
    info.results = articleInfo;
    return info;
  }

  // 获取详情
  async getInfo(id) {
    let info = await mysql.table('article').field('editDate', true).where({id: id}).find();
    if (typeof info == 'object') {
      info['createDate'] = com.isNull(info['createDate']) ? info['createDate'] : com.dateFormat(info['createDate'], 'yyyy-MM-dd hh:mm:ss');
      info['publishDate'] = com.isNull(info['publishDate']) ? info['publishDate'] : com.dateFormat(info['publishDate'], 'yyyy-MM-dd hh:mm:ss');
      return info;
    }
    return false;
  }

  // 修改个人信息
  async putInfo(id, body, user) {
    // 插入参数
    let data = body;
    data['editDate'] = new Date().Format('yyyy-MM-dd hh:mm:ss');
    data['editor'] = user;
    if (data['status'] == 2) {
      data['publisher'] = user;
      data['publishDate'] = com.dateFormat(data['publishDate'], 'yyyy-MM-dd hh:mm:ss');
    }
    // 防止sql注入
    data['summary'] = sql.escape(data['summary']);
    data['content'] = sql.escape(data['content']);
    // 取出所属类目
    let category = data['categoryId'];
    delete data['categoryId'];
    // 数据库写入
    let info = await mysql.table('article').where('id = "' + id + '"').update(data);
    if (/^[0-9]$/.test(info)) {
      let relation = []
      for (let key in category) {
        relation.push({
          type: 'article',
          id: id,
          category: category[key],
        });
      }
      // 先删除关联
      await mysql.table('relation').where('id = "' + id + '"').delete();
      // 写入关联
      let infos = await mysql.table('relation').addAll(relation);
      if (/^[0-9]$/.test(infos)) {
        return [id];
      } else {
        log.sql.error(util.format('relation create: %s, %s', data.name, e));
        return '类目关联失败';
      }
    } else {
      log.sql.error(util.format('article modify: %s, %s', data.name, e));
      return '文章写入失败';
    }
  }

  // 删除
  async batchDelete(body) {
    let array = {};
    let info = [];
    for (let key in body) {
      if (array[body[key]]) {
        return 'id重复';
      }
      array[body[key]] = 1;
    }

    let where = { 'id': ''};
    let data = { 'status': '0' };
    for (let key in body) {
      where['id'] = body[key];
      array[body[key]] = await mysql.table('article').where(where).update(data);
    }

    for (let key in array) {
      if (array[key] !== 1) {
        info.push(key);
      }
    }
    return info.length ? info : 1;
  }
}

module.exports = article;
