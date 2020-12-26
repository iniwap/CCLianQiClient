//协议定义
export namespace ProtocolDefine{

    //游戏类型定义
	export enum GameType
	{
		GAME_LIANQI = 1,
		GAME_OTHER = 2,
    };
    //渠道列表
    export enum ChannelType{
		CHANNEL_APPSTORE,
		CHANNEL_YYB,
		CHANNEL_BAIDU,
		CHANNEL_360,
		CHANNEL_XIAOMI,
		CHANNEL_HUAWEI,
		CHANNEL_OPPO,
		CHANNEL_VIVO,
		CHANNEL_MEIZU,
		CHANNEL_JINLI,
		CHANNEL_PPZHUSHOU,
		CHANNEL_WANDOUJIA,
		CHANNEL_GOOGLEPLAY,
		//ETC...
    };
    //大厅协议
    export enum LobbyProtocol
	{
		P_LOBBY_BEGIN = 10000,//大厅协议相关起止协议号
		P_LOBBY_REQ_CONNECT,
		P_LOBBY_RESP_CONNECT,
		//登陆
		P_LOBBY_REQ_LOGIN,
		P_LOBBY_RESP_LOGIN,
		//在线人数
		P_LOBBY_REQ_ONLINE_CNT,
		P_LOBBY_RESP_ONLINE_CNT,
		//场次
		P_LOBBY_REQ_PLAZA_LIST,
		P_LOBBY_RESP_PLAZA_LIST,
		//道具信息
		P_LOBBY_REQ_PROP_LIST,
		P_LOBBY_RESP_PROP_LIST,
		//包裹信息
		P_LOBBY_REQ_PACKAGE_LIST,
		P_LOBBY_RESP_PACKAGE_LIST,
		//系统公告
		P_LOBBY_REQ_SYSMSG,
		P_LOBBY_RESP_SYSMSG,
		//个人消息（邮件）
		P_LOBBY_REQ_PRIVATEMSG,
		P_LOBBY_RESP_PRIVATEMSG,
		//修改昵称
		P_LOBBY_REQ_CHANGE_NICKNAME,
		P_LOBBY_RESP_CHANGE_NICKNAME,
		//排行榜
		P_LOBBY_REQ_RANK_LIST,
		P_LOBBY_RESP_RANK_LIST,
		//商品列表
		P_LOBBY_REQ_STORE_LIST,
		P_LOBBY_RESP_STORE_LIST,

		//好友列表
		P_LOBBY_REQ_FRIEND_LIST,
		P_LOBBY_RESP_FRIEND_LIST,

		//签到、抽奖数据，由此生成用户签到、抽奖信息
		P_LOBBY_REQ_SIGNIN_LUCKDRAW_DATA,
		P_LOBBY_RESP_SIGNIN_LUCKDRAW_DATA,

		//请求签到,需要手动点击签到
		P_LOBBY_REQ_SIGNIN,
		P_LOBBY_RESP_SIGNIN,
		//抽奖
		P_LOBBY_REQ_LUCKDRAW,
		P_LOBBY_RESP_LUCKDRAW,

		P_LOBBY_AWARD_EMAIL,
		P_LOBBY_REQ_UPDATE_EMAIL,//删除、已读、领奖等
		//..
		P_LOBBY_REQ_FEEDBACK,//反馈
		P_LOBBY_RESP_FEEDBACK,

		P_LOBBY_REQ_OPENTALENTSLOT,//打开天赋槽
		P_LOBBY_RESP_OPENTALENTSLOT,//打开槽响应

		P_LOBBY_END = 19999,//大厅协议相关起止协议号
    };
    
    //游戏协议，即房间相关协议，同时包括非具体游戏本身协议
    export enum GameProtocol //or RoomProtocol
	{
		P_GAME_BEGIN  = 20000,//游戏房间相关起止协议号
		//加入房间
		P_GAME_REQ_JOINROOM,
		P_GAME_RESP_JOINROOM,
		//创建房间
		P_GAME_REQ_CREATEROOM,
		P_GAME_RESP_CREATEROOM,
		//离开房间
		P_GAME_REQ_LEAVEROOM,
		P_GAME_RESP_LEAVEROOM,
		//玩家信息、玩家动作
		P_GAME_PLAYER_ACT,
		P_GAME_PLAYER_INFO,
		P_GAME_PLAYER_STATE,
		P_GAME_PLAYER_TALK_MSG,
		//心跳
		P_GAME_REQ_HEART,
		P_GAME_RESP_HEART,
		//托管
		P_GAME_REQ_TRUST,
		P_GAME_RESP_TRUST,
		//时钟
		P_GAME_CLOCK,
		//房间列表
		P_GAME_REQ_ROOMLIST,
		P_GAME_RESP_ROOMLIST,
		P_GAME_ROOMSTATE_CHANGE,

