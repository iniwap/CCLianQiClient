// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, RichText } from 'cc';
import { nLobby } from '../Model/Lobby';
const { ccclass, property } = _decorator;

@ccclass('Lamp')
export class Lamp extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property(RichText)
	public LampText! : RichText;

	_speed : number = 2;
	_currentLamp : number = 0;
	_lampStrList : Array<nLobby.SysBroadCast> = [];
	_timeCnt : number = 0;
    _currentPlayCnt : number = 0;
    
    start () {
        // Your initialization goes here.
    }

    update (deltaTime: number) {
        // Your update function goes here.
        this._timeCnt++;

		this.LampText.node.setPosition(this.LampText.node.position.x - this._speed,this.LampText.node.position.y);

		if (this.LampText.node.position.x < -800) {                
            this.LampText.node.setPosition(1020,this.LampText.node.position.y);

			if((++this._currentPlayCnt) >= this._lampStrList [this._currentLamp].playCnt){
				//删除该条
				this._lampStrList.splice(this._currentLamp,1);
				this._currentPlayCnt = 0;
				if (this._lampStrList.length == 0) {
					//没有了
					this.node.active = false;
					this._timeCnt = 0;
					this._currentPlayCnt = 0;
					this._currentPlayCnt = 0;
					return;
				}

				//下一条
				if (this._currentLamp >= this._lampStrList.length - 1) {
					this._currentLamp = 0;
					this.LampText.string = "<color=#261601>" + this._lampStrList[0].content + "</color>";

				} else {
					//_currentLamp++;
					this.LampText.string = "<color=#261601>" + this._lampStrList[this._currentLamp].content + "</color>";
				}
			}
		}
    }

	public addLamp(lamp : nLobby.SysBroadCast) : void{
		this._lampStrList.push(lamp);
	}

	public getTotal() : number{
		return this._lampStrList.length;
	}

	public showLampById(id : number) : void{
		if (id >= this._lampStrList.length || id < 0)
			return;

		this.node.active = true;

		this._timeCnt = 0;
		this._currentPlayCnt = 0;
		this.LampText.string = "<color=#261601>" + this._lampStrList[id].content + "</color>";
		this._currentLamp = id;

		this.LampText.node.setPosition(1020,this.LampText.node.position.y);
	}
	public resetLamp() : void{
		this._lampStrList = [];

		this._currentLamp = 0;
		this._timeCnt = 0;
		this._currentPlayCnt = 0;

	}
}
