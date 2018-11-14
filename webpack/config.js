/**
 * 功能描述：webpack 常用的一些配置
 * 使用方法：
 * 注意事项：
 * 引入来源：
 * 作用：
 * Create by hauk0101 on 2018/10/23
 */

'use strict';

/**
 *  设置本地开发环境访问地址为本机ip
 * **/

const interfaces = require('os').networkInterfaces(); // 在开发环境中获取局域网中的本机iP地址
let IPAdress = '';
for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
        let alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
            IPAdress = alias.address;
        }
    }
}

const config = {
    host: !!IPAdress ? IPAdress : 'localhost', // can be overwritten by process.env.HOST
}