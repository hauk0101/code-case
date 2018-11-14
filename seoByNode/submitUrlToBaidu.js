/**
 * 功能描述：自动向百度提交链接
 * 使用方法：根据开发需求，拷贝 submitUrlToBaidu方法即可
 * 注意事项：本例使用 eggjs
 * 引入来源：eggjs
 * 作用：SEO
 * Create by hauk0101 on 2018/11/5
 */

'use strict';

const http = require('http');
const Controllr  = require('egg').Controller;

class SubmitUrlToBaidu extends Controller {
    async render(){
        const option = {
            urlArryay: [], //需要提交的地址数组
            interfacePath: '',//接口的调用地址
        }
        const rst = await this.submitUrlToBaidu(option);
        console.log('输出结果：',rst);
    }

    async submitUrlToBaidu(option) {
        var urlArryay = option.urlArryay; //需要提交的地址数组
        var interfacePath = option.interfacePath;//接口的调用地址

        var urlList = '';
        if (urlArryay.length > 1 || Array.isArray(urlArryay)) {
            urlList = urlArryay.join('\n');
        } else {
            urlList = urlArryay;
        }

        var options = {
            host: "data.zz.baidu.com",
            path: interfacePath,//接口的调用地址
            method: "post",
            "User-Agent": "curl/7.12.1",
            headers: {
                "Content-Type": "text/plain"
            }
        }
        return new Promise((resolve, reject) => {
            try {
                var httpReq = http.request(options, (resp) => {
                    resp.setEncoding("utf8");
                    resp.on('data', function (data) {
                        //返回的数据
                        resolve(data);
                    });
                    resp.on('error', function (err) {
                        reject(err);
                    })
                });

                httpReq.write(urlList);
                httpReq.end();
            }
            catch (e) {
                reject(e);
            }

        })

    }
}