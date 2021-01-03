
import { eDialogEventType, IDialog } from "../Common/Dialog";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { CommonEvent } from "../Event/CommonEvent";
import { LobbyEvent } from "../Event/LobbyEvent";
import { Account, SelfData } from "../Model/Account";
import { Lobby } from "../Model/Lobby";
import { ProtocolManager } from "../ProtocolManager/ProtocolManager";
import { Utils } from "../Utils/Utils";

export class LobbyController{
    public static _instance : LobbyController;
    constructor() {
    }

    public static getInstance() : LobbyController{
        if(this._instance == null){
            this._instance = new LobbyController();
        }
        return this._instance;
    }

    public AddAllEvent() : void{
    		//排行榜打开游戏不会请求，需要打开界面的时候请求
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_RANK],
			this.onEventShowRank.bind(this),LobbyController);

        //领取邮件奖励，更新列表
        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL],
          this.OnEventReqUpdateEmail.bind(this),LobbyController);

        //请求反馈
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_FEEDBACK],
			this.OnRespFeedback.bind(this),LobbyController);

        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_OPEN_TALENTSLOT],
          this.onEventReqOpenTalentslot.bind(this),LobbyController);

        this.addAllProtocolEvent();
    }
    public RemoveAllEvent() : void{
    		//排行榜打开游戏不会请求，需要打开界面的时候请求
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_RANK],this.onEventShowRank.bind(this),LobbyController);

        //领取邮件奖励，更新列表
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_UPDATE_EMAIL],
          this.OnEventReqUpdateEmail.bind(this),LobbyController);

        //请求反馈
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_FEEDBACK],this.OnRespFeedback.bind(this),LobbyController);

        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.REQ_OPEN_TALENTSLOT],
          this.onEventReqOpenTalentslot.bind(this),LobbyController);

        this.removeAllProtocolEvent()
    }

    private addAllProtocolEvent() : void{
        //push消息
        ProtocolManager.getInstance().On(ProtocolDefine.LobbyProtocol.P_LOBBY_AWARD_EMAIL,
          this.OnAwardEmail.bind(this));
    }
    private removeAllProtocolEvent() : void{
        //push消息
        ProtocolManager.getInstance().Off(ProtocolDefine.LobbyProtocol.P_LOBBY_AWARD_EMAIL,
          this.OnAwardEmail.bind(this));
    }
    //--------------------------大厅相关数据----------------------
    //#region 
    public reqLobbyData() : void{
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
        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PLAZA]);
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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PACKAGE]);
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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_SYSMSG],sysMsgList);
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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PRIVATEMSG]);

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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_STORE]);
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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_SIGNIN]);

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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_LUCKDRAW]);

		Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.RECEIVE_ALL_LOBBY_DATA]);// 如果没有请求所有数据，需要在登陆成功后就调用
	}
	private OnRespSignIn(msg : any) : void{
		let resp : ProtocolDefine.nLobby.nSignInDraw.msgRespSignIn = msg;
		//to do 
	}
	private OnRespLuckDraw(msg : any) : void{
		let resp : ProtocolDefine.nLobby.nSignInDraw.msgRespLuckDraw = msg;
		//to do  
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

        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_FRIEND]);
    }
    //#endregion

    //#region 以下是界面请求数据 或者 服务器push数据
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
				this.showDialog ("您已经领取过奖励了 :)");
                return;
            } else {
                ec.hasGottenAward = true;
                psm.content = JSON.stringify(ec);
                Lobby.LobbyData.privateMsgList[find] = psm;

                // 奖励需要同时更新 用户金币以及包裹信息
                if (ec.type == Lobby.eAwardType.GOLD) {
                    Account.updateUserGold(ec.awardCnt);
                    //已经可以更新用户相关界面信息
                    Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO]);
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
        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_UPDATE_EMAIL_RESULT],resp.awardEmailId,resp.type);
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

                Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_PRIVATEMSG]);

				this.checkIfHasUnReadEmail();

			} else {
				//如果不需要添加到邮件，则仅仅弹窗提示即可
				//show dialog
			}
		}else if(ae.type == ProtocolDefine.nLobby.nSysOrPrivateMsg.eSysOrPrivateMsgType.TYPE_MSG_NOTICE){
			//系统公告性质的消息，也就是要走跑马灯
            Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_SYSMSG],ae.content);//插入显示一条系统消息
		}
    }
    
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
    
    public OnEventReqUpdateEmail(id : number,type : ProtocolDefine.nLobby.nSysOrPrivateMsg.eUpdateEmailType){
		
		let msg : ProtocolDefine.nLobby.nSysOrPrivateMsg.msgReqUpdateEmail = {
			type : type,
			awardEmailId : id
		}
		ProtocolManager.getInstance().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_UPDATE_EMAIL, 
			Utils.encodeMsg(msg), 
			this.OnRespUpdateEmail.bind(this));

		this.showLoading(true);
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
		Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_FEEDBACK],resp.type,resp.content); 
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

		//更新界面
		Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.RESP_OPEN_TALENTSLOT],resp.result);
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
			Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_RANK],rankList);
		}
	}

    //#endregion

	//#region 房间相关网络消息
	//all in =====> RoomController
	//#endregion

    //---------------------------通知更新ui----------------------
    private checkIfHasUnReadEmail() : void{
        let show : boolean = false;
		for (var i = 0; i < Lobby.LobbyData.privateMsgList.length; i++) {
			if (Lobby.LobbyData.privateMsgList [i].has_read == 0) {
				//通知显示提示标示
                show = true;
                break;
			}
		}
        
        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_HAS_NEW_EMAIL_MARK],show);
	}
	
	//最好修改为请求处显示，收到请求处隐藏
    private showLoading(show : boolean) : void{
        Utils.getGlobalController()?.Emit(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_LOADING],show);
	}
	public showDialog(tip : string){
		let dlg : IDialog = {
			type : eDialogEventType.SIMPLE,
			tip : tip,
			hasOk : false,
			okText : "确定",
			hasCancel : false,
			cancelText : "取消",
			hasClose : true,
			closeText : "确定",
			callBack : ()=>{}
		};

		Utils.getGlobalController()?.Emit(CommonEvent.EVENT[CommonEvent.EVENT.SHOW_DIALOG],dlg);
	}
    //-------------------------一些封装--------------------------
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
}