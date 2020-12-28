// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component ,log, game} from 'cc';
import { Utils } from './Utils';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { CommonDefine } from "../Define/CommonDefine";
import { Account,NowAccount,SelfData} from '../Model/Account';
import { ProtocolManager } from '../ProtocolManager/ProtocolManager';
import { AccountEvent } from '../Event/AccountEvent';
const { ccclass, property } = _decorator;

@ccclass('GlobalController')
export class GlobalController extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    _autoLogin : boolean = false;
    _loginType : ProtocolDefine.MsgLogin.eLoginType = ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK;

    //@property
    _isStartLogin : boolean = true;
  
    // @property
    // get isStartLoginSuccess () : boolean {
    //     return this._isStartLogin;
    // }
    
    // set isStartLoginSuccess (value) {
    //     this._isStartLogin = value;
    // }

    start () {
        // Your initialization goes here.
        //原则上，需要的资源加载完成再启动链接服务器
        ProtocolManager.getInstance().start(false,
                this.OnConnectError.bind(this),
                this.OnDisconnect.bind(this),
                this.OnConnect.bind(this));

        let er : string = AccountEvent.EVENT[AccountEvent.EVENT.RELOGIN];
        this.On(er,this.OnReLogin.bind(this));
        let el : string = AccountEvent.EVENT[AccountEvent.EVENT.LOGIN];
        this.On(el,this.OnLogin.bind(this));
    }

    onLoad(){
        game.addPersistRootNode(this.node);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    //-----------------网络消息处理-----------------
    private OnConnect(selectSeverMode : boolean,msg : any) : void{
        let e : string = AccountEvent.EVENT[AccountEvent.EVENT.CONNECT_SERVER];
        if(selectSeverMode){
            this.Emit(e,selectSeverMode,msg);
            //后续用户选择某个登陆
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
				this.Emit(e,selectSeverMode,msg);//隐藏loading动画，不是自动登陆，需要点击
			}
        }
    }

    private OnConnectError(msg : any) : void{
        let e : string = AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_ERROR];
        this.Emit(e,msg);
    }
    private OnDisconnect(msg : any) : void{
        let e : string = AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_DISCONNECT];
        this.Emit(e,msg);
    }

	public OnLogin(lt : ProtocolDefine.MsgLogin.eLoginType,arg0 : any) : void{
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
    public OnLogout(data : any) : void{
		//ProtocolManager.getInstance().Disconnect();//断开，即退出的时候调用

		//这个时候其实应该转到登陆界面
		//to do
	}
	public loginByQQWX(type : ProtocolDefine.MsgLogin.eLoginType ) : void{
		//这里需要回调到ui界面处理三方登陆
        if (type == ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_WX) {
			//ssdk.Authorize(PlatformType.WeChat);
		}else if(type == ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_QQ){
			//ssdk.Authorize(PlatformType.QQ);
		}
	}
	//登陆
	public loginByYK() : void{
		this.loginServer (0,"","",ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK,1);
    }
    
    public OnReLogin(arg0 : any,arg1 : any) : void{
		this._autoLogin = true;
		ProtocolManager.getInstance().Restart(arg0);
    }
    //-------------
    public OnLoginServer() : void{
        //用于选择服务器列表时的登陆
    }
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
        ProtocolManager.getInstance ().SendMsg(ProtocolDefine.LobbyProtocol.P_LOBBY_REQ_LOGIN as number, 
            Utils.encodeMsg(msg), 
            this.OnLoginSuccess.bind(this));
    }
	public OnLoginSuccess(msg : any) : void{
        let userData : ProtocolDefine.MsgUserData.msgUserData =  msg;//JSON.parse(msg); 
        let es : string = AccountEvent.EVENT[AccountEvent.EVENT.LOGIN_SUCCESS];
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
            this.Emit(es,true);

		} else {
            this.Emit(es,false);
		}
    }
    public CheckIsStartLoginSuccess() : boolean{
        if(this._isStartLogin){
            this._isStartLogin = false;//重置，只会执行一次
            return true;
        }
        return false;
    }

    //--------------------------实现事件管理----------------------
    _handles : Utils.DictType =  {};
    //发射监听
    public Emit(eventName : string, arg0 : any = undefined, arg1 : any = undefined) : void
    {
        for (var findEvenName in this._handles)
        {
            if (findEvenName == eventName)
            {
                for (var i = 0; i < this._handles[eventName].length; i++)
                {
                    var handler = this._handles[eventName][i]
                    handler.callback.call(handler.target,arg0,arg1);
                }
            }
        }
    }
    //添加事件监听
    public On(eventName : string, callback : any, target : any = undefined)
    {
        this._handles[eventName] = this._handles[eventName] || [];
        this._handles[eventName].push({
            callback: callback,
            target: target
        });
    }

    //移除监听
    public Off(eventName : string, callback : any, target : any = undefined)
    {
        if (target == undefined)
        {
            target = callback;
            callback = undefined;
        }
        for (var i = 0; i < this._handles[eventName].length; i++)
        {
            var handler = this._handles[eventName][i];
            if (target == handler.target &&
                (callback.toString() == handler.callback.toString() || callback == undefined))
            {
                this._handles[eventName].splice(i, 1);
            }
        }
    }
}
