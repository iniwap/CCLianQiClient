import { ProtocolDefine } from "../Define/ProtocolDefine";

export namespace Lobby{
    //以下定义大多与协议内容一样，但是这里是界面使用，是处理过的数据，恰好一样，并非重复定义
    export enum ePlazaLevelType{
		PLAZA_LEVEL_LOW = 1,
		PLAZA_LEVEL_MIDDLE = 2,
		PLAZA_LEVEL_HIGH = 3,
	};
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
    
    export enum eTalentType{
        TALENT_NONE,

        //base
        TALENT_A1,//资源占据：从自己所在格子获得1生命点
        TALENT_A2,//a2资源吸收：从前后未被敌人占据的格子各获得1生命点
        TALENT_A3,//a3基本攻击：面向敌人，以1点攻击力攻击前方敌人
        TALENT_B1,// b1加命：面对友军，为友军增加1生命点；
        TALENT_B2,//b2助攻：面对友军，且友军处于攻击状态，则自己的攻击力加到友军身上；备注：妨碍敌方的a2天赋可以减少敌方生命总量；背对背是天赋b5处于攻击状态= 面对敌人或面对空格

        //talent
        TALENT_B3,//b3环：己方n个棋子形成环，每个棋子增加n生命点
        TALENT_B4,// b4吸收：两个棋子相对，各具备3吸收力，能够对背后的敌人吸收最多3的攻击力；备注：经最近测试，改为3吸收力可以让吸收阵更加实用，而且也不会过于强大，不过可能导致以前设计的一些残局解法有变，一个有效的解决办法就是给以往的残局再设定天赋条件，比如每个残局都设定好了允许使用的天赋
        TALENT_B5,//b5双尖：两颗棋子背对背，各增加2攻击力；
        TALENT_C1,// c1吃子移动：己方活动时，若通过攻击干掉对方棋子，则获得1点移动能力，允许在本回合内向前移1格；
        //etc..
    };
    export enum TalentSlotState{
      TALENT_LOCK,
      TALENT_CAN_INSTALL,
      TALENT_INSTALLED,
    };
    
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
    
        public static getPlazaById(plazaID : number) : Plaza | null{
            for (var i = 0; i < LobbyData.plazaList.length; i++) {
                if (LobbyData.plazaList[i].plazaid == plazaID) {
                    return LobbyData.plazaList[i];
                }
            }
            return null;
        }
        
		public static initData() : void {
            LobbyData.plazaList = [];
            LobbyData.storeList = [];
            LobbyData.propList = [];
            LobbyData.packageList = [];
            LobbyData.privateMsgList = [];
            LobbyData.friendList = [];
            LobbyData.rankList = [];
            LobbyData.signInData = {		
                hasSigned : false,
                currentSignDay : 0,
                signInList : []
            };
            LobbyData.luckDrawData = {
                hasDrawed : false,
                luckDrawList : []
            };
		}
    };
}
