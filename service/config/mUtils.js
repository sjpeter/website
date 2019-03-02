/**
* 公用方法
*/
const fs        = require('fs');
const con       = require('./config');
const validator = require('validator');

Date.prototype.Format = function (fmt) {
  var nowDate = new Date();
  var timestamp = this.getTime();
  var now = nowDate.getTime();
  // if (timestamp > now) {
  //   this.setFullYear(nowDate.getFullYear());
  //   this.setMonth(nowDate.getMonth());
  //   this.setDate(nowDate.getDate());
  // }
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

/**
* 判断对象中是否存在数据 存在 true 不存在 false
*/
const isEmptyObject = function (e) {
  if (typeof e === 'object' && e != null) {
    return true
  } else {
    return false
  }
}

/**
* 保留小数点
* number 数值
* point 小数点后几位
*/
const getFomatFloat = function(number, point){
  return Math.round(number * Math.pow(10, point)) / Math.pow(10, point)
}

/**
* 获取时间
* time 例: 2014-11-07T17:07:06Z
*/
const getTimeInterval = function(time){
  let date = new Date()
  return Math.ceil((date.getTime() - (new Date(time)).getTime()) / 1000)
}

/**
* 判断data参数
*/
const judgeObj = function(data){
  if (typeof data === 'object') {
    if (typeof data.code !== 'undefined') {
      return false
    } else if (data.Status === 'fail' || data.Status === 'error' || data.State === 'error' || data.State === 'fail' || data.V === false) {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}

/**
* 判断是否为空
*/
function isNull (str) {
  if (str === '') {
    return true
  } else if (!str) {
    return true
  } else {
    let regu = "^[ ]+$";
    let re = new RegExp(regu);
    return re.test(str);
  }
}

/**
* 时间格式化
* time string 时间
* fmt string 输出格式 默认年月日时分 例： yyyy-MM-dd hh:mm
* last string 上一年 'year' 上一月 'month'
* future string 明天 'day'
*/
function dateFormat (time, fmt, last, future) {
  let date
  if (time) {
    date = new Date(time)
  } else {
    date = new Date()
  }
  if (future === 'day') {
    date = date.getTime() + 86400000
    date = new Date(date)
  }

  let o = {
    "M+" : date.getMonth()+1,                 // 月份
    "d+" : date.getDate(),                    // 日
    "h+" : date.getHours(),                   // 小时
    "m+" : date.getMinutes(),                 // 分
    "s+" : date.getSeconds(),                 // 秒
    "q+" : Math.floor((date.getMonth()+3)/3), // 季度
    "S"  : date.getMilliseconds()             // 毫秒
  }
  let year = date.getFullYear()
  if (last === 'year') {
    year--
  } else if (last === 'month') {
    if (o['M+'] === 1) {
      year--
      o['M+'] = 12
    } else {
      o['M+']--
    }
  }

  if (fmt) {
    if(/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (year + "").substr(4 - RegExp.$1.length))
    }
    for(let k in o)
      if(new RegExp("("+ k +")").test(fmt))
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)))
    return fmt;
  } else {
    return year + "年" + o["M+"] + "月" + o["d+"] + "日 " + o["h+"] + "时" + o["m+"] + "分"
  }
}

/**
* 添加返回信息格式
*/
function responseFormat (data) {
  return {
    Res: data
  }
}

/**
* 验证token函数
*/
function authToken (req, res, next, data) {
  const jwt    = require('jsonwebtoken');

  //读取加密文件
  const secretKey = fs.readFileSync('./config/website').toString();

  for (let key in data) {
    if (req.originalUrl.indexOf(data[key]) != -1) {
      return next();
    }
  }

  //获取token
  let token = req.headers['token'] || req.headers['TOKEN'] || req.headers['H-TOKEN'];
  if (token) {
    //验证token
    jwt.verify(token, secretKey, function(err, decoded) {
      if (err) {
        res.status(401).send(responseFormat(con.errorInfo.invalidToken));
      } else {
        req.username = decoded.account;
        req.nickname = decoded.nickname;
        next();
      }
    });
  } else {
    let error = responseFormat(con.errorInfo.invalidToken);
    error.Res.message = 'token不存在';
    res.send(error);
  }
}

/**
* 自动检测表单对象处理
*/
function dealObject(data, callback) {
  if (typeof data == 'object') {
    for (let key in data) {
      if (typeof data[key] == 'object') {
        dealObject(data[key], callback);
      } else {
        callback(data[key]);
      }
    }
  } else {
    callback(data);
  }
}

/**
* 自动检测表单
* data object 表单数据
* verification object 验证规则
*/
function autoCheckForm (verification, data) {
  if (typeof data !== 'object') {
    return con.errorInfo.error.message;
  }

  for (let key in verification) {
    // 必填项未传参
    if (verification[key]['0'] == 'required' && !data.hasOwnProperty(key)) {
      return verification[key]['2'] + '为必填参数';
    }
    if (data.hasOwnProperty(key)) {
      switch (verification[key]['0']) {
        // 必填项
        case 'required':
          dealObject(data[key], function (result) {
            if (!verification[key]['1'](result)) {
              return verification[key]['2'] + '有误';
            }
          });
          break;
        // 其他
        case 'other':
          dealObject(data[key], function (result) {
            if (!isNull(result) && !verification[key]['1'](result)) {
              return verification[key]['2'] + '有误';
            }
          });
          break;
        default:
          return '多传参数' + key;
          break;
      }
    }
  }

  return false;
}

