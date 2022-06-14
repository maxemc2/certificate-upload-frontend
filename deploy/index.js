const scpClient = require('scp2');
const ora = require('ora');
const chalk = require('chalk');
const server = require('./products');
const spinner = ora('正在釋出到' + (process.env.NODE_ENV === 'prod' ? '生產' : '測試') + '伺服器...');
spinner.start();
scpClient.scp(
  'dist/',
  {
    host: server.host,
    port: server.port,
    username: server.username,
    password: server.password,
    path: server.path
  },
  function (err) {
    spinner.stop();
    if (err) {
      console.log(chalk.red('釋出失敗.\n'));
      throw err;
    } else {
      console.log(chalk.green('Success! 成功釋出到' + (process.env.NODE_ENV === 'prod' ? '生產' : '測試') + '伺服器! \n'));
    }
  }
);