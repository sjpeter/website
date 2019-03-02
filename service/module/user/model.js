/**
* 用户对象
* author songjian <sjpeter212@163.com>
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

class user {
  // 构造函数
  constructor() {}

  // 获取列表
  async getList(query) {
    // 获取数据筛选
    let field = ['id', 'account', 'nickname', 'level', 'birthday', 'visits', 'createDate'];
    let where = {'status': '1'}
    // 获取总条数
    let count = await mysql.table('user').where(where).count('*');
    let userInfo = await mysql.table('user').field(field).where(where).page(query.pageNo, query.pageSize).select();
    for (let key in userInfo) {
      userInfo[key]['birthday'] = com.isNull(userInfo[key]['birthday']) ? userInfo[key]['birthday'] : com.dateFormat(userInfo[key]['birthday'], 'yyyy-MM-dd hh:mm:ss');
      userInfo[key]['createDate'] = com.isNull(userInfo[key]['createDate']) ? userInfo[key]['createDate'] : com.dateFormat(userInfo[key]['createDate'], 'yyyy-MM-dd hh:mm:ss');
    }

    let info = com.paging(query.pageNo, query.pageSize, count);
    info.results = userInfo;
    return info;
  }

  // 获取详情
  async getInfo(id) {
    let info = await mysql.table('user').field('password', true).where({id: id}).limit(1).select();
    if (info.length) {
      info['0']['birthday'] = com.isNull(info['0']['birthday']) ? info['0']['birthday'] : com.dateFormat(info['0']['birthday'], 'yyyy-MM-dd hh:mm:ss');
      info['0']['createDate'] = com.isNull(info['0']['createDate']) ? info['0']['createDate'] : com.dateFormat(info['0']['createDate'], 'yyyy-MM-dd hh:mm:ss');
      info['0']['lateDate'] = com.isNull(info['0']['lateDate']) ? info['0']['lateDate'] : com.dateFormat(info['0']['lateDate'], 'yyyy-MM-dd hh:mm:ss');
      return info['0'];
    }
    return false;
  }

  // 修改个人信息
  async putInfo(id, body) {
    if (body.birthday) {
      body.birthday = com.dateFormat(body.birthday, 'yyyy-MM-dd hh:mm:ss');
    }
    let info = await mysql.table('user').where('id = "' + id + '"').update(body);
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
      array[body[key]] = await mysql.table('user').where(where).update(data);
    }

    for (let key in array) {
      if (array[key] !== 1) {
        info.push(key);
      }
    }
    return info.length ? info : 1;
  }
}

module.exports = user;