		//通知玩家离开房间
		P_GAME_PLAYER_LEAVE,

		//通知服务器进入游戏界面完成
		P_GAME_ENTER_ROOM_FINISH,
		P_GAME_START_GAME,//通知服务器开始游戏

		P_GAME_REPORT_TALENT_LIST,//上报天赋列表
		P_GAME_TALENT_LIST,//推送天赋列表,包括自己上报的响应

		P_GAME_END = 29999,//游戏房间相关起止协议号
    };
    
    //联棋游戏
    export enum GameLianQiProtocol
	{
		P_GAME_LIANQI_BEGIN = 30000,
		//游戏开始
		P_GAME_LIANQI_START,
		//玩家棋盘，需要在每次落子或者移动后发送
		P_GAME_LIANQI_QI,
		//执子方
		P_GAME_LIANQI_TURN,
		//弃权
		P_GAME_LIANQI_REQ_PASS,
		P_GAME_LIANQI_RESP_PASS,
		//落子
		P_GAME_LIANQI_REQ_PLAY,
		P_GAME_LIANQI_RESP_PLAY,//此处返回逻辑运算结果，执行动画等
		//吃掉子后是否移动
		P_GAME_LIANQI_REQ_MOVE,
		P_GAME_LIANQI_RESP_MOVE,//MOVE之后触发新棋局形式，如果可移动携带计算结果
		//请求和棋
		P_GAME_LIANQI_REQ_DRAW,
		P_GAME_LIANQI_RESP_DRAW,
		//结束，带结算
		P_GAME_LIANQI_RESULT,
		//断线重连
		P_GAME_LIANQI_FLAG,
		P_GAME_LIANQI_REQ_ABANDON,// 投降
		P_GAME_LIANQI_RESP_ABANDON,// 投降

		P_GAME_LIANQI_ABANDON_PASS,// 自动切换手
		//更多待定..

		P_GAME_LIANQI_END = 39999,//游戏协议起止号，这里只有联棋
	};
	
	export namespace MsgLogin{
		export enum eLoginType
		{
			LOGIN_TYPE_NONE = 0,
			LOGIN_TYPE_YK = 1,
			LOGIN_TYPE_QQ = 2,
			LOGIN_TYPE_WX = 3,
		};

		export enum eClientType
		{
			CLIENT_TYPE_IPHONE = 1,
			CLIENT_TYPE_IPAD = 2,
			CLIENT_TYPE_ANDROID = 3,
			CLIENT_TYPE_PC = 4,
			//..MORE
		};

		export enum eNetWorkType
		{
			NETWORK_TYPE_WIFI = 1,
			NETWORK_TYPE_4G = 2,
			// MORE
		};
		export interface msgLogin
		{
			userID : number;  //游客第一次登陆请填0//如果有值则认为是后续登陆
			loginType : eLoginType;
			area : number;//区服id
			password : string;
			deviceID : string;//设备码
			osVersion: number;//操作系统版本号
			ipAddr: number;
			channelID: number; //渠道号
			appVersion: number;
			netWorkType: number;
	
			//三方登陆数据
			openID : string;
			token : string;
			nickName : string;
			head : string;
			sex: number;
			expireTime: number;
		};
	};

	export namespace MsgUserData{
		export enum eLoginResultFlag
		{
			LOGIN_SUCCESS = 0,
			LOGIN_FAIL_INCORRECT_PWD = 1,//密码错误
			LOGIN_FAIL_NOT_EXIST_ACCOUT = 2,//账号不存在
			LOGIN_FAIL_NOT_SUPPORT_TYPE = 3,
			LOGIN_FAIL_OPENID_ERROR = 4,
			LOGIN_SUCCESS_HAS_LOGIN = 5,
		};
		export interface msgUserData
		{
			flag : eLoginResultFlag;
			user_id : number; 
			area : number; 
			name : string;
			sex: number; 
			head : string;
			ip: number; 
			gold: number; 
			win: number; //赢
			lose: number; //输
			draw: number; //平－和
			escape: number; //逃跑
			talent: number; //天赋槽数，已打开的天赋槽
			gameTime: number; //总游戏时长
			exp: number; //经验
			room_id: number; //是否在房间中,0不在
			adult : boolean;//是否成年
			charm: number; //魅力
			lastlogin_time: number; //最后登陆时间
			score: number; //得分-对应段位，是总星数，每个段位分多少星
			diamond: number; //钻石
			energy: number; //能量
		};
	}
}
  
  