/**
* 自动检测表单辅助函数
* 用于确定表单项
* param array 参数
* verification object 总规则
*/
function assistCheck (param, verification) {
  let data = {};

  for (let key in param) {
    data[param[key]] = verification[param[key]];
  }

  return data;
}

/**
* 自动检测query参数
* rule 需要获取的数据 [参数, 是否必填, 默认参数, 字符类型]
* data object query参数
*/
function autoCheckQuery (rule, data) {
  let info = {};
  if (typeof data !== 'object') {
    return con.errorInfo.error.message;
  }

  for (let key in rule) {
    // 必填项未传参
    if (rule[key]['1'] && !data.hasOwnProperty(rule[key]['0'])) {
      return rule[key]['1'] + '为必填参数';
    }
    if (data.hasOwnProperty(rule[key]['0'])) {
      if (isNull(data[rule[key]['0']])) {
        if (rule[key]['2']) {
          info[rule[key]['0']] = rule[key]['2'];
        }
      } else {
        let type = rule[key]['3'] ? rule[key]['3'] : 'string';
        switch (type) {
          case 'number':
            if (isNaN(data[rule[key]['0']])) {
              return rule[key]['1'] + '参数格式有误';
            }
            info[rule[key]['0']] = data[rule[key]['0']];
            break;
          case 'string':
            // 简单防止sql注入
            info[rule[key]['0']] = data[rule[key]['0']].replace(/[<>"&\/`']/g, '');
            break;
          default:
            info[rule[key]['0']] = data[rule[key]['0']];
            break;
        }
      }
    } else if (rule[key]['2']) {
      info[rule[key]['0']] = rule[key]['2'];
    }
  }

  return info;
}

/*
* 生成uuid
**/
function uuid () {
  const uuidV1 = require('uuid/v1');
  return uuidV1().replace(/[-]/g, '');
}

/**
* 判断终端以及浏览器
* userAgent string User-Agent信息
*/
function judgeTerminalBrowser (userAgent) {
  let data = {
    terminal: undefined,
    browser: undefined
  };
  let regs = {};
  let terminal = {
    'windows nt 10'      : 'Windows 10',
    'windows nt 6.3'     : 'Windows 8.1',
    'windows nt 6.2'     : 'Windows 8',
    'windows nt 6.1'     : 'Windows 7',
    'windows nt 6.0'     : 'Windows Vista',
    'windows nt 5.2'     : 'Windows Server 2003XP x64',
    'windows nt 5.1'     : 'Windows XP',
    'windows xp'         : 'Windows XP',
    'windows nt 5.0'     : 'Windows 2000',
    'windows me'         : 'Windows ME',
    'win98'              : 'Windows 98',
    'win95'              : 'Windows 95',
    'win16'              : 'Windows 3.11',
    'macintosh|mac os x' : 'Mac OS X',
    'mac_powerpc'        : 'Mac OS 9',
    'linux'              : 'Linux',
    'ubuntu'             : 'Ubuntu',
    'phone'              : 'iPhone',
    'pod'                : 'iPod',
    'pad'                : 'iPad',
    'android'            : 'Android',
    'blackberry'         : 'BlackBerry',
    'webos'              : 'Mobile',
    'freebsd'            : 'FreeBSD',
    'sunos'              : 'Solaris'
  };

  for (let key in terminal) {
    if (new RegExp(key).test(userAgent.toLowerCase())) {
      data.terminal = terminal[key];
      break;
    }
  }

  if (regs = userAgent.match(/MSIE\s(\d+)\..*/)) {
    // ie 除11
    data.browser = 'ie ' + regs['1'];
  } else if (regs = userAgent.match(/FireFox\/(\d+)\..*/)) {
    data.browser = 'firefox ' + regs['1'];
  } else if (regs = userAgent.match(/Opera[\s|\/](\d+)\..*/)) {
    data.browser = 'opera ' + regs['1'];
  } else if (regs = userAgent.match(/Chrome\/(\d+)\..*/)) {
    data.browser = 'chrome ' + regs['1'];
  } else if (regs = userAgent.match(/Safari\/(\d+)\..*$/)) {
    // chrome浏览器都声明了safari
    data.browser = 'safari ' + regs['1'];
  } else if (regs = userAgent.match(/rv:(\d+)\..*/)) {
    // ie 11
    data.browser = 'ie ' + regs['1'];
  }

  return data;
}

/**
* 分页
* pageNo 页码
* pageSize 页数
* count 总条数
*/
function paging (pageNo, pageSize, count) {
  let info = {
    totalCount: count,
    currentPage: pageNo,
    pageSize: pageSize,
    pageCount: Math.ceil(Number(count) / Number(pageSize))
  };
  info.nextPageNo = pageNo < info.pageCount ? Number(pageNo) + 1 : pageNo;
  return info;
}

module.exports = {
  isEmptyObject: isEmptyObject,
  getFomatFloat: getFomatFloat,
  getTimeInterval: getTimeInterval,
  judgeObj: judgeObj,
  isNull: isNull,
  dateFormat: dateFormat,
  responseFormat: responseFormat,
  authToken : authToken,
  autoCheckForm : autoCheckForm,
  assistCheck : assistCheck,
  uuid : uuid,
  judgeTerminalBrowser : judgeTerminalBrowser,
  autoCheckQuery : autoCheckQuery,
  paging : paging
}
