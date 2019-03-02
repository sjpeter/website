// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: [
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // 此规则强制在箭头函数中一致使用括号
    'arrow-parens': 'off',
    // 此规则强制一致使用反引号，双引号或单引号。
    'quotes': 'off',
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 关闭语句强制分号结尾
    'semi': ['off'],
    // 空行最多不能超过10行
    "no-multiple-empty-lines": ['off', {"max": 10}]
  }
}
