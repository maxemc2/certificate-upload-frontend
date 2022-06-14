//讀取env環境變數
 const fs = require('fs');
 const path = require('path');
 // env 檔案 判斷打包環境指定對應的伺服器id
 const envfile = process.env.NODE_ENV === 'prod' ? '../.env.prod' : '../.env.dev';
 // env環境變數的路徑
 const envPath = path.resolve(__dirname, envfile);
 // env物件
 const envObj = parse(fs.readFileSync(envPath, 'utf8'));
 const SERVER_ID = parseInt(envObj['VUE_APP_SERVER_ID']);
 
 function parse(src) {
   // 解析KEY=VAL的檔案
   const res = {};
   src.split('\n').forEach(line => {
     // matching "KEY' and 'VAL' in 'KEY=VAL'
     // eslint-disable-next-line no-useless-escape
     const keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
     // matched?
     if (keyValueArr != null) {
       const key = keyValueArr[1];
       let value = keyValueArr[2] || '';
 
       // expand newlines in quoted values
       const len = value ? value.length : 0;
       if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
         value = value.replace(/\\n/gm, '\n');
       }
 
       // remove any surrounding quotes and extra spaces
       value = value.replace(/(^['"]|['"]$)/g, '').trim();
 
       res[key] = value;
     }
   });
   return res;
 }
 
//定義多個伺服器賬號 及 根據 SERVER_ID 匯出當前環境伺服器賬號
 const SERVER_LIST = [
   {
     id: 0,
     name: '成大測試環境',
     host: '140.116.247.124',// ip
     port: 15622,// 埠
     username: 'medcert', // 登入伺服器的賬號
     password: 'netdb2602',// 登入伺服器的賬號
     path: './dist'// 釋出至靜態伺服器的專案路徑
   },
   {
     id: 1,
     name: 'B-測試環境',
     domain: 'test.xxx.com',
     host: 'XX.XX.XX.XX',
     port: 22,
     username: 'root',
     password: 'xxxxxxx',
     path: '/usr/local/www/xxx_program_test/'
   }
 ];
 
 module.exports = SERVER_LIST[SERVER_ID];