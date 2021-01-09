import { EXPORT_TO_GLOBAL } from "cce.env";

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
	
	export enum eFlag{
		ERROR = -1,
		SUCCESS = 0,
	};

	export interface msgSimpleResp{
		ret : eFlag;
	};

	export namespace nServer{
		export enum eServerState{
			SERVER_STATE_NOT_AVAILABLE,// 服务器不可用 
			SERVER_STATE_IDLE,//空闲
			SERVER_STATE_CROWD,//拥挤
			SERVER_STATE_FULL,//爆满
		};
		export interface Server{
			state : eServerState;
			host : string;
			port : number;
			serverName : string;
		};

		export interface msgRespServerList{
			serverList : Array<Server>;
		};
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
	};

	//lobby 协议消息
	export namespace nLobby{
		/// 场列表
		export namespace nPlaza{
			export interface msgReqPlazaList{
				game : GameType;
			};
			export interface PlazaLevel{
				base_score : number;   // --底分
				minsr : number;      // --进入下限   
				maxsr : number;     // --进入上限
				levelid : number;     // --场等级
			}
			export enum eLmtType
			{
				LMT_BY_GOLD,//金币限制条件
				LMT_BY_LEVEL,//等级限制条件
			};
			export interface Plaza
			{		
				lmt_type : eLmtType;//限制条件类型
				plazaid : number;   // --场次id
				room_type : number;      // --底注    
				star : number;     // --进入下限
				rule : string;//配置字符串
				name : string;
				des : string;
				levelList : Array<PlazaLevel>;
			};
			export interface msgRespPlazaList{
				plazaList : Array<Plaza>;
			};
		};
		/// 道具列表
		export namespace nProp{
			export interface msgReqPropList
			{
				game : GameType;
			};
			export enum ePropType
			{
				NONE,
				PROP,
				SKIN,
				HERO,
				//etc...
			};
			export interface Prop
			{
				type : ePropType;
				id : number;//道具id
				price : number;//道具价格
				name : string;//道具名字
				pic : string;//道具图片
				des : string;//道具描述
				data : string;//道具属性，待定
			};
			export interface msgRespPropList{
				propList : Array<Prop>;
			};
		};
		/// 背包信息
		export namespace nPackage{
			export interface msgReqPackageList
			{
				game : GameType;
			};
			export interface Package
			{
				prop_id : number;
				prop_cnt : number;
				end_time : number;
			};
			export interface msgRespPackageList
			{
				packageList : Array<Package>;
			};
		};
		/// 系统公告 - 邮件
		export namespace nSysOrPrivateMsg{
			export enum eSysOrPrivateMsgType
			{
				TYPE_MSG_SYS,//系统消息
				TYPE_MSG_PRIVATE,//个人消息
				TYPE_MSG_NOTICE,//系统公告
			};
			export interface msgReqSysMsgList
			{
				game : GameType;
				channelID : ChannelType;
			};
			export interface SysAndPrivateMsg
			{
				type : eSysOrPrivateMsgType;
				id : number;
				has_read : number;
				title : string;
				content : string;
				author : string;
				send_time : string;
				end_time : string;//过期时间
			};
			export interface msgRespSysMsgList
			{
				sysMsgList : Array<SysAndPrivateMsg>;
			};
			export interface msgReqPrivateMsgList
			{
				game : GameType;
				cnt : number;//请求几条
				begin : number;//开始的索引
			};
			export interface msgRespPrivateMsgList
			{
				privateMsgList : Array<SysAndPrivateMsg> ;
			};
			//奖励邮件信息 服务器推送 所有奖励都必须走这条消息，服务端会同时插入到个人邮件
			export interface msgAwardEmail{
				type : eSysOrPrivateMsgType;
				needAdd2Email : boolean;//是否需要添加到邮件列表，比如仅仅单纯发奖的，就不需要添加到邮件
				id : number;
				has_read : number;
				title : string;
				content : string;
				author : string;
				send_time : string;
				end_time : string;//过期时间
			};
			export enum eUpdateEmailType{
				READ,
				DEL,
				GET_AWARD,
			};
			export interface msgReqUpdateEmail{
				type : eUpdateEmailType;
				awardEmailId : number;//奖励邮件的id
			};
		};
		//排行榜
		export namespace nRank{
			export enum eRankScopeType
			{
				RANK_ALL,//全世界
				RANK_FRIEND,//好友
				RANK_AREA,//区服
			};
			export enum eRankType
			{
				RANK_GOLD,//财富
				RANK_CHARM,//魅力
				RANK_DIAMOND,//钻石
				RANK_SCORE,//积分
				RANK_WINRATE,//胜率
				RANK_EXP,
			};
			export interface msgReqRankList
			{
				game : GameType;
				scope : eRankScopeType;
				type : eRankType;
		
				area : number;//区服id
				rankNum : number;//多少人
			};
			export interface Rank
			{
				userID : number;
				name : string;
				headUrl : string;
				exp : number;
				score : number;
				charm : number;
				diamond : number;
				gold : number;
				win_rate : number;
			};
			export interface msgRespRankList
			{
				type : eRankType;
				scope : eRankScopeType;
				rankList : Array<Rank> ;//是否需要分条发送，待测试
			};
		};
		/// 商品列表
		export namespace nStore{
			export interface msgReqStoreList
			{
				game : GameType;
				channelID : ChannelType;
			};
			export interface Product
			{
				id : number;
				point : string;//计费点
				price : number;
				name : string;
				des : string;
				pic : string;
				data : string;
			};
			export interface msgRespStoreList
			{
				storeList : Array<Product>;
			};
		};
		/// 好友列表
		export namespace nFriend{
			export interface msgReqFriendList
			{
				game : GameType;
				//是否加入一次请求多少条？
			};
			export interface Friend
			{
				friend_id : number;
				name : string;
				head_url : string;
				lastlogin_time : string;
				des : string;
				friend_score : number;//亲密值等
			};
			export interface msgRespFriendList
			{
				friendList : Array<Friend>;
			};
		};
		//反馈
		export namespace nFeedback{
			export enum eFeedbackType{
				BUG,
				ACCOUNT,
				AWARD,
				RECHARGE,
				SUGGEST,
				DANMU,
			};
			export interface msgReqFeedback{
				type: eFeedbackType;
				content : string;
			};
		};
		//签到抽奖数据，以此生成签到、抽奖界面
		export namespace nSignInDraw{
			export enum eSignInAwardType
			{
				NONE,
				GOLD,
				PROP,
				//etc...
			};
			export interface msgReqSignInLuckDrawData
			{
				game : GameType;
				areaID : number;
				deviceID : string;
			};
			export interface SignIn
			{
				type : eSignInAwardType;//签到奖励类型,请根据type来决定显示的奖励
				day : number;//第几天，也可以更加下标来用，一般按照天顺序
				prop_id : number;//请到proplist查询相关道具信息用于显示
				gold_num : number;
				//etc...
			};
			export interface LuckDraw
			{
				type : eSignInAwardType;
				prop_id : number;
				gold_num : number;
			};
			export interface msgRespSignInLuckDrawData
			{
				hasDrawed : boolean;
				hasSigned : boolean;
				signInDay : number;// 当前签到第几天
				signData : Array<SignIn>;//长度代表有多少天可以签到,一般是7日或者30日。实际用途为提高7日/30日留存率
				luckData : Array<LuckDraw>;//长度代表有多少抽奖项，抽奖为日抽，或者不定期抽奖，此项需要判断有无来显示界面
			};
			export interface msgReqSignIn
			{
				game : GameType;
				areaID : number;
				deviceID : string;
			};
			export enum eSignInFlag
			{
				SIGNIN_FLAG_SUCESS,//签到成功
				SIGNIN_FLAG_HAS_SIGNIN,//已经签到过
				SIGNIN_FLAG_INVLID,//签到失败
			};
			export interface msgRespSignIn
			{
				flag : eSignInFlag;
				type : eSignInAwardType;//签到奖励类型,请根据type来决定显示的奖励
				prop_id : number;
				gold_num : number;
			};
			export interface msgReqLuckDraw
			{
				game : GameType;
				areaID : number;
				deviceID : string;
			};
			export enum eLuckDrawFlag
			{
				LUCKDRAW_FLAG_SUCESS,//抽奖成功
				LUCKDRAW_FLAG_HAS_DRAW,//已抽过
				LUCKDRAW_FLAG_INVLID,//抽奖失败
			};
			export interface msgRespLuckDraw
			{
				flag : eLuckDrawFlag;
				type : eSignInAwardType;
				prop_id : number;
				gold_num : number;
			};
		};
		//天赋系统
		export namespace nTalent{
			export enum eOpenByType
			{
				OPEN_BY_GOLD,
				OPEN_BY_DIAMOND,
			};
			export interface msgReqOpenTalentslot{
				game : GameType;
				openBy : eOpenByType;
			}
			export enum eOpenTalentslotResultType{
				OPEN_SUCCESS,
				OPEN_FAIL,//
				OPEN_FAIL_LESS_GOLG,
				OPEN_FAIL_LESS_DIAMOND,
				OPEN_FAIL_MAX_SLOT,//达到最大槽数，即已经全打开过了，属于非法操作
			};
			export interface msgRespOpenTalentslot{
				result : eOpenTalentslotResultType;
				currentOpenedCnt : number;//当前已打开的个数//可以得到当前打开的是currentOpenedCnt-1，客户端限制必须依次打开
				openBy : eOpenByType;
				currentGold : number;
				currentDiamond : number;
			};
			export interface msgTalentList{
				seat : number;// 如果是自己，则是上报响应，不是自己则为其他玩家技能列表
				talentList : string;
			}
		};
	};

	//room 协议消息
	export namespace nRoom{
		//加入房间
		export interface msgReqJoinRoom
		{
			game : GameType;
			playerNum : number;//由于一个场支持两种人数模式，所以需要客户端上传这个两个参数
			gridLevel : number;//
			roomId : number;//用于加入房间，即房间列表进入，通过场进入的请务必填roomid=0
			plazaID : number;//用于加入场id，即需要分配roomid
			pwd : string;//房间密码，如果非自建房间，不需要传递密码。自建房间默认也是无密码的
		};
		export enum eRespJoinRoomFlag
		{
			JOINROOM_SUCCESS,//成功
			JOINGROOM_FAIL_ROOM_NOT_EXIST,//房间不存在即房间号错误
			JOINROOM_FAIL_NO_FREE_ROOM,//没有可用房间
			JOINROOM_GOLD_LESS,//金币不足
			JOINROOM_GOLD_MORE,//金币过高
			JOINROOM_LEVEL_LESS,//等级过低
			JOINROOM_LEVEL_MORE,//等级过高
			JOINROOM_PWD_ERR,//密码错误
			JOINROOM_ACCOUNT_ERR,//用户不存在
			JOINROOM_PLAZA_ERR,//所选择的场不存在
			JOINGROOM_ALREADY_IN_ROOM,//已经在房间中
			JOINROOM_FIAL_SYSERR,//系统出错
			//etc...
		};
		export interface msgRespJoinRoom
		{
			flag : eRespJoinRoomFlag;
			roomId : number;
			levelId : number;
			baseScore : number;
			owner : number;
			rule : string;
			isRelink : boolean;
			plazaid : number;
			roomType : number;
		};
		/// 通知服务器，进入游戏界面完成，可以发送用户信息了
		export interface msgNotifyEnterRoomFinish
		{
			isRelink : boolean;
		};
		//通知服务器可以开始游戏
		export interface msgNotifyStartGame
		{
			game : GameType;
			isEnterRoomFinsh : boolean;
		};
		export enum eCreateRoomType{
			ROOM_CLASSIC_PLAZA = 0,
			ROOM_PLAZA = 1,
			ROOM_ROOM = 2,
			ROOM_TEAM = 3,
		};
		//创建房间
		export interface msgReqCreateRoom
		{
			game : GameType;
			roomType : eCreateRoomType;
			baseScore : number;
			minScore : number;
			maxScore : number;
			roomName : string;
			roomPassword : string;
			rule : string;//房间规则
		};
		export interface msgRespCreateRoom
		{
			flag : number;//=0成功
			roomId : number;
			roomName : string;
			roomPassword : string;
			rule : string;//房间规则
		};
		/// 离开房间
		export interface msgReqLeaveRoom
		{
			game : GameType;
		};
		export enum eLeaveType
		{
			LEAVE_NORMAL,
			LEAVE_KICK,
			LEAVE_ESCAPE,
			LEAVE_NOT_IN_ROOM,//不在房间中
			LEAVE_CANT_LEAVE,//不能离开
			LEAVE_DISSOLVE,//解散
		};
		export interface msgRespLeaveRoom
		{
			type : eLeaveType;
			leaveResult : number;//0成功，other失败
			msg : string;
		};
		export interface msgReqHeartbeat
		{
			game : GameType;
		};
		export interface msgRespHeartbeat
		{
			active : number;
		};
		export interface msgReqTrust
		{
			game : GameType;
			seat : number;
		};
		export interface msgRespTrust
		{
			seat : number;
		};
		export enum ePlayerLeaveRoomType{
			LEAVE_ROOM_NORMAL,//正常退出
			LEAVE_ROOM_REMOVED,//等待游戏开始时间过长
			LEAVE_ROOM_EXIST_TIME_OUT,//超出最长房间占用时间
			LEAVE_ROOM_OWNER_OFFLINE,//房主离线（即房间里没有人了）
			LEAVE_ROOM_OWNER_DISSOLVE,//
			LEAVE_ROOM_GAMEEND,
		};
		/// 用户离开房间，用于玩家未准备状态，其他用户离开
		/// 说明：收到此消息，如果不是自己，则需要移除保存的用户数据以及更新界面显示
		export interface msgPlayerLeave{
			type : ePlayerLeaveRoomType;
			seat : number;
			userID : number;
		};
		export enum eActType
		{
			ACT_SITDOWN,//坐下，之后才能准备
			ACT_STANDUP,//站起
			ACT_READY,//准备
			ACT_SEEING,//旁观
		};
		/// 用户动作－准备、坐下等
		export interface msgPlayerAct
		{
			act : eActType;
			seat : number;
		};
		/// 玩家信息－即玩家进入房间
		export interface msgPlayerInfo
		{
			userID : number;
			name : string;
			headUrl : string;
			sex : number;
			vip : number;
			gold : number;
			win : number;
			lose : number;
			draw : number;
			escape : number;
			talent : number;
			exp : number;//经验
			score : number;
			charm : number;
			seat : number;
			//etc...
		};
		export enum eStateType
		{
			STATE_TYPE_NONE,//无效状态
			STATE_TYPE_STANDUP,//站起
			STATE_TYPE_SITDOWN,//坐下
			STATE_TYPE_ROOMREADY,//准备中
			STATE_TYPE_PLAYING,//游戏中
			STATE_TYPE_OFFLINE,//离线
			STATE_TYPE_SEEING,//观战
		};
		/// 玩家状态
		export interface msgPlayerState
		{
			state : eStateType;
			userID : number;
			seat : number;
		};
		/// 玩家聊天，在游戏内的聊天，这里发送和接受都用这个消息//发送userid可以填0
		export interface msgPlayerTalkMsg
		{
			flag : eFlag;
			seat : number;
			content : string;
		};
		//计时
		export interface msgClock
		{
			seat : number;
			leftTime : number;
			step : nGame.nLianQi.eGameStepType;
		};
		/// 自建房间列表
		export interface msgReqRoomList
		{
			game : GameType;
			areaID : number;
			begin : number;
			reqCnt : number;//请求多少条room信息
		};
		export interface Room
		{
			roomId : number;
			isFull : number;
			roomName : string;
			roomDes : string;
		 	roomPersonCnt : number;
			roomPwd : string;
			rule : string;
		};
		export interface msgRespRoomList
		{
			roomList : Array<Room>;
		};
		/// 房间状态变化
		export enum eRooStateChangeType
		{
			ROOMSATE_NONE,
			ROOMSTATE_ADD,//有增加房间，如果用户在房间列表显示界面，请插入此条到顶部
			ROOMSTATE_REMOVE,//有房间删除
			ROOMSTATE_UPDATE,//房间状态更新
		};
		export interface msgRoomStateChange
		{
			type : eRooStateChangeType;
			roomId : number;
			personCnt : number;//删除无此字段，即内容空，勿访问
			//删除和更新无以下字段
			roomName : string;
			roomPassword : string;
			rule : string;//房间规则
		};
	};
	//游戏协议
	export namespace nGame{
		//联棋
		export namespace nLianQi{
			export enum eLianQiDirectionType{
				LIANQI_DIRECTION_TYPE_NONE = -1,//不使用禁止方向
				LIANQI_DIRECTION_TYPE_0 = 0,
				LIANQI_DIRECTION_TYPE_1 = 1,
				LIANQI_DIRECTION_TYPE_2 = 2,
				LIANQI_DIRECTION_TYPE_3 = 3,
				LIANQI_DIRECTION_TYPE_4 = 4,
				LIANQI_DIRECTION_TYPE_5 =5
			};
			export enum eGameOpRespFlag{
				SUCCESS,//成功
				SEAT_ERR,//座位号错误
				ILLEGAL,//非法落子
				INCORRECT_TURN,//非落子方
				NOT_IN_GAME,
				INCORRECT_STEP,
			};
			export enum eReqRespType{
				REQ,//向其它玩家发送
				REQ_RESP,//其它玩家的响应
				RESP,//自己收到的网络响应
			};
			export interface Skill{
				healthChange : number;
				attackChange : number;
				absorbChange : number;
				applyPosX : number;
				applyPosY : number;
				applyPosZ : number;
				basePosX : number;
				basePosY : number;
				basePosZ : number;
				type : string;
			};
			export interface Buff{
				healthChange : number;
				attackChange : number;
				absorbChange : number;
				type : string;
			};
			export interface Chess{
				health : number;
				attack : number;
				support : number;
				absorb : number;
		
				direction : number;
				playerID : number;
		
				x : number;
				y : number;
				skillList : Array<Skill>;
				buffList : Array<Buff>;
			};
			/// 联棋游戏开始 
			export interface msgLianQiStart{
				flag : number;
				firstHandSeat : number;
			};
			/// 联棋棋盘
			export interface msgLianQi{
				turn : number;//当前下棋的人的seat
				checkerBoard : Array<Chess>;
				//棋盘数据相对复杂，需要进一步确认
			};
			/// 联棋执子
			export interface msgLianQiTurn{
				seat : number;
				round : number;// 当前回合数
				isPassTurn : boolean;//是否是第一手，自动
				isTimeOut : boolean;//是否超时切换手
				lmt : Array<number>;//eLianQiDirectionType
			};
			/// 服务器对于投降的玩家自动pass，客户端需要同时修改游戏逻辑的当前玩家
			export interface msgLianQiAbandonPass{
				seat : number;
			}
			/// 联棋过
			export interface msgLianQiReqPass{
				seat : number;
			};
			export interface msgLianQiRespPass{
				flag : eGameOpRespFlag;
				turn : number;//当前手
			};
			/// 联棋投降
			export interface msgLianQiReqAbandon{
				seat : number;
			};
			export interface msgLianQiRespAbandon{
				flag : eGameOpRespFlag;
				seat : number;
			};
			/// 联棋落子
			export interface msgLianQiReqPlay{
				seat : number;
				x : number;
				y : number;
				direction : eLianQiDirectionType;
				//ect...
			};
			export interface msgLianQiRespPlay{
				flag : eGameOpRespFlag;
				seat : number;
				x : number;
				y : number;
				direction : eLianQiDirectionType;
				checkerBoard : Array<Chess>;
			};
			/// 联棋移动
			export interface msgLianQiReqMove{
				seat : number;
				x : number;
				y : number;
				direction : eLianQiDirectionType;
			};
			export interface msgLianQiRespMove{
				flag : eGameOpRespFlag;
				seat : number;
				x : number;
				y : number;
				direction : eLianQiDirectionType;
				checkerBoard : Array<Chess>;
			};
			/// 联棋请求和局
			export interface msgLianQiReqDraw{
				seat : number;
			};
			export interface msgLianQiRespDraw{
				type : eReqRespType;
				flag : number;//0 同意和局，other 不同和局
				seat : number;// 如果不同意和局，该值有效
			};
			/// 联棋结算
			export interface GameResult{
				seat : number;
				area : number;//领地
				kill : number;//消灭
				score : number;//得分
			  	multi : number;//倍率
				hasAbandon : boolean;//是否投降了
			}
			export enum eFormationType{
				//最大阵型枚举，用于分享
				FORMATION_NONE,
				FORMATION_1,
			};
			export interface msgLianQiResult{
				poolGold: number;//实际的奖池积分
				result : Array<GameResult>;
				type : Array<eFormationType>;//如果存在
				checkerBoard : Array<Chess>;
			};
			/// 各种flag，包括重连
			export enum eFlagType{
				RELINK_TYPE_BEGIN,
				RELINK_TYPE_END,
				//ect 动画
				//ect 成就
				//ect 大棋形
			};
			export interface msgLianQiFlag{
				flag : eFlagType;
			};
			/// 用于结束某个游戏步骤，比如如果有开局动画，那么在收到游戏开始后，播放动画，动画完成后，发送该消息，则服务器会接下来发送下一个步骤
			/// 再比如，如果有掷骰子，则在骰子动画结束后，发送该消息，服务器再发送谁先手落子，否则服务器会等待超时，发送谁先手
			/// 这样是为了保证消息的顺序性，不需要客户端缓存状态，避免产生错乱显示
			export enum eGameStepType{
				GAME_STEP_NONE,//空状态
				GAME_STEP_START,//对局开始
				GAME_STEP_DICE,//掷骰子
				GAME_STEP_PLAY,//落子阶段
				GAME_STEP_MOVE_OR_PASS,
				GAME_STEP_MOVE,//移动阶段
				GAME_STEP_PASS,//回合结束阶段
				GAME_STEP_ABANDON,//投降阶段
				GAME_STEP_DRAW,//请和阶段
				GAME_STEP_END//结束
			};
			export interface msgStep{
				step : eGameStepType;
				seat : number;
			}
		};
	};
}
  
  