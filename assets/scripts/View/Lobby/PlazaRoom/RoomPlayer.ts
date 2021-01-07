// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite, Label, RichText, resources, SpriteFrame, assetManager, ImageAsset } from 'cc';
import { CommonDefine } from '../../../Define/CommonDefine';
import { RoomEvent } from '../../../Event/RoomEvent';
import { nRoom } from '../../../Model/Room';
import { Utils } from '../../../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('RoomPlayer')
export class RoomPlayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property(Sprite)
    public vipIcon! : Sprite;
    
    @property(Label)
    public vipLevel! : Label;
    
    @property(RichText)
    public winRate! : RichText;
    
    @property(Sprite)
    public headBg! : Sprite;
    
    @property(Sprite)
    public head! : Sprite;
    
    @property(Sprite)
    public ownerImg! : Sprite;
    
    @property(RichText)
    public nameText! : RichText;
    
    @property(Label)
    public multiple! : Label;
    
    @property(Node)
    public vipEffect !: Node;

	private _local : number = 0;
	private _isOwner : boolean = false;

    @property(Node)
    public gameWaitVipPos !: Node;
    
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    public updateRoomPlayer(type : RoomEvent.eRoomPlayerType,local : number,
        vip : number,winRate : number,headpath : string,isOwner : boolean,name : string) : void{

        let vipLevel : number = Utils.getVipLevel (vip);

        // resources.load(CommonDefine.ResPath.VIP_ICON + vipLevel,SpriteFrame, (err, spriteFrame) => {
        //     this.vipIcon.spriteFrame = spriteFrame!;
        //     //spriteFrame.addRef();
        // });
        
		this.vipLevel.string = "" + vipLevel;
		if (vipLevel >= 3) {
			this.vipEffect.active = true;
		} else {
			this.vipEffect.active = false;
		}

		this._local = local;
        this.nameText.string = name;
        
        resources.load(CommonDefine.ResPath.ROOM_HEAD_BG + nRoom.RoomData.getSeatByLocal(local) + "/spriteFrame",
            SpriteFrame,(err, spriteFrame) => {
                try{
                    this.headBg.spriteFrame = spriteFrame!;
                    //spriteFrame.addRef();
                }catch(e){
                    if(this.headBg == undefined) console.log("吗的不知道为什么这里是undefine，却能正常修改图片");
                }
        });

		if (headpath.search("http") != -1) {
            //网路图片
			assetManager.loadRemote(headpath,  { ext: '.jpg' }, (err, texture) => {
				if(texture){
					//fuck 
					this.head.spriteFrame = SpriteFrame.createWithImage(texture as ImageAsset);
				}
			});
		} else {
            resources.load(CommonDefine.ResPath.ROOM_HEAD + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
                try{
                    this.head.spriteFrame = spriteFrame!;
                    //spriteFrame.addRef();
                }catch{
                }
            });
        }
        
		if (type == nRoom.eRoomPlayerType.ROOM_WIAT) {
			
			this.winRate.string = "胜率" + winRate + "%";
			this.multiple.node.active = false;
			this.ownerImg.node.active = isOwner;
			this._isOwner = isOwner;
		} else if(type == nRoom.eRoomPlayerType.GAME_WAIT){
			//
			this.winRate.node.active = false;
			this.multiple.node.active = false;
			this.ownerImg.node.active = false;

			//vip信息需要移动到头像下方
			this.vipIcon.node.position = this.gameWaitVipPos.position;
		}
	}

	public updateMultiple(m : number) : void{
		this.multiple.node.active =  true;
		this.multiple.string = "x"+m+"倍";
	}

	public getIsOwner() : boolean{
		return this._isOwner;
	}
	public updatePlayerReady() : void{        
        resources.load(CommonDefine.ResPath.ROOM_READY_HEAD_BG + nRoom.RoomData.getSeatByLocal(this._local) + "/spriteFrame",
            SpriteFrame, (err, spriteFrame) => {
                this.headBg.spriteFrame = spriteFrame!;
                //spriteFrame.addRef();
        });
	}
}
