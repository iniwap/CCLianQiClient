// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node ,log,director} from 'cc';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { CommonDefine } from "../Define/CommonDefine";
import { Account,NowAccount,SelfData} from '../Model/Account';
import { ProtocolManager } from '../ProtocolManager/ProtocolManager';
import { AccountEvent } from '../Event/AccountEvent';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    _autoLogin : boolean = false;
    _loginType : ProtocolDefine.MsgLogin.eLoginType = ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK;

    start () {
        // Your initialization goes here.

        //原则上，需要的资源加载完成再启动链接服务器
        ProtocolManager.getInstance().start(false,
            this.OnConnectError.bind(this),
            this.OnDisconnect.bind(this),
            this.OnConnect.bind(this));
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onClickYKBtn(){
        this.onLogin(ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK);
    }

    onClickWXBtn(){
        this.onLogin(ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX);
    }

    onClickQQBtn(){
        this.onLogin(ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ);
    }

    //-----------------网络消息处理-----------------
    private OnConnect(selectSeverMode : boolean,msg : any) : void{
        if(selectSeverMode){
            //显示服务器列表
            //用户选择某个登陆
            //ProtocolManager.getInstance().SelectServer(host,port);
        }else{
            //后续 自动登录
			//第一次需要点击登录按钮
			if (this._autoLogin) {
				this._autoLogin = false;

                //重新登陆
				let nc : NowAccount = Account.getNowAccount ();
				this.loginServer (nc.userID, nc.openid, nc.pwd, nc.lastLoginType, nc.area);

			} else {
				this.showLoadingAni(false);//隐藏loading动画
			}
        }
    }

    private OnConnectError(msg : any) : void{
        log("链接失败"+msg);
    }
    private OnDisconnect(msg : any) : void{
        //log("断开链接："+msg);
        //这里需要判断是否在登陆界面，显示不同的提示
    }

	public onLogin(lt : ProtocolDefine.MsgLogin.eLoginType) : void{
		this._loginType =  lt;

		//首先获取本地保存的数据
		if (Account.loadNowAccout ()) {
			//已经登陆过
			let nc : NowAccount = Account.getNowAccount ();
			if (nc.lastLoginType == this._loginType) {

				//需要保存
				Account.thirdOpenID = nc.openid;
				Account.thirdToken = nc.token;

				//不必启动第三方
				this.loginServer (nc.userID, nc.openid, nc.pwd, nc.lastLoginType, nc.area);

				return;
			}
		}

		switch (this._loginType) {
		case ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK:
			this.loginByYK ();
			break;
		case ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX:
			this.loginByQQWX (ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX);
			break;
		case ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ:
			this.loginByQQWX (ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ);
			break;
		}
    }
    public onLogout(data : any) : void{
		//ProtocolManager.getInstance().Disconnect();//断开，即退出的时候调用

		//这个时候其实应该转到登陆界面
		//to do
	}
	public loginByQQWX(type : ProtocolDefine.MsgLogin.eLoginType ) : void{
		//这里需要回调到ui界面处理三方登陆
		//AccountEvent.EM ().InvokeEvent (AccountEvent.EVENT.THIRD_PARTY_LOGIN,(int)type);
	}
	//登陆
	public loginByYK() : void{
		this.loginServer (0,"","",ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK,1);
	}
    //-------------
    private loginServer(userId : number,openId : string,pwd : string,
        loginType : ProtocolDefine.MsgLogin.eLoginType,
        area : number) : void{

		let msg : ProtocolDefine.MsgLogin.msgLogin = {
            userID : userId,
            area : area,//用户所选服务器
            appVersion : 20001,
            channelID : 101010,
            deviceID : "deviceID1",
            ipAddr : 1111,
            loginType : loginType as ProtocolDefine.MsgLogin.eLoginType,
            netWorkType : 1,
            osVersion : 10000,
            password : pwd,
            openID : openId,
            token : "",
            nickName : "",
            head : "",
            sex : 0,
            expireTime : 0,
        };
        //.. etc.
        let json : string = JSON.stringify(msg);
        ProtocolManager.getInstance ().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_LOGIN as number, 
            JSON.parse(json), 
            this.OnLoginSuccess.bind(this));

		//显示加载，禁止点击
		this.showLoadingAni(true);
    }
	public OnLoginSuccess(msg : any) : void{
		let userData : ProtocolDefine.MsgUserData.msgUserData =  msg;//JSON.parse(msg); 
		if (userData.flag == ProtocolDefine.MsgUserData.eLoginResultFlag.LOGIN_SUCCESS) {
			//登陆成功
			let selfData : SelfData = {
                adult : userData.adult,
                area : userData.area,
                charm : userData.charm,
                diamond : userData.diamond,
                draw : userData.draw,
                energy : userData.energy,
                escape : userData.escape,
                exp : userData.exp,
                gameTime : userData.gameTime,
                gold : userData.gold,
                head : userData.head,
                lastloginTime : userData.lastlogin_time,
                lose : userData.lose,
                name : userData.name,
                talent : userData.talent,
                roomID : userData.room_id,
                score : userData.score,
                sex : userData.sex,
                userID : userData.user_id,
                win : userData.win,

                talentList : [],
            }

            let btnStateStr : string = "";
            btnStateStr = Utils.getPlayerPrefs(CommonDefine.TALENT_SLOT_STATE, "");
            if(btnStateStr === null) btnStateStr = "";

			if (btnStateStr.length != 0) {
                let btnStates : Array<string> = btnStateStr.split (',');
				for (var st in btnStates) {
					let data : Array<string> = st.split ('#');
					let ttp : CommonDefine.eTalentType = CommonDefine.eTalentType.TALENT_NONE;

					if (Number(data[2]) == CommonDefine.TalentSlotState.TALENT_INSTALLED.valueOf()) {
						//已配置
						ttp = Number(data [0] ) as CommonDefine.eTalentType;
					}

					selfData.talentList.push (ttp);
				}
			} else {
				//如果还没有配置，则默认不配
				for (var i = 0; i < CommonDefine.MAX_TALENT_CFG_NUM; i++) {
					selfData.talentList.push (CommonDefine.eTalentType.TALENT_NONE);
				}
			}

			//设置用户数据
			Account.onLoginSuccess(selfData,this._loginType);
			Account.inRoomId = userData.room_id;

			//切换界面并通知 登陆成功
			//
            director.loadScene("Lobby");

			//此处不需要传入数据，将用户数据写入account，大厅自取 其他界面如果用到也必须更新
            this.node.emit(AccountEvent.EVENT.LOGIN_SUCCESS.toString(), "");

		} else {
            //登陆失败，给予提示
            log("登陆失败，给予提示");
		}
	}
    //显示登陆loading
    public showLoadingAni(show : boolean) : void{

    }
}
