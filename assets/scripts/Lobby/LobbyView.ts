// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node, Sprite, Label, Button, instantiate, resources  as Res, SpriteFrame, assetManager} from 'cc';
import { Account,SelfData} from '../Model/Account';
import { EmailView } from './EmailView';
import { FeedbackView } from './FeedbackView';
import { RankView } from './RankView';
import { SettingView } from './SettingView';
import { ProtocolManager } from '../ProtocolManager/ProtocolManager';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { Utils } from '../Utils/Utils';
import { Lobby } from '../Model/Lobby';
import { Dialog, eDialogEventType, IDialog } from '../Common/Dialog';
import { LobbyEvent } from '../Event/LobbyEvent';
import { Lamp } from '../Common/Lamp';
import { RoomEvent } from '../Event/RoomEvent';
import { CommonDefine } from '../Define/CommonDefine';
import { StoreView } from './StoreView';
import { FriendView } from './FriendView';
import { PackageView } from './PackageView';
import { PlazaRoomView } from './PlazaRoomView';
import { TalentView } from './TalentView';
import { NetwokState } from '../Utils/NetwokState';

const { ccclass, property } = _decorator;

enum eRoomClassicType{
    MODE_2_4,//
    MODE_2_6,
    MODE_4_6,
}

@ccclass('LobbyView')
export class LobbyView extends NetwokState {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
	// serializableDummy = 0;

	//#region --ui元素定义，折叠
    @property(Sprite)
    public UserHead : Sprite = null;

    @property(Label)
    public UserName : Label = null;

    @property(Label)
    public UserGold : Label = null;

    @property(Label)
    public UserDiamond : Label = null;

    //
    @property(Label)
    public CurrentMode : Label = null;
    @property(Label)
    public UpMode : Label = null;
    @property(Label)
    public DownMode : Label = null;

    @property(Sprite)
    public HasMsg : Sprite = null;
    @property(Sprite)
    public HasFeedback : Sprite = null;

    //all popup 
    @property(EmailView)
    public Email : EmailView = null;
    
    @property(FeedbackView)
    public Feedback : FeedbackView = null;
    
    @property(RankView)
    public Rank : RankView = null;
    
    @property(SettingView)
	public Setting : SettingView = null;
	
	@property(StoreView)
	public Store : StoreView = null;
	
	@property(FriendView)
	public Friend : FriendView = null;

	@property(PackageView)
	public Package : PackageView = null;
	
	@property(PlazaRoomView)
	public PlazaRoom : PlazaRoomView = null;

	@property(TalentView)
	public Talent : TalentView = null;

    @property(Button)
    public UpBtn : Button = null;
    
    @property(Button)
    public DownBtn : Button = null;
	//#endregion
	
	private _currentType : eRoomClassicType = eRoomClassicType.MODE_2_4; 
    
    start () {
		// Your initialization goes here.
    }

