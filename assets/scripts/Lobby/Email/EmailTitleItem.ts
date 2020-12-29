// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite, Label } from 'cc';
import { Lobby } from '../../Model/Lobby';
const { ccclass, property } = _decorator;

@ccclass('EmailTitleItem')
export class EmailTitleItem extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
	private _emailID : number = -1;
	private _isSelect : boolean = false;
	private _content!: Lobby.EmailContent; // 这里存放解析出来的内容
	private _author : string = "";
	private _hasRead : boolean = false;

    @property(Sprite)
    public bg! : Sprite;
    
    @property(Label)
    public title! : Label;
    @property(Label)
    public date! : Label;
    @property(Label)
	public notRead! : Label;

	private _clickCallback!: (eID : number)=>void;//用于传出点击事件
    private _titleStr : string = "";
    
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    	//------------------------------以下界面事件传出-----------------------------------------------
	public OnClickCloseBtn() : void{
		this.node.active =  false;
	}

	public OnClickTitleBtn() : void{
		if(this._isSelect) return;

		this._isSelect = true;
        this.bg.node.active = true;
		this._clickCallback(this._emailID);
	}

	//-------------------------------一些接口--------------------------
	public updateEmailTitleItem(clickCallback : any,id : number,author : string,
		content : Lobby.EmailContent,title : string,date : string,hasRead : boolean) : void{
        this._clickCallback = clickCallback;
		this._emailID = id;
		this.title.string = title;
		this.date.string = date;
		this._author = author;
		this._content = content;
		this.notRead.node.active =  !hasRead;
		this._hasRead = hasRead;
		this._titleStr = title;
		this.bg.node.active = false;
	}
	public updateHasRead() : void{
		this.notRead.node.active = false;
		this._hasRead = true;
	}
	public updateContent(content : Lobby.EmailContent) : void{
		this._content = content;
	}
	public unselectItem() : void{
		this._isSelect = false;
        this.bg.node.active = false;
        
        //_title.text = "<color=#261601FF>"+ _titleStr + "</color>";
		//_title.fontSize = 48;
		//_title.alignment = TextAnchor.MiddleLeft;
	}
	public selectItem(){
		//_title.text = "<color=#261601FF>"+ _titleStr + "</color>";
		//_title.fontSize = 36;
		//_title.alignment = TextAnchor.MiddleCenter;

	}
	public getEmailID() : number{
		return this._emailID;
	}
	public getContent() : Lobby.EmailContent{
		return this._content;
	}
	public getAuthor() : string{
		return this._author;
	}
	public getDate() : string{
		return this.date.string;
	}
	public getHasRead() : boolean{
		return this._hasRead;
	}
	public getIsSelect() : boolean{
		return this._isSelect;
	}
}
