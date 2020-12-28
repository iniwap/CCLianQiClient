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
}