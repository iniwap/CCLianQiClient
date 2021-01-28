
import { CommonDefine } from "../Define/CommonDefine";
import { ProtocolDefine } from "../Define/ProtocolDefine";
import { AccountEvent } from "../Event/AccountEvent";
import { nAccount } from "../Model/Account";
import { nLobby } from "../Model/Lobby";
import { ProtocolManager } from "../ProtocolManager/ProtocolManager";
import { Utils } from "../Utils/Utils";
import { LobbyController } from "./LobbyController";

export class LoginController{
    public static _instance : LoginController;
    _autoLogin : boolean = false;
    _loginType : ProtocolDefine.MsgLogin.eLoginType = ProtocolDefine.MsgLogin.eLoginType.LOGIN_TYPE_YK;
    constructor() {

    }

    public static getInstance() : LoginController{
        if(this._instance == null){
            this._instance = new LoginController();
        }
        return this._instance;
    }

    public Start() : void{
        //原则上，需要的资源加载完成再启动链接服务器
        ProtocolManager.getInstance().start(false,
            this.OnConnectError.bind(this),
            this.OnDisconnect.bind(this),
            this.OnConnect.bind(this));
    }
    
    public AddAllEvent() : void{
        Utils.getGlobalController()?.On(AccountEvent.EVENT[AccountEvent.EVENT.RELOGIN],
            this.OnReLogin.bind(this),LoginController);
        Utils.getGlobalController()?.On(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN],
            this.OnLogin.bind(this),LoginController);
    }
    public RemoveAllEvent() : void{
        Utils.getGlobalController()?.Off(AccountEvent.EVENT[AccountEvent.EVENT.RELOGIN],
            this.OnReLogin.bind(this),LoginController);
        Utils.getGlobalController()?.Off(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN],
            this.OnLogin.bind(this),LoginController);
    }

    //-----------------网络消息处理-----------------
    private OnConnect(selectSeverMode : boolean,msg : any) : void{
        if(selectSeverMode){
            Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.CONNECT_SERVER],selectSeverMode,msg);
            //后续用户选择某个登陆
            //ProtocolManager.getInstance().SelectServer(host,port);
        }else{
            //后续 自动登录
            //第一次需要点击登录按钮
            if (this._autoLogin) {
                this._autoLogin = false;

                //重新登陆
                let nc : nAccount.NowAccount = nAccount.Account.getNowAccount ();
                this.loginServer (nc.userID, nc.openid, nc.pwd, nc.lastLoginType, nc.area);

            } else {
                Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.CONNECT_SERVER]
                    ,selectSeverMode,msg);//隐藏loading动画，不是自动登陆，需要点击
            }
        }
    }

    private OnConnectError(msg : any) : void{
        Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_ERROR],msg);
    }
    private OnDisconnect(msg : any) : void{
        Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.NETWORK_DISCONNECT],msg);
    }

    public OnLogin(lt : ProtocolDefine.MsgLogin.eLoginType,arg0 : any) : void{
        this._loginType =  lt;

        //首先获取本地保存的数据
        if (nAccount.Account.loadNowAccout ()) {
            //已经登陆过
            let nc : nAccount.NowAccount = nAccount.Account.getNowAccount ();
            if (nc.lastLoginType == this._loginType) {

                //需要保存
                nAccount.Account.thirdOpenID = nc.openid;
                nAccount.Account.thirdToken = nc.token;

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
            deviceID : "test1819",
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
        if (userData.flag == ProtocolDefine.MsgUserData.eLoginResultFlag.LOGIN_SUCCESS) {
            //登陆成功
            let selfData : nAccount.SelfData = {
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
                    let ttp : nLobby.eTalentType = nLobby.eTalentType.TALENT_NONE;

                    if (Number(data[2]) == nLobby.eTalentSlotState.TALENT_INSTALLED.valueOf()) {
                        //已配置
                        ttp = Number(data [0] ) as nLobby.eTalentType;
                    }

                    selfData.talentList.push (ttp);
                }
            } else {
                //如果还没有配置，则默认不配
                for (var i = 0; i < CommonDefine.MAX_TALENT_CFG_NUM; i++) {
                    selfData.talentList.push (nLobby.eTalentType.TALENT_NONE);
                }
            }

            //设置用户数据
            nAccount.Account.onLoginSuccess(selfData,this._loginType);
            nAccount.Account.inRoomId = userData.room_id;

            //切换界面并通知 登陆成功
            Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN_SUCCESS],true,
                this.reqLobbyAfterLoadedLobby.bind(this));

        } else {
            Utils.getGlobalController()?.Emit(AccountEvent.EVENT[AccountEvent.EVENT.LOGIN_SUCCESS],false);
        }
    }
    public reqLobbyAfterLoadedLobby() : void{
        //请求大厅数据 -- 这里需要判断是否是重连，重连可以不请求？
        LobbyController.getInstance().reqLobby();
    }
}