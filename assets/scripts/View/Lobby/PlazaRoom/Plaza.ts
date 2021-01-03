//场模式卡片

import { _decorator, Component, Sprite, Label, Button, RichText, SpriteFrame, resources } from 'cc';
import { CommonDefine } from '../../../Define/CommonDefine';
const { ccclass, property } = _decorator;

@ccclass('Plaza')
export class Plaza extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property(Sprite)
	public plazaBg! : Sprite;

    @property(Sprite)
	public tagImg! : Sprite;

    @property(Label)
	public plazaName! : Label;

    @property(Sprite)
	public plazaIcon! : Sprite;

    @property(RichText)
	public plazaDes! : RichText;

    @property(Button)
	public twoPlayerBtn! : Button;

    @property(Button)
	public fourPlayerBtn! : Button;
    
    @property(Button)
	public joinBtn! : Button;

    @property(Label)
	public plazaRule! : Label;

    private _playerNum : number = 0;
    private _plazaId : number = 0;
    private _gridLevel : number = 0;
    private _pid : number = 0;
	private _hasSelected : boolean = false;

	@property(Sprite)
	public plazaStars : Array<Sprite> = [];
	
	private _unselectPlazaExcept! : (plazaId : number) =>void;
	private _joinRoom !: (playerNum : number,gridLevel : number,plazaID : number,name : string,tag : number) =>void;
    
    start () {
		// Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
	// }

    //------------------------------以下界面事件传出-----------------------------------------------
	public OnClickTwoPlayerBtn() : void{
		if (this._playerNum == 2)
			return;
		
		this._playerNum = 2;
		this._gridLevel = 4;

		//设置高亮，4人按钮非选中
        resources.load(CommonDefine.ResPath.PLAZA_MODEL_S_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.twoPlayerBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });

        resources.load(CommonDefine.ResPath.PLAZA_MODEL_N_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.fourPlayerBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });
        
		if(this._unselectPlazaExcept) this._unselectPlazaExcept.call(this,this._pid);

		this.joinBtn.interactable = true;
		this._hasSelected = true;
	}

	public  OnClickFourPlayerBtn() : void{
		if (this._playerNum == 4)
			return;
		
		this._playerNum = 4;
		this._gridLevel = 6;

		//设置4高亮，2人按钮非选中
		resources.load(CommonDefine.ResPath.PLAZA_MODEL_N_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.twoPlayerBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
			//spriteFrame.addRef();
        });

        resources.load(CommonDefine.ResPath.PLAZA_MODEL_S_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.fourPlayerBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
		});
		
		if(this._unselectPlazaExcept) this._unselectPlazaExcept.call(this,this._pid);

		this.joinBtn.interactable = true;
		this._hasSelected = true;
	}
	public OnClickJoinRoomBtn() : void{
		if(this._joinRoom) this._joinRoom.call(this,
			this._playerNum,this._gridLevel,this._plazaId,this.plazaName.string,this._pid%4);
	}

	public updatePlaza(index : number,plazaid : number,name : string,star : number,des : string,roomRule : string, 
		unselectPlazaExcept : any,joinRoom : any) : void{
		
		this._plazaId = plazaid;
		this._pid = index;
		this._unselectPlazaExcept = unselectPlazaExcept;
		this._joinRoom = joinRoom;

		this.plazaName.string = name;

		resources.load(CommonDefine.ResPath.PLAZA_TAG + index%4 + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.tagImg.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });
		resources.load(CommonDefine.ResPath.PLAZA_ICON + plazaid + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.plazaIcon.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
		});
		
		for(var i = 0;i < this.plazaStars.length;i++){
			this.plazaStars[i].node.active = false;
			if (i < Math.floor(star)) {
				this.plazaStars[i].node.active = true;
			}
		}
		if (Math.floor(star) + 0.5 == star) {
			this.plazaStars[0].node.active =  true;
			resources.load(CommonDefine.ResPath.PLAZA_HALF_STAR + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
				this.plazaStars[0].spriteFrame  = spriteFrame!;
				//spriteFrame.addRef();
			});
		}


		this.plazaDes.string = des;
		this.plazaRule.string = roomRule;

		//默认选中第一个
		if(this._pid == 0){
			this.OnClickTwoPlayerBtn();
		}
	}

	public unselectPlaza() : void{
		if (this._playerNum == 0)
			return;

		this._playerNum = 0;
		this._gridLevel = 0;
		this.joinBtn.interactable = false;
		this._hasSelected = false;

		resources.load(CommonDefine.ResPath.PLAZA_MODEL_N_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.twoPlayerBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });

        resources.load(CommonDefine.ResPath.PLAZA_MODEL_N_BTN + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.fourPlayerBtn.getComponent(Sprite)!.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
		});
	}

	public getID() : number{
		return this._pid;
	}
	public enablePlaza(enable : boolean) : void{
		if (enable) {
			this.twoPlayerBtn.interactable = true;
			this.fourPlayerBtn.interactable = true;
			if (this._hasSelected) {
				this.joinBtn.interactable = true;
			}
		} else {
			this.twoPlayerBtn.interactable = false;
			this.fourPlayerBtn.interactable = false;
			this.joinBtn.interactable = false;
		}
	}
}
