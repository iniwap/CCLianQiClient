import { ProtocolDefine } from "../Define/ProtocolDefine";

export namespace Lobby{
    //以下定义大多与协议内容一样，但是这里是界面使用，是处理过的数据，恰好一样，并非重复定义
 
    //场次配置
    export interface PlazaLevel{
        base_score : number;   // --底分
        minsr : number;      // --进入下限   
        maxsr : number;     // --进入上限
        levelid : number;     // --场等级
    }
    export interface Plaza
    {		
        lmtType : ProtocolDefine.nLobby.nPlaza.eLmtType;//限制条件类型
        plazaid : number;   // --场次id
        roomType : number;      // --底注    
        star : number;     // --进入下限
        rule : string;//配置字符串
        name : string;
        des : string;
        plazaLevel : Array<PlazaLevel>;
    };
	//商城配置
	export interface Store{
        id : number;
        point : string;//计费点
        price : number;
        name : string;
        des : string;
        pic : string;
        data : string;
    };
    export interface Prop
    {
        type : ProtocolDefine.nLobby.nProp.ePropType;
        id : number;//道具id
        price : number;//道具价格
        name : string;//道具名字
        pic : string;//道具图片
        des : string;//道具描述
        data : string;//道具属性，待定
    };
    export interface Package{
        prop : ProtocolDefine.nLobby.nProp.Prop;
        prop_cnt : number;
        end_time : number;
    };
	//个心消息
	export interface PrivateMsg{
        id : number;
        has_read : number;
        title : string;
        content : string;
        author : string;
        send_time : string;
        end_time : string;//过期时间
	};
	//系统公告
	export interface SysMsg{
		id : number;
		content : string;
	};
	//签到配置
	export interface SignIn{
		type : ProtocolDefine.nLobby.nSignInDraw.eSignInAwardType;//签到奖励类型,请根据type来决定显示的奖励
		prop : ProtocolDefine.nLobby.nProp.Prop;
		gold_num : number;
	};
	export interface SignInData{
		hasSigned : boolean;
		currentSignDay : number;
		signInList : Array<SignIn>;
	};
	//抽奖配置
	export interface LuckDraw{
		type : ProtocolDefine.nLobby.nSignInDraw.eSignInAwardType;
		prop : ProtocolDefine.nLobby.nProp.Prop;
		gold_num : number;
	};

	export interface LuckDrawData{
		hasDrawed : boolean;
		luckDrawList : Array<LuckDraw>;
	};

	export interface Friend{
        friend_id : number;
        name : string;
        head_url : string;
        lastlogin_time : string;
        des : string;
        friend_score : number;//亲密值等
	}

	//不再做分类，使用的时候查找筛选,有优化余地，to do
	export interface RankScopeType{
		scope : ProtocolDefine.nLobby.nRank.eRankScopeType;
		type : ProtocolDefine.nLobby.nRank.eRankType;
	};
	export interface Rank{
		rst : RankScopeType;
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
    export enum eAwardType
    {
        NONE,
        GOLD,
        PROP,
        //etc...
    };
    export interface EmailContent
	{
		content : string;
		hasAward : boolean;
		type : eAwardType;
		propId : number;//如果有
		awardCnt : number;
		awardIcon : string;//可以从道具列表中查到相关图标
		hasGottenAward : boolean;
	}

    export enum eSysBroadcastType{
		SYS,
		INFO,
	};
	export interface SysBroadCast
	{
		type : eSysBroadcastType;
		content : string;
		playCnt : number;
    }
    
    export class LobbyData {
        public static plazaList : Array<Plaza>;

        public static storeList : Array<Store>;
        public static propList : Array<Prop>;
        public static packageList : Array<Package>;
        public static privateMsgList : Array<PrivateMsg>;
        public static friendList : Array<Friend>;
        public static rankList : Array<Rank>;
    
        public static signInData : SignInData;
        public static luckDrawData : LuckDrawData;
    
        //动态数据
        public static initData() : void{
            LobbyData.plazaList = [];
            LobbyData.storeList= [];
            LobbyData.propList = [];
            LobbyData.packageList = [];
            LobbyData.privateMsgList = [];
            LobbyData.friendList = [];
            LobbyData.rankList = [];

            LobbyData.signInData.signInList = [];
            LobbyData.luckDrawData.luckDrawList = [];
        };
    };
}
