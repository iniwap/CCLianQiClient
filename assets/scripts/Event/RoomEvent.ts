import { ProtocolDefine } from "../Define/ProtocolDefine";

export namespace RoomEvent{
    export enum EVENT{
        ROOM_EVENT_BEGIN = 40000,
        CREATE_ROOM,//请求 创建房间
        JOIN_ROOM,//请求加入房间
        LEAVE_ROOM,//请求离开房间
        ENTER_ROOM_FINISH,//游戏界面加载完成
        UPDATE_LEAVE_ROOM,//有人离开房间，自己的话收到响应的时候就直接退出了，不是这个处理
        UPDATE_DISSOLVE_ROOM,//解散房间
        GET_ROOM_LIST,//获取房间列表
        SHOW_ROOM_LIST,
        UPDATE_ROOM_STATE,
        PLAYER_ACT,
        TALK_MSG,
        SHOW_TALK_MSG,
        UPDATE_ROOMRULE,
        PLAER_ENTER,//用户进入
        UPDATE_PLAER_STATE,//用户状态发生变化
        START_GAME,//点击开局
        START_AI_GAME,//开始单机模式
    };

    export interface JoinRoom{
      playerNum : number;//由于一个场支持两种人数模式，所以需要客户端上传这个两个参数
      gridLevel : number;//
      plazaID : number;//根据plazalist得到，界面也是根据plazalisy生成
      pwd : string;//非用户创建无密码
      roomId : number;//非用户创建房间填0，即通过各种模式直接进入游戏的

      //未来方便，传递下name和tagid
      plazaName : string;
      tagId : number;
    };
    
    export enum eRoomClassicType{
      MODE_2_4,//
      MODE_2_6,
      MODE_4_6,
    }
    
    export enum eRoomPlayerType{
      ROOM_WIAT,// 房间玩家
      GAME_WAIT,//游戏等待时玩家
    };
    export interface IUpdateRoomRule{
      type : ProtocolDefine.nRoom.eCreateRoomType;
  
      playerNum : number;
      gridLevel: number;
      rule : string;
      gameTime: number;//限制总时长
      lmtRound: number;//限制回合
      lmtTurnTime: number;//限手时长
      roomLevel: number;
      roomID: number;
  
      //如果是场模式，需要以下参数
      star: number;
      tag: number;
      plazaName : string;
    }

    export interface IUpdatePlayerState{
      local : number;
      ifAllReady : boolean;
      state: ProtocolDefine.nRoom.eStateType;
    }
    export interface IReqCreateRoom{
      roomType : ProtocolDefine.nRoom.eCreateRoomType;
      baseScore : number;
      minScore : number;
      maxScore : number;
      roomName : string;
      roomPassword : string;
      //此处rule已经拼接好，rule也可以拆分为单字段，看具体实现
      rule : string;// "{\"playerNum\":2,\"gridLevel\":4,\"rule\":\"default\",\"gameTime\":\"360\"}";//规则json 或者字符串，非常重要
    };
    export interface IPlayerTalentList{
      local : number;
      talentList : Array<number>;
    }
}