    onLoad(){
        this.checkIsStartLogin();
	}
	//may be in start?
	onEnable(){
		super.onEnable();
		this.addAllEvent();
	}
	onDisable(){
		super.onDisable();
		this.removeAllEvent();
	}
	//#region ---事件监听
	private addAllEvent() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_RANK];//排行榜打开游戏不会请求，需要打开界面的时候请求
		Utils.getGlobalController()?.On(e,this.onEventShowRank.bind(this));

		//push消息
		let e2 : string = ProtocolDefine.LobbyProtocol[ProtocolDefine.LobbyProtocol.P_LOBBY_AWARD_EMAIL];
		ProtocolManager.getInstance().on(e2,this.OnAwardEmail.bind(this));

		let e3 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL];//领取邮件奖励，更新列表
		Utils.getGlobalController()?.On(e3,this.OnEventReqUpdateEmail.bind(this));

		let e4 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_FEEDBACK];//请求反馈
		Utils.getGlobalController()?.On(e4,this.OnRespFeedback.bind(this));

		let e5 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_OPEN_TALENTSLOT];//请求反馈
		Utils.getGlobalController()?.On(e5,this.onEventReqOpenTalentslot.bind(this));
	}
	private removeAllEvent() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_RANK];
		Utils.getGlobalController()?.Off(e,this.onEventShowRank.bind(this));

		let e2 : string = ProtocolDefine.LobbyProtocol[ProtocolDefine.LobbyProtocol.P_LOBBY_AWARD_EMAIL];
		ProtocolManager.getInstance().off(e2);

		let e3 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL];//领取邮件奖励，更新列表
		Utils.getGlobalController()?.Off(e3,this.OnEventReqUpdateEmail.bind(this));

		let e4 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_FEEDBACK];//请求反馈
		Utils.getGlobalController()?.Off(e4,this.OnRespFeedback.bind(this));

		let e5 : string = LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_OPEN_TALENTSLOT];//请求反馈
		Utils.getGlobalController()?.Off(e5,this.onEventReqOpenTalentslot.bind(this));

	}
	//#endregion

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    //登陆成功，请求用户数据，更新用户信息
    public onLoginSuccess(arg0 : any = undefined,arg1 : any = undefined) : void{
		//此时需要加载动画，大厅界面不可点击，数据全部收到或者部分收到时，可以点击。
		this.updateUserInfo();
		//是否请求其他数据??
		//this.reqLobyyData();
    }

    private checkIsStartLogin() : void{
		this.onLoginSuccess();
		if(Utils.getGlobalController()?.CheckIsStartLoginSuccess()){
			this.reqLobyyData();
		}
    }
    private reqLobyyData() : void{
        let self : SelfData = Account.getSelfData();
		//为了节省服务器压力，以下数据后续需要实现md5方式请求，如果数据未发生变动，则不需要请求。to do
		//请求大厅数据
		let plaza : ProtocolDefine.nLobby.nPlaza.msgReqPlazaList = {game : ProtocolDefine.GameType.GAME_LIANQI}
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_PLAZA_LIST, 
            Utils.encodeMsg(plaza), 
            this.OnRespPlazaList.bind(this));

        let prop : ProtocolDefine.nLobby.nProp.msgReqPropList = {game : ProtocolDefine.GameType.GAME_LIANQI}
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_PROP_LIST, 
            Utils.encodeMsg(prop), 
            this.OnRespPropList.bind(this));

        let pkg : ProtocolDefine.nLobby.nPackage.msgReqPackageList = {game : ProtocolDefine.GameType.GAME_LIANQI}
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_PACKAGE_LIST, 
            Utils.encodeMsg(pkg), 
            this.OnRespPackageList.bind(this));

        let sysmsg : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgReqSysMsgList = {game : ProtocolDefine.GameType.GAME_LIANQI,
            channelID : ProtocolDefine.ChannelType.CHANNEL_APPSTORE}
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_SYSMSG, 
            Utils.encodeMsg(sysmsg), 
            this.OnRespSysMsgList.bind(this));

        let primsg : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgReqPrivateMsgList = {game : ProtocolDefine.GameType.GAME_LIANQI,
            begin : 0,cnt : 20}
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_PRIVATEMSG, 
            Utils.encodeMsg(primsg), 
            this.OnRespPrivateMsgList.bind(this)); 

        let store : ProtocolDefine.nLobby.nStore.msgReqStoreList = {game : ProtocolDefine.GameType.GAME_LIANQI,
            channelID : ProtocolDefine.ChannelType.CHANNEL_APPSTORE};
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_STORE_LIST, 
            Utils.encodeMsg(store), 
            this.OnRespStoreList.bind(this)); 
            
        let friend : ProtocolDefine.nLobby.nFriend.msgReqFriendList = {game : ProtocolDefine.GameType.GAME_LIANQI};
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_FRIEND_LIST, 
            Utils.encodeMsg(friend), 
            this.OnRespFriendList.bind(this));

		/////新增 2017－04－05
        //请求签到和抽奖数据
        let sild : ProtocolDefine.nLobby.nSignInDraw.msgReqSignInLuckDrawData = {game : ProtocolDefine.GameType.GAME_LIANQI,
            areaID : self.area,
            deviceID : "deviceID"};
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_SIGNIN_LUCKDRAW_DATA, 
            Utils.encodeMsg(sild), 
            this.OnRespSignInLuckDrawList.bind(this));

        //请求签到
        let signin : ProtocolDefine.nLobby.nSignInDraw.msgReqSignIn = {game : ProtocolDefine.GameType.GAME_LIANQI,
            areaID : self.area,
            deviceID : "deviceID"};
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_SIGNIN, 
            Utils.encodeMsg(signin), 
            this.OnRespSignIn.bind(this));


        //请求抽奖
        let luckdraw : ProtocolDefine.nLobby.nSignInDraw.msgReqLuckDraw = {game : ProtocolDefine.GameType.GAME_LIANQI,
            areaID : self.area,
            deviceID : "deviceID"};
        ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_LUCKDRAW, 
            Utils.encodeMsg(luckdraw), 
            this.OnRespLuckDraw.bind(this));
    }

    private OnRespPlazaList(msg : any) : void{
		//
		let plazaList : ProtocolDefine.nLobby.nPlaza.msgRespPlazaList = msg;

		Lobby.LobbyData.plazaList = [];//首先清空
		// 转换存数据
		for (var i = 0; i < plazaList.plazaList.length; i++) {
			let plazaLevel : Array<Lobby.PlazaLevel> = [];
			for (var j = 0; j < plazaList.plazaList [i].levelList.length; j++) {
				let pl : Lobby.PlazaLevel = {
					base_score : plazaList.plazaList [i].levelList[j].base_score,
					levelid : plazaList.plazaList [i].levelList[j].levelid,
					minsr : plazaList.plazaList [i].levelList[j].minsr,
					maxsr : plazaList.plazaList [i].levelList[j].maxsr,
				}
				plazaLevel.push(pl);
			}

			let plaza : Lobby.Plaza = {
				lmtType : plazaList.plazaList[i].lmt_type,
				des : plazaList.plazaList[i].des,
				star : plazaList.plazaList[i].star,
				name : plazaList.plazaList[i].name,
				plazaid : plazaList.plazaList[i].plazaid,
				rule : plazaList.plazaList[i].rule,
				roomType : plazaList.plazaList[i].room_type,
				plazaLevel : plazaLevel,
			}

			Lobby.LobbyData.plazaList.push(plaza);
		}
		//刷新界面
		this.updatePlaza();
	}
	private OnRespPropList(msg : any) : void{
		//
		let propList : ProtocolDefine.nLobby.nProp.msgRespPropList = msg;
		Lobby.LobbyData.propList = [];//首先清空
		for (var i = 0; i < propList.propList.length; i++) {
			let prop : Lobby.Prop = {
				data : propList.propList [i].data,
				des : propList.propList [i].des,
				id : propList.propList [i].id,
				name : propList.propList [i].name,
				pic : propList.propList [i].pic,
				price : propList.propList [i].price,
				type : propList.propList [i].type,
			}
			Lobby.LobbyData.propList.push(prop);
		}
	}
	private OnRespPackageList(msg : any) : void{
		//
		let packageList : ProtocolDefine.nLobby.nPackage.msgRespPackageList = msg;

		if(packageList.packageList == null){
			return;
		}

		Lobby.LobbyData.packageList = [];//首先清空

		for (var i = 0; i < packageList.packageList.length; i++) {
			let prop : Lobby.Prop = this.getProp(packageList.packageList [i].prop_id)[1];
			let pk : Lobby.Package = {
				end_time : packageList.packageList[i].end_time,
				prop_cnt : packageList.packageList[i].prop_cnt,
				prop : prop,
			}

			Lobby.LobbyData.packageList.push(pk);
		}

		this.updatePackage();
	}
	private OnRespSysMsgList(msg : any) : void{
		//
		let sml : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgRespSysMsgList = msg;
		let sysMsgList : Array<Lobby.SysMsg> = [];
		for (var i = 0; i < sml.sysMsgList.length; i++) {
			let sm : Lobby.SysMsg = {
				content : sml.sysMsgList [i].content,
				id : sml.sysMsgList [i].id,
			}
			sysMsgList.push(sm);
		}

		this.updateSysMsg(sysMsgList);
	}
	private OnRespPrivateMsgList(msg : any) : void{
		//
		let privateMsgList : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgRespPrivateMsgList = msg;
		Lobby.LobbyData.privateMsgList = [];//首先清空

		for (var i = 0; i < privateMsgList.privateMsgList.length; i++) {
			let psm : Lobby.PrivateMsg = {
				author : privateMsgList.privateMsgList[i].author,
				content : privateMsgList.privateMsgList[i].content,
				end_time : privateMsgList.privateMsgList[i].end_time,
				has_read : privateMsgList.privateMsgList[i].has_read,
				id : privateMsgList.privateMsgList[i].id,
				send_time : privateMsgList.privateMsgList[i].send_time,
				title : privateMsgList.privateMsgList[i].title,
			}
			Lobby.LobbyData.privateMsgList.push(psm);
		}

		//此时不显示界面
		this.updatePrivateMsg();

		this.checkIfHasUnReadEmail();
	}
	private OnRespStoreList(msg : any) : void{
		//
		let storeList : ProtocolDefine.nLobby.nStore.msgRespStoreList = msg;
		Lobby.LobbyData.storeList = [];//首先清空

		for (var i = 0; i < storeList.storeList.length; i++) {
			let store : Lobby.Store = {
				data : storeList.storeList[i].data,
				des : storeList.storeList[i].des,
				id : storeList.storeList[i].id,
				name : storeList.storeList[i].name,
				pic : storeList.storeList[i].pic,
				point : storeList.storeList[i].point,
				price : storeList.storeList[i].price,
			}
			Lobby.LobbyData.storeList.push(store);
		}

		this.updateStore();
	}

	private OnRespSignInLuckDrawList(msg : any) : void{
		let resp : ProtocolDefine.nLobby.nSignInDraw.msgRespSignInLuckDrawData = msg;

		let signInList : Array<Lobby.SignIn> = [];
		for (var i = 0; i < resp.signData.length; i++) {
			let prop : Lobby.Prop = this.getProp(resp.signData [i].prop_id)[1];
			let sn : Lobby.SignIn = {
				gold_num : resp.signData [i].gold_num,
				prop : prop,
				type : resp.signData[i].type,
			}
			signInList.push(sn);
		}

		Lobby.LobbyData.signInData = {
			hasSigned : resp.hasSigned,
			currentSignDay : resp.signInDay,
			signInList : signInList
		};

		this.updateSignIn();

		let luckDrawList : Array<Lobby.LuckDraw> = [];
		for (var i = 0; i < resp.luckData.length; i++) {
			let prop : Lobby.Prop = this.getProp(resp.luckData [i].prop_id)[1];
			let ld : Lobby.LuckDraw = {
				gold_num : resp.luckData[i].gold_num,
				prop : prop,
				type : resp.luckData[i].type,
			}
			luckDrawList.push(ld);
		}

		Lobby.LobbyData.luckDrawData = {
			hasDrawed : resp.hasDrawed,
			luckDrawList : luckDrawList
		};

		this.updateLuckDraw ();

		if (Account.inRoomId == 0) {
			//这里假设这是最后一条收到，可以隐藏loading
			this.showLoading(false);
		} else {
			//自动请求进入房间
			let data : RoomEvent.JoinRoom= {
				playerNum : 0,
				gridLevel : 0,
				plazaID : 0,
				pwd : "",
				roomId : Account.inRoomId,
				tagId : -1,
				plazaName : ""
			}

			let e : string = RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM];
			Utils.getGlobalController()?.Emit(e,data);
		}
	}
	private OnRespSignIn(msg : any) : void{
		let resp : ProtocolDefine.nLobby.nSignInDraw.msgRespSignIn = msg;
		//to do 
	}
	private OnRespLuckDraw(msg : any) : void{
		let resp : ProtocolDefine.nLobby.nSignInDraw.msgRespLuckDraw = msg;
		//to do  
	}

	//以下消息类似
	private OnRespRankList(msg : any) : void{
		this.showLoading(false);
		
		let rankList : ProtocolDefine.nLobby.nRank.msgRespRankList = msg;
		Lobby.LobbyData.rankList = [];//首先清空

		//此条有较大问题，后续优化
		for (var i = 0; i < rankList.rankList.length; i++) {
			let rst : Lobby.RankScopeType = {
				scope : rankList.scope,
				type : rankList.type,
			};
			let rk : Lobby.Rank = {
				headUrl : rankList.rankList[i].headUrl,
				exp : rankList.rankList[i].exp,
				name : rankList.rankList[i].name,
				score : rankList.rankList[i].score,
				userID : rankList.rankList[i].userID,
				charm : rankList.rankList [i].charm,
				diamond : rankList.rankList [i].diamond,
				gold : rankList.rankList [i].gold,
				win_rate : rankList.rankList [i].win_rate,
				rst : rst,
			}
			Lobby.LobbyData.rankList.push(rk);
		}

		//由于这个消息的特殊性，可以不在此处刷新，需要的展示界面的时候再请求，刷新
		this.onEventShowRank (rankList.scope,rankList.type);//此为默认显示的榜单
	}
	private OnRespFriendList(msg : any) : void{
		//
		let resp : ProtocolDefine.nLobby.nFriend.msgRespFriendList = msg;
		if(resp.friendList == null) {
			//console.log("没有好友");
			return;
		}

		Lobby.LobbyData.friendList = [];//首先清空

		for (var i = 0; i < resp.friendList.length; i++) {
			let fd : Lobby.Friend = {
				des : resp.friendList [i].des,
				friend_id : resp.friendList [i].friend_id,
				friend_score : resp.friendList [i].friend_score,
				head_url : resp.friendList [i].head_url,
				lastlogin_time : resp.friendList [i].lastlogin_time,
				name : resp.friendList [i].name,
			}
			Lobby.LobbyData.friendList.push(fd);
		}

		this.updateFriend();
	}
	private OnAwardEmail(msg : any) : void{
		let ae : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgAwardEmail = msg;
		//
		if(ae.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eSysOrPrivateMsgType.TYPE_MSG_PRIVATE){
			//个人消息，这种是私人消息，比如队伍之间，非系统下发
			//待完成
		}else if(ae.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eSysOrPrivateMsgType.TYPE_MSG_SYS){
			//系统下发消息，多是奖励信息，如果有必要则添加到邮件
			if (ae.needAdd2Email) {
				let psm : Lobby.PrivateMsg = {
					author : ae.author,
					content : ae.content,
					end_time : ae.end_time,
					has_read : ae.has_read,
					id : ae.id,
					send_time : ae.send_time,
					title : ae.title,
				}
				Lobby.LobbyData.privateMsgList.splice(0,0,psm);

				this.updatePrivateMsg();

				this.checkIfHasUnReadEmail();

			} else {
				//如果不需要添加到邮件，则仅仅弹窗提示即可
				//show dialog
			}
		}else if(ae.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eSysOrPrivateMsgType.TYPE_MSG_NOTICE){
			//系统公告性质的消息，也就是要走跑马灯
			this.showSysMsg(ae.content);
		}
	}
	public OnEventReqUpdateEmail(type : ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType,id : number){
		
		let msg : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgReqUpdateEmail = {
			type : type,
			awardEmailId : id
		}
		ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_UPDATE_EMAIL, 
			Utils.encodeMsg(msg), 
			this.OnRespUpdateEmail.bind(this));

		this.showLoading(true);
	}

	private  OnRespUpdateEmail(msg : any) : void{

		this.showLoading(false);
		let resp : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgReqUpdateEmail = msg;
		let find = -1;
		for (var i = 0; i < Lobby.LobbyData.privateMsgList.length; i++) {
			if (Lobby.LobbyData.privateMsgList [i].id == resp.awardEmailId) {
				find = i;
				break;
			}
		}
		if (find == -1) {
			//邮件不存在
			return;
		}
		let psm : Lobby.PrivateMsg = {
			author: Lobby.LobbyData.privateMsgList[find].author,
			content: Lobby.LobbyData.privateMsgList[find].content,
			end_time : Lobby.LobbyData.privateMsgList [find].end_time,
			has_read : Lobby.LobbyData.privateMsgList [find].has_read,
			id : Lobby.LobbyData.privateMsgList [find].id,
			send_time : Lobby.LobbyData.privateMsgList [find].send_time,
			title : Lobby.LobbyData.privateMsgList [find].title,
		};
		if (resp.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.READ) {
			//更新邮件缓存列表
			psm.has_read = 1;
			Lobby.LobbyData.privateMsgList [find] = psm;

			this.checkIfHasUnReadEmail ();

		} else if (resp.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.DEL) {
			//删除
			Lobby.LobbyData.privateMsgList.splice(find,1);

			this.checkIfHasUnReadEmail ();

		} else if (resp.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType.GET_AWARD) {
			let ec : Lobby.EmailContent = JSON.parse(Lobby.LobbyData.privateMsgList[find].content);

			if (ec.hasGottenAward) {
				//已经领取过奖励了
				this.showDialog ("温馨提示","您已经领取过奖励了 :)");
				return;
			} else {
				ec.hasGottenAward = true;
				psm.content = JSON.stringify(ec);
				Lobby.LobbyData.privateMsgList[find] = psm;

				// 奖励需要同时更新 用户金币以及包裹信息
				if (ec.type == Lobby.eAwardType.GOLD) {
					Account.updateUserGold(ec.awardCnt);
					//已经可以更新用户相关界面信息
					this.updateUserInfo();
				} else if (ec.type == Lobby.eAwardType.PROP) {
					//重新请求一遍
					let pkg : ProtocolDefine.nLobby.nPackage.msgReqPackageList = {game : ProtocolDefine.GameType.GAME_LIANQI}
					ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_PACKAGE_LIST, 
						Utils.encodeMsg(pkg), 
						this.OnRespPackageList.bind(this));
				}
			}
		}

		//to do  更新邮件界面 
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_UPDATE_EMAIL_RESULT];
		Utils.getGlobalController()?.Emit(e,resp.awardEmailId,resp.type);
	}

	public onEventReqFeedback(type : ProtocolDefine.nLobby.nFeedback.eFeedbackType,content : string){
		let msg : ProtocolDefine.nLobby.nFeedback.msgReqFeedback = {
			type : type,
			content : content
		}
		ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_FEEDBACK,
			Utils.encodeMsg(msg), this.OnRespFeedback.bind(this));

		this.showLoading(true);
	}
	private OnRespFeedback(msg : any) : void{
		this.showLoading(false);
		let resp : ProtocolDefine.nLobby.nFeedback.msgReqFeedback = msg;
		if (resp.type == ProtocolDefine.nLobby.nFeedback.eFeedbackType.DANMU) {
			//显示弹幕
		}else{
			this.showDialog ("温馨提示",resp.content);
		}
	}

	public onEventReqOpenTalentslot(type : ProtocolDefine.nLobby.nTalent.eOpenByType,arg1 : any = undefined){
		//需要判断是否有足够的金币或者钻石开槽，避免多余的网络请求
		let msg : ProtocolDefine.nLobby.nTalent.msgReqOpenTalentslot = {
			game : ProtocolDefine.GameType.GAME_LIANQI,
			openBy : type
		}
		ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_OPENTALENTSLOT,
			Utils.encodeMsg(msg), this.OnRespOpenTalentslot.bind(this));

		this.showLoading(true);
	}
	private OnRespOpenTalentslot(msg : any) : void{
		this.showLoading(false);

		let resp : ProtocolDefine.nLobby.nTalent.msgRespOpenTalentslot = msg;
		if (resp.result == ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_SUCCESS) {
			//开槽成功
			//refresh ui
			//CommonUtil.Util.showDialog ("温馨提示","开槽成功，当前槽数为："+resp.currentOpenedCnt);

			Account.setUserGold (resp.currentGold);
			Account.setUserDiamond (resp.currentDiamond);
			//更新界面
			let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_OPEN_TALENTSLOT];
			Utils.getGlobalController()?.Emit(e,resp);

		}else if(resp.result == ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_LESS_DIAMOND){
			this.showDialog ("温馨提示","开槽失败，您的晶核不足，请充值");
		}else if(resp.result == ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_LESS_GOLG){
			this.showDialog ("温馨提示","开槽失败，您的金币不足，请充值");
		}else if(resp.result == ProtocolDefine.nLobby.nTalent.eOpenTalentslotResultType.OPEN_FAIL_MAX_SLOT){
			this.showDialog ("温馨提示","您的天赋槽已全部打开！");
		}
	}
	//-------------------------一些封装----------------------------------

	private getProp(propID : number) : [boolean,Lobby.Prop]{
		let prop : Lobby.Prop = {
			data : "",
			des : "",
			id : 0,
			name : "",
			pic : "",
			price : 0,
			type : ProtocolDefine.nLobby.nProp.ePropType.NONE,
		}

		for(var j = 0;j < Lobby.LobbyData.propList.length;j++){
			if (propID == Lobby.LobbyData.propList [j].id) {
				prop = {
					data : Lobby.LobbyData.propList [j].data,
					des : Lobby.LobbyData.propList [j].des,
					id : Lobby.LobbyData.propList [j].id,
					name : Lobby.LobbyData.propList [j].name,
					pic : Lobby.LobbyData.propList [j].pic,
					price : Lobby.LobbyData.propList [j].price,
					type : Lobby.LobbyData.propList [j].type,
				}
				return [true,prop];
			} else {
				//此时可能是背包数据先到，道具数据没有收到还，此类情况基本不可能出现
				//后续做容错处理
			}
		}
		return [false,prop];
	}

	//-------------------------UI操作-------------------------------------
	public updateUserInfo() : void{
		let self : SelfData = Account.getSelfData();
		// 刷新所有用户相关的信息
		//比如金币显示，昵称，头像等等
		//设置头像
		if (self.head.search("http") != -1) {
			// //创建目录
			// if (!Directory.Exists(CommonUtil.Util.IMAGE_CACHE_PATH))  
			// {  
			// 	Directory.CreateDirectory(CommonUtil.Util.IMAGE_CACHE_PATH);  
			// }

			// //判断头像是否存在
			// if (!File.Exists (CommonUtil.Util.IMAGE_CACHE_PATH + self.head.GetHashCode ())) {  
			// 	//如果之前不存在缓存文件  
			// 	StartCoroutine (DownloadImage (self.head, _userHead));  
			// } else {
			// 	StartCoroutine(LoadLocalImage(self.head, _userHead));
			// }
			
			assetManager.loadRemote(self.head,  (err, texture) => {
				// Use texture to create sprite frame
				if(texture){
					//let spriteFrame : SpriteFrame = new SpriteFrame(texture);
					//this.UserHead.spriteFrame = spriteFrame;
				}
			});
		} else {
			Res.load(CommonDefine.ResPath.HEAD + self.head, SpriteFrame,  (err, spriteFrame) => {
				if(spriteFrame){
					this.UserHead.spriteFrame = spriteFrame;
				}
			});
		}

		this.UserName.string = self.name;
		this.UserGold.string = self.gold.toString();
		this.UserDiamond.string = self.diamond.toString();

		//更新其他界面用户信息
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO];
        Utils.getGlobalController()?.Emit(e);
	}
	public updatePlaza() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PLAZA];
        Utils.getGlobalController()?.Emit(e);
	}
	public updatePackage() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PACKAGE];// to do
        Utils.getGlobalController()?.Emit(e);
	}

	@property(Lamp)
	public SysLamp : Lamp = null;
	public updateSysMsg(sysMsgList : Array<Lobby.SysMsg>) : void{
		// let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_SYSMSG];// to do
		// Utils.getGlobalController()?.Emit(e);
		
		if (sysMsgList.length == 0) {
			this.SysLamp.node.active = false;
		} else {
			this.SysLamp.node.active = true;
			this.SysLamp.resetLamp ();
			for (var i = 0; i < sysMsgList.length; i++) {
				let lamp : Lobby.SysBroadCast = JSON.parse(sysMsgList[i].content);
				this.SysLamp.addLamp (lamp);//这里原则上也可以实现内容携带其他信息，诸如图标

				this.SysLamp.showLampById(0);
			}
		}
	}
	private updatePrivateMsg() : void{
		if (Lobby.LobbyData.privateMsgList.length != 0) {
			//此处把系统公告也插进去
			let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PRIVATEMSG];// to do
			Utils.getGlobalController()?.Emit(e);
		} else{
			//没有，重新获取

			// let primsg : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgReqPrivateMsgList = {game : ProtocolDefine.GameType.GAME_LIANQI,
			// 	begin : 0,cnt : 20}
			// ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_PRIVATEMSG, 
			// 	Utils.encodeMsg(primsg), 
			// 	this.OnRespPrivateMsgList.bind(this)); 
		}
	}
	private updateStore() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_STORE];// to do
        Utils.getGlobalController()?.Emit(e);
	}
	private updateSignIn() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_SIGNIN];// to do
        Utils.getGlobalController()?.Emit(e);
	}
	private updateLuckDraw() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_LUCKDRAW];// to do
        Utils.getGlobalController()?.Emit(e);
	}
	private onEventShowRank(sc : ProtocolDefine.nLobby.nRank.eRankScopeType,
		t : ProtocolDefine.nLobby.nRank.eRankType) : void{

		let rankList : Array<Lobby.Rank> = [];
		for (var i = 0; i < Lobby.LobbyData.rankList.length; i++) {
			if (t == Lobby.LobbyData.rankList[i].rst.type
				&& sc == Lobby.LobbyData.rankList[i].rst.scope) {
				rankList.push(Lobby.LobbyData.rankList [i]);
			}
		}

		if (rankList.length == 0) {
			//说明还没有请求过，刷新一次
			let rank : ProtocolDefine.nLobby.nRank.msgReqRankList = {game : ProtocolDefine.GameType.GAME_LIANQI,
				areaID: Account.getSelfData().area,
				rankNum : 50,// 只取前50
				scope : sc,//区排行
				type : t//财富排行
			};
			ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_RANK_LIST, 
				Utils.encodeMsg(rank), 
				this.OnRespRankList.bind(this));

			this.showLoading(true);

		} else {
			let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_RANK];// to do
			Utils.getGlobalController()?.Emit(e,rankList);
		}
	}

	private updateFriend() : void{
		let e : string = LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_FRIEND];// to do
        Utils.getGlobalController()?.Emit(e);
	}
	
	//UPDATE_SYSMSG
	private checkIfHasUnReadEmail() : void{
		for (var i = 0; i < Lobby.LobbyData.privateMsgList.length; i++) {
			if (Lobby.LobbyData.privateMsgList [i].has_read == 0) {
				//通知显示提示标示
				this.HasMsg.node.active = true;
				return;
			}
		}
		this.HasMsg.node.active = false;
	}

	private showSysMsg(content : string) : void{
		this.SysLamp.node.active = true;

		let lamp : Lobby.SysBroadCast = JSON.parse(content);
		this.SysLamp.addLamp (lamp);//这里原则上也可以实现内容携带其他信息，诸如图标

		this.SysLamp.showLampById (this.SysLamp.getTotal() - 1);

	}

	public showDialog(title : string,content : string ,
		okText : string = "确定",cancelText : string = "取消",closeText : string = "取消") : void{

		let node : Node = instantiate(this.DialogPrefab);
        node.parent = this.node.parent;
        node.setPosition(0, 0);
        //show dialog
        let dlg : Dialog = node.getComponent("Dialog") as Dialog;
        let iDlg : IDialog = {
            type : eDialogEventType.SIMPLE,
            tip : content,
			hasOk : false,
			okText : okText,
			hasCancel : false,
			cancelText : cancelText,
			hasClose : true,
			closeText : closeText,
            callBack : ()=> {},
        };
        dlg.ShowDialog(true,iDlg);
	}

	//-----------------------
	//模式切换
	public OnClickChangeMode(event : any,up : string) : void{
		console.log("OnClickChangeMode:"+up);
		if (up == "1") {
			if (this._currentType == RoomEvent.eRoomClassicType.MODE_2_4) {

				this.CurrentMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,6);
				this._currentType = RoomEvent.eRoomClassicType.MODE_2_6;

				this.UpBtn.interactable = false;
				this.DownBtn.interactable = true;

				this.DownMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,4);
			} else if (this._currentType == RoomEvent.eRoomClassicType.MODE_4_6) {
				this.UpBtn.interactable = true;
				this.DownBtn.interactable = true;

				this.CurrentMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,4);
				this._currentType = RoomEvent.eRoomClassicType.MODE_2_4;

				this.UpMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,6);
				this.DownMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,4,6);
			}
		} else {
			if (this._currentType == RoomEvent.eRoomClassicType.MODE_2_4) {

				this.CurrentMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,4,6);
				this._currentType = RoomEvent.eRoomClassicType.MODE_4_6;

				this.UpBtn.interactable = true;
				this.DownBtn.interactable = false;

				this.UpMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,4);
			} else if (this._currentType == RoomEvent.eRoomClassicType.MODE_2_6) {
				this.UpBtn.interactable = true;
				this.DownBtn.interactable = true;

				this.CurrentMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,4);
				this._currentType = RoomEvent.eRoomClassicType.MODE_2_4;

				this.UpMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,2,6);
				this.DownMode.string = Utils.getModeStr (ProtocolDefine.nRoom.eCreateRoomType.ROOM_CLASSIC_PLAZA,4,6);
			}
		}
	}
	//快速开始
	public OnClickJoinRoom() : void{
		//请根据界面结果填写
		let pn : number = 2;
		let gl : number = 4;

		if (this._currentType == RoomEvent.eRoomClassicType.MODE_2_4) {
			pn = 2;
			gl = 4;
		}else if (this._currentType == RoomEvent.eRoomClassicType.MODE_2_6) {
			pn = 2;
			gl = 6;
		}else if (this._currentType == RoomEvent.eRoomClassicType.MODE_4_6) {
			pn = 4;
			gl = 6;
		}

		let data : RoomEvent.JoinRoom = {
			playerNum : pn,
			gridLevel : gl,
			plazaID : 0,//c填写
			pwd : "",
			roomId : 0,
			plazaName : "",
			tagId : 0
		}

		let e : string = RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM];
		Utils.getGlobalController()?.Emit(e,data);
	}

	public OnClickOfflineModeBtn() : void{
		//切换到单机界面
	}
	public OnClickOnlineModeBtn() : void{
		//切换到plaza room 界面
		this.node.active = false;
		this.PlazaRoom.node.active = true;
	}
}
