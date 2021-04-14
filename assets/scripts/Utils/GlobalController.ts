// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, game} from 'cc';
import { Utils } from './Utils';
import { RoomController } from '../Controller/RoomController';
import { LobbyController } from '../Controller/LobbyController';
import { GameController } from '../Controller/GameController';
import { LoginController } from '../Controller/LoginController';
import { ProtocolManager } from '../ProtocolManager/ProtocolManager';
const { ccclass } = _decorator;

@ccclass('GlobalController')
export class GlobalController extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
		// Your initialization goes here.
		LoginController.getInstance().Start();//开始登陆
    }

    onEnable(){
        this.addAllEvent();
    }

    onDisable(){
        this.removeAllEvent();
    }

    onLoad(){
		//全局常驻节点
        game.addPersistRootNode(this.node);
    }
	//#region 添加删除监听事件 -- 添加事件本质上可以根据不同的场景进行添加，这里偷懒统一管理了
    private addAllEvent() : void{
		//登陆-账户
		LoginController.getInstance().AddAllEvent();
		//大厅事件
		LobbyController.getInstance().AddAllEvent();
		//房间事件
		RoomController.getInstance().AddAllEvent();
		//游戏事件
        GameController.getInstance().AddAllEvent();        
    }
    private removeAllEvent() : void{
        //以下本质上并不会调用，因为此时找不到节点了，因为是直接清空，也可不调用(多余)
		LoginController.getInstance().RemoveAllEvent();	
		LobbyController.getInstance().RemoveAllEvent();
		RoomController.getInstance().RemoveAllEvent();
		GameController.getInstance().RemoveAllEvent();
		//切换场景过程中，全局常驻节点会有个disable过程，此时需要清空之前所有事件监听，否则会导致前场景的监听未取消，产生BUG
        this._handles = {};
        ProtocolManager.getInstance().Clear();
    }

    //
    public OnNotifyStartGame(enterFinish : boolean) : void{
        GameController.getInstance().onEventStartGame(enterFinish);
    }
    public DelayCallback(cb : any,delay : number = 2) : void{
        this.scheduleOnce(cb,delay);
    }
    //#endregion

    // update (deltaTime: number) {
    //     // Your update function goes here.
	// }

	//#region 登陆-账号相关
	//all in =====> LoginController
	//#endregion

	//#region 大厅相关消息、事件
	//all in =====> LobbyController
	//#endregion

	//#region 房间相关消息、事件
	//all in =====> RoomController
	//#endregion

    //--------------------------实现事件管理----------------------
    //#region 统一管理全局事件收发
    _handles : Utils.DictType =  {};
    //发射监听
    public Emit(eventName : string, arg0 : any = undefined, arg1 : any = undefined) : void{
        for (var findEvenName in this._handles){
            if (findEvenName == eventName){
                for (var i = 0; i < this._handles[eventName].length; i++){
                    var handler = this._handles[eventName][i]
                    handler.callback.call(handler.target,arg0,arg1);
                }
            }
        }
    }
    //添加事件监听
    public On(eventName : string, callback : any, target : any){
        this._handles[eventName] = this._handles[eventName] || [];

        if(this._handles[eventName].length != 0){
            //判断是否已经存在
            for (var i = 0; i < this._handles[eventName].length; i++){
                var handler = this._handles[eventName][i];
                if (target.name == handler.target.name 
                    && callback.name == callback.name 
                    && target == handler.target){
                    return;// 存在不重复添加
                }
            }
        }

        this._handles[eventName].push({
            callback: callback,
            target: target
        });
    }

    //移除监听
    public Off(eventName : string, callback : any, target : any){
        for (var i = 0; i < this._handles[eventName].length; i++){
            var handler = this._handles[eventName][i];
            if (target.name == handler.target.name 
                && callback.name == callback.name 
                && target == handler.target){
                this._handles[eventName].splice(i, 1);
            }
        }
    }
    //#endregion
}
