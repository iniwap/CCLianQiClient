import { ProtocolDefine } from "../Define/ProtocolDefine";
import { Lobby } from "../Model/Lobby";

export namespace GameEvent{
    export enum EVENT{
		// 因为不希望在界面体现网络通信相关代码，所以需要传出这两个事件
		GAME_EVENT_BEGIN = 30000,
		PLAY,//落子
		MOVE,//移动
		PASS,//过，回合结束
		ABANDON,//投降
		DRAW,//请和
		ACTION_FAIL,//操作失败，响应
		CLOCK,

		SHOW_GAME_START,//对局开始
		SHOW_FLAG,//
		SHOW_DRAW,// 显示谁请求和棋
		SHOW_DRAW_RESULT,//显示和棋请求结果//谁谁不同意或者同意之类

		SHOW_PLAY,//别人落子

		SHOW_MOVE,//别人落子
		SHOW_PASS,//结束回合响应

		SHOW_ABANDON,
		SHOW_ABANDON_PASS,//由于服务器自动pass，所以客户端需要处理此消息
		SHOW_TURN,//显示谁出
		SHOW_RESULT,//结算
		SHOW_LIANQI,// 重连时候的棋盘数据

		//游戏界面之间的消息定义

		//lianqi panel
		TO_LQP_ACTION_FAIL,
		TO_LQP_CLOCK,
		TO_LQP_SWITCH_HINT,//棋子信息提示

		//action panel
		ACTION_MOVE,//操作面板 移动
		ACTION_BAN_DIR,//操作面板 禁用方向
		ACTION_PASS,//操作面板 结束回合
		ACTION_PLAY,//操作面板 落子
		ACTION_STEP,//操作是否轮到自己


		//to gameview
		TO_GAMEVEIW_UPDATE_SCORE,
    };
    export interface IUpdateClock{
        local : number,
        leftTime : number,
        step : ProtocolDefine.nGame.nLianQi.eGameStepType,
	}
	export interface IShowTurn{
		local : number;
		isPassTurn : boolean;
		round : number;
		isTimeOut : boolean;
		banDirList : Array<number>;
	}
	export interface IPlayOrMove{
		local : number;
		x : number;
		y : number;
		direction : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType;
		checkerBoard : Array<ProtocolDefine.nGame.nLianQi.Chess>;
	}
	export interface IGameResult{
		seat : number;
		isOwner : boolean;//只有房间模式有效
		head : string;
		name : string;
		area : number;//领地
		kill : number;//消灭
		score : number;//得分
		multi : number;//倍率
		hasAbandon : boolean;//是否投降了
	}
	export interface IShowGameResult{
		roomType : ProtocolDefine.nRoom.eCreateRoomType;//用于是否显示房主标志,只有房间模式显示
		level : Lobby.ePlazaLevelType;
		baseScore : number;
		poolGold : number;//实际的奖池积分
		gameResult : Array<IGameResult>;//根据积分 顺序
	}
	export interface IPlay{
		x : number;
		y : number;
		direction : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType;
	};
	export interface IMove{
		x : number;
		y : number;
		direction : ProtocolDefine.nGame.nLianQi.eLianQiDirectionType;
	};
};
