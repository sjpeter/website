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

class category {
  // 构造函数
  constructor() {}

  //创建
  async create(body) {
    // 插入参数
    let data = body;
    data['createDate'] = new Date().Format('yyyy-MM-dd hh:mm:ss');
    if (com.isNull(data['parentId'])) {
      data['parentstr'] = '0,'
    } else {
      let parent = await mysql.table('category').where('id = "' + data['parentId'] + '"').find();
      if (typeof parent == 'object') {
        data['parentstr'] = parent.parentstr + parent.id + ','
      } else {
        log.sql.error(util.format('category create: %s, %s', data.name, e));
        return '类型id有误';
      }
    }
    delete data['parentId'];

    // desc 防止sql注入
    data['desc'] = sql.escape(data['desc']);

    let info = await mysql.table('category').add(data);
    if (/^[0-9]$/.test(info)) {
      return [info];
    } else {
      log.sql.error(util.format('category create: %s, %s', data.name, e));
      return '数据库报错';
    }
  }

  /**
  * 用于父子树的递归
  * data object 目标
  * num number 树的长度减一
  * cache array 树
  * category object 类数据
  */
  parent(data, num, cache, category) {
    if (num) {
      for (let key in data) {
        if (data[key]['id'] == cache[cache.length - num]) {
          data[key]['children'] = this.parent(data[key]['children'], num - 1, cache, category);
          break;
        }
      }
      return data;
    } else {
      data[category.order] = {
        'id': category['id'],
        'name': category['name'],
        'order': category['order'],
        'children': {}
      };
      return data;
    }
  }

  // 获取列表
  async getList(query) {
    // 获取数据筛选
    let field = ['id', 'name', 'parentstr', 'order', 'type'];
    let where = {'status': '1', 'type': query.type}

    let categoryInfo = await mysql.table('category').field(field).order('id ASC').where(where).select();
    let info = {
      '0': {
        'name': '/',
        'children': {}
      }
    };
    for (let key in categoryInfo) {
      let cache = categoryInfo[key]['parentstr'].split(',');
      cache.splice(cache.length - 1, 1)
      info['0']['children'] = this.parent(info['0']['children'], cache.length - 1, cache, categoryInfo[key]);
    }
    return info;
  }

  // 获取详情
  async getInfo(id) {
    let info = await mysql.table('category').field('status', true).where({id: id}).find();
    if (typeof info == 'object') {
      info['createDate'] = com.isNull(info['createDate']) ? info['createDate'] : com.dateFormat(info['createDate'], 'yyyy-MM-dd hh:mm:ss');
      info['editDate'] = com.isNull(info['editDate']) ? info['editDate'] : com.dateFormat(info['editDate'], 'yyyy-MM-dd hh:mm:ss');
      return info;
    }
    return false;
  }

  // 修改个人信息
  async putInfo(id, body) {
    // desc 防止sql注入
    body['desc'] = sql.escape(body['desc']);
    body.editDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
    let info = await mysql.table('category').where('id = "' + id + '"').update(body);
    return info;
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
      array[body[key]] = await mysql.table('category').where(where).update(data);
    }

    for (let key in array) {
      if (array[key] !== 1) {
        info.push(key);
      }
    }
    return info.length ? info : 1;
  }
}

module.exports = category;
