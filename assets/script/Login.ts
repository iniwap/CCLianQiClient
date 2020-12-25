// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

//var pomelo = window.pomelo;

@ccclass('Login')
export class Login extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
        /*
        pomelo.init({
                host : '116.62.57.248',
                port : '3014'
            }, function () {
                var route = 'gate.gateHandler.queryEntry';
                console.log('请求链接');
                pomelo.request(route, {
                }, function (data : any) {
                    console.log('请求登陆');
                    console.log(data);
            })
        });
        */
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onClickYKBtn(){
        console.log('游客登陆');
    }

    onClickWXBtn(){
        console.log('微信登陆');
    }

    onClickQQBtn(){
        console.log('qq登陆');
    }
}
