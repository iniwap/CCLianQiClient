// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Sprite, Label, Button, resources  as Res, SpriteFrame, assetManager} from 'cc';
import { Account,SelfData} from '../Model/Account';
import { EmailView } from './EmailView';
import { FeedbackView } from './FeedbackView';
import { RankView } from './RankView';
import { SettingView } from './SettingView';
import { ProtocolDefine } from '../Define/ProtocolDefine';
import { Utils } from '../Utils/Utils';
import { Lobby } from '../Model/Lobby';
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
	
	//may be in start?
	onEnable(){
		super.onEnable();
		this.addAllEvent();
		this.OnUpdateUserInfo();
	}
	onDisable(){
		super.onDisable();
		this.removeAllEvent();
	}
	//#region ---事件监听
	private addAllEvent() : void{
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_SYSMSG],
			this.OnUpdateSysMsg.bind(this));
		
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_SYSMSG],
			this.OnShowSysMsg.bind(this));//插入显示一条系统广播消息
		
		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO],
			this.OnUpdateUserInfo.bind(this));

		Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_HAS_NEW_EMAIL_MARK],
			this.OnShowHasUnReadEmailMark.bind(this));
	}
	private removeAllEvent() : void{
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_SYSMSG],
			this.OnUpdateSysMsg.bind(this));
		
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_SYSMSG],
			this.OnShowSysMsg.bind(this));
		
		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_USER_INFO],
			this.OnUpdateUserInfo.bind(this));

		Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_HAS_NEW_EMAIL_MARK],
			this.OnShowHasUnReadEmailMark.bind(this));
	}
	//#endregion

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
	
	//-------------------------UI操作-------------------------------------
	public OnUpdateUserInfo() : void{
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
	}

	@property(Lamp)
	public SysLamp : Lamp = null;
	public OnUpdateSysMsg(sysMsgList : Array<Lobby.SysMsg>) : void{		
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
    public OnShowHasUnReadEmailMark(show : boolean) : void{
		this.HasMsg.node.active = show;
    }
	//UPDATE_SYSMSG
	private OnShowSysMsg(content : string) : void{
		this.SysLamp.node.active = true;

		let lamp : Lobby.SysBroadCast = JSON.parse(content);
		this.SysLamp.addLamp (lamp);//这里原则上也可以实现内容携带其他信息，诸如图标

		this.SysLamp.showLampById (this.SysLamp.getTotal() - 1);
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

		Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.JOIN_ROOM],data);
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
