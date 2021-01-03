//
//用户数据
//

import { CommonDefine } from "../Define/CommonDefine";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { Utils } from "../Utils/Utils";
import { Lobby } from "./Lobby";

export interface NowAccount{
	area : number;
	userID : number;
	pwd : string;
	// 第三方登陆使用
	token : string;
	openid : string;
	lastLoginType : ProtocolDefine.MsgLogin.eLoginType;
};
export interface SelfData{
	userID : number;
	area : number;
	name : string;
	sex : number;
	head : string;
	gold : number;
	win : number;//赢
	lose : number;//输
	draw : number;//平－和
	escape : number;//逃跑
	talent : number;//天赋槽数
	gameTime : number;//总游戏时长
	exp : number;//经验
	roomID : number;//是否在房间中,0不在
	adult : boolean//是否成年
	charm : number;//魅力
	lastloginTime : number;//最后登陆时间
	score : number;//得分-对应段位信息，是总数字，每个段位计算得到
	diamond : number;//钻石
	energy : number;//能量

	talentList:Array<CommonDefine.eTalentType>;
};
export class Account{
	public static thirdToken : string = "";//第三方token
	public static thirdOpenID : string = ""; //第三方openid
	//
	public static thirdLoginNickName : string = "";
	public static thirdHeadUrl : string = ""; 
	public static thirdLoginSex : number = 0; 

	public static inRoomId : number = 0; 

	public static _selfData : SelfData = {
		adult : true,
		area : 0,
		charm : 0,
		diamond : 0,
		draw : 0,
		energy : 0,
		escape : 0,
		exp : 0,
		gameTime : 0,
		gold : 0,
		head : "",
		lastloginTime : 0,
		lose : 0,
		name : "",
		talent : 0,
		roomID : 0,
		score : 0,
		sex : 0,
		userID : 0,
		win : 0,
		talentList : [],
	};
	public static _nowAccount : NowAccount = {area : 0,
		lastLoginType :  ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK,
		openid : "",
		pwd : "",
		token : "",
		userID : 0
	}; 

	public static getSelfData() : SelfData{
		return Account._selfData;
	}

	public static getNowAccount() : NowAccount{
		return Account._nowAccount;
	}
	//自动登陆使用，启动后从本地读取已经存储的用户登陆信息,区服，帐号等
	public static loadNowAccout() : boolean{

		Account._nowAccount.area = Utils.getPlayerPrefs("AccountArea",0);
		Account._nowAccount.lastLoginType = Utils.getPlayerPrefs("AccountType",0) as ProtocolDefine.MsgLogin.eLoginType;
		Account._nowAccount.openid = Utils.getPlayerPrefs("AccountOpenId","");
		Account._nowAccount.pwd = Utils.getPlayerPrefs("AccountPwd","");
		Account._nowAccount.token = Utils.getPlayerPrefs("AccountToken","");
		Account._nowAccount.userID = Utils.getPlayerPrefs("AccountUserId",0);

		return Account._nowAccount.lastLoginType != ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_NONE;
	}
	public static saveNowAccount() : void{
		Utils.setPlayerPrefs("AccountArea",Account._nowAccount.area);
		Utils.setPlayerPrefs("AccountType",Account._nowAccount.lastLoginType as number);
		Utils.setPlayerPrefs("AccountOpenId",Account._nowAccount.openid);
		Utils.setPlayerPrefs("AccountPwd",Account._nowAccount.pwd);
		Utils.setPlayerPrefs("AccountToken",Account._nowAccount.token);
		Utils.setPlayerPrefs("AccountUserId",Account._nowAccount.userID);
	}
	public static onLoginSuccess(playerData : SelfData,loginBy : ProtocolDefine.MsgLogin.eLoginType) : void{
		Account._selfData = playerData;

		Account._nowAccount.area = Account._selfData.area;
		Account._nowAccount.userID = Account._selfData.userID;
		//Account._nowAccount.pwd = Account._selfData.pwd;

		Account._nowAccount.lastLoginType = loginBy;

		if (Account._nowAccount.lastLoginType == ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ
			|| Account._nowAccount.lastLoginType == ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX) {
				Account._nowAccount.token = Account.thirdToken;
				Account._nowAccount.openid = Account.thirdOpenID;
		}
		//填写now account，并保存到本地
		this.saveNowAccount();
	}
	public static updateUserGold(changeGold : number) : void{
		Account._selfData.gold += changeGold;
	}
	public static setUserGold(gold : number) : void{
		Account._selfData.gold = gold;
	}
	public static setUserDiamond(diamond : number) : void{
		Account._selfData.diamond = diamond;
	}
	public static updateUserGoldForGameResult(changeGold : number): void {
		this.updateUserGold (changeGold);
		if (changeGold > 0) {
			Account._selfData.win += 1;
		}else if(changeGold < 0){
			Account._selfData.lose += 1;
		}else{
			Account._selfData.draw += 1;
		}
	}

	public static updateUserTalent(tl : Array<Lobby.eTalentType>) : void{
		for(var i = 0;i < Account._selfData.talentList.length;i++){
			Account._selfData.talentList [i] = Lobby.eTalentType.TALENT_NONE;
		}

		for(var i = 0; i < tl.length;i++){
			Account._selfData.talentList[i] = tl[i];
		}
	}
};
