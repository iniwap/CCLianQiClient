import { sys,find as CCFind, Vec2 } from "cc";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { GlobalController } from "./GlobalController";

//
export namespace Utils{

    //禁用log
    const DEBUG  = true;
    if(!DEBUG){
        console.log = function() {}
        console.warn = function() {}
        console.error = function() {}
    }

    export const getPlayerPrefs = function(key : any,defaultValue : any) : any{

        let v : any = sys.localStorage.getItem(key);

        if(v === null){
            return defaultValue;
        }
        
        return v;
    }
    export const setPlayerPrefs = function(key : any,v : any) : void{
        sys.localStorage.setItem(key,v);
    }
    export const encodeMsg = function(msg : any) : JSON{
        let json : string = JSON.stringify(msg);
        return  JSON.parse(json);
    }

    export interface DictType {
        [key : string]: any;
        //key1: string;
    //...
    };

    export const getGlobalController = function() : any {
		let gc : any = CCFind("GlobalController")?.getComponent("GlobalController");
        if(gc === null) {
            console.log("getGlobalController找不到节点，不可能出现");
            return null;
        }else{
            return (gc as GlobalController);
		}
    }

    export const getModeStr = function(type : ProtocolDefine.nRoom.eCreateRoomType,
        playerNum : number,gridLevel : number) : string{
        let mode : string = "";
        if (type != ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA) {
            if (playerNum == 2) {
                mode = mode + "双人";
            } else if (playerNum == 3) {
                mode = mode + "三人";
            } else if (playerNum == 4) {
                mode = mode + "四人";
            }
            if (gridLevel == 4) {
                mode = mode + "四阶";
            } else if (gridLevel == 6) {
                mode = mode + "六阶";
            } else if (gridLevel == 8) {
                mode = mode + "八阶";
            }
        } else {

            if (playerNum == 2 && gridLevel == 4) {
                mode = "楚汉逐鹿";
            } else if (playerNum == 2 && gridLevel == 6) {
                mode = "一决雌雄";
            } else if (playerNum == 4 && gridLevel == 6) {
                mode = "四国混战";
            } else if (playerNum == 3 && gridLevel == 6) {
                mode = "三足鼎立";
            }
        }

        return mode;
    }
    export const getVipLevel = function(vip : number) : number{
        if (vip == 0) {
            return 0;
        }
        if (vip > 0 && vip <= 10) {
            return 1;
        }
        if (vip > 10 && vip <= 99) {
            return 2;
        }
        if (vip > 99) {
            return 3;
        }

        return 0;
    }

    // export const copy = function(obj : object,objs : object,deep : boolean) : object {
    //     deep = deep || false; // tue深copy false 浅copy
    //     for(let pro in objs) {
    //     　　if(!deep) {
    //     　　　　obj[pro] = objs[pro];
    //     　　}else{
    //     　　　　if(typeof objs[pro] == 'object') {
    //     　　　　　　if(Object.prototype.toString.call(objs[pro]) == '[object Object]') {
    //     　　　　　　　　for(let key in objs[pro]) {
    //     　　　　　　　　　　obj[key] = objs[pro][key]
    //     　　　　　　　　}
    //     　　　　　　}
    //     　　　　}else{
    //     　　　　　　obj[pro] = objs[pro];
    //     　　　　}
    //     　　}
    //     }
    //     return obj;
    // }
}
