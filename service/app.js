// node 后端服务器入口
const fs         = require('fs');
const express    = require('express');
const jwt     = require('jsonwebtoken');
const bodyParser = require('body-parser');

// 配置文件
const con     = require('./config/config');
const com     = require('./config/mUtils.js');
const log     = require('./log/config');
//读取加密文件
const secretKey = fs.readFileSync('./config/website').toString();

// 引入相应的模块
const category = require('./module/category/control');
const article = require('./module/article/control');
const user    = require('./module/user/control');
const login   = require('./module/login/control');

var app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// 登录
app.use('/website/login', login);

// 类型
app.use('/website/category', category);

// 文章
app.use('/website/article', article);

// 用户
app.use('/website/user', user);

// 监听端口
app.listen(3000, function() {
  console.log('成功监听端口：3000');
});
