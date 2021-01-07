// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite, Label, Prefab, resources, SpriteFrame, instantiate } from 'cc';
import { CommonDefine } from '../../Define/CommonDefine';
import { ProtocolDefine } from '../../Define/ProtocolDefine';
import { GameEvent } from '../../Event/GameEvent';
import { RoomEvent } from '../../Event/RoomEvent';
import { Lobby } from '../../Model/Lobby';
import { nRoom } from '../../Model/Room';
import { Utils } from '../../Utils/Utils';
import { PlayerScore } from './PlayerScore';
const { ccclass, property } = _decorator;

@ccclass('GameResult')
export class GameResult extends Component {
    @property(Sprite)
    public levelIcon : Sprite = null;
    @property(Label)
    public levelText : Label = null;
    @property(Label)
    public baseScoreText : Label = null;
    @property(Sprite)
    public titleImg : Sprite = null;
    @property(Label)
    public poolScore : Label = null;
    @property(Label)
	public abandonScore : Label = null;

    @property(Prefab)
    public playerScorePrefab : Prefab = null;
    @property(Node)
	public playerContainer : Node = null;
	private _playerScore : Array<PlayerScore | null> = [];

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onEnable(){
		for (var i = 0; i < this._playerScore.length; i++) {
            if(this._playerScore[i] != null){
                this._playerScore[i]!.node.destroy();
            }
			this._playerScore[i] = null;
		}
    }
    onDisable(){
		for (var i = 0; i < this._playerScore.length; i++) {
			if (this._playerScore[i] != null) {
				this._playerScore[i]!.node.destroy();	
			}
			this._playerScore[i] = null;
		}
		this._playerScore = [];
    }

	//------------------------------以下界面事件传出-----------------------------------------------
    public OnClickCloseBtn(){
		//此处原则上也应该返回大厅
		this.OnClickBackBtn();
	}

	public OnClickShareBtn() : void{
		// 启动分享
	}
	public OnClickBackBtn() : void{
		//返回大厅
        Utils.getGlobalController()?.Emit(RoomEvent.EVENT[RoomEvent.EVENT.LEAVE_ROOM],true);
	}
    //----------------UI-----------
    public showGameResult(result: GameEvent.IShowGameResult) : void{
		this.node.active = true;

		let poolGold : number = 0;
		for(var i = 0;i < result.gameResult.length;i++){
			this._playerScore.push(this.createPlayerScore(i,result.roomType,result.gameResult[i]));

            let path : string = "";
			if (nRoom.RoomData.getLocalBySeat(result.gameResult [i].seat) == nRoom.eSeatType.SELF) {
				if (result.gameResult [i].score > 0) {
					path = CommonDefine.ResPath.GAME_RESULT_TITLE_WIN;
				} else if (result.gameResult [i].score < 0) {
					path = CommonDefine.ResPath.GAME_RESULT_TITLE_LOSE;
				} else {
					path = CommonDefine.ResPath.GAME_RESULT_TITLE_LOSE;
					//不存在平手
                }
				//投降为输
				if (result.gameResult [i].hasAbandon) {
					path  = CommonDefine.ResPath.GAME_RESULT_TITLE_LOSE;
                }
                
                resources.load(path + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
                    this.titleImg.spriteFrame = spriteFrame!;
                    //spriteFrame.addRef();
                });
			}

			poolGold += result.gameResult[i].multi * result.baseScore;
		}

		//有一种情况，就是大家的得分都相等，认为是平手
		this.poolScore.string = "奖池积分  " + poolGold;
		if (result.poolGold != poolGold) {
			this.abandonScore.string = "" + (result.poolGold - poolGold);
			this.abandonScore.node.active = true;
		} else {
			this.abandonScore.node.active = false;
		}

		this.updateLevel(result.level,result.baseScore);
    }

    private createPlayerScore(index : number,roomType : ProtocolDefine.nRoom.eCreateRoomType,rst : GameEvent.IGameResult) : PlayerScore{

        let n : Node = instantiate(this.playerScorePrefab);
		let playerScore : PlayerScore = n.getComponent(PlayerScore)!;

        playerScore.node.setParent(this.playerContainer);

		playerScore.node.setPosition(0,150 - index * 100);

		let self : boolean = nRoom.RoomData.getLocalBySeat(rst.seat) == nRoom.eSeatType.SELF;
		let showOwner : boolean = false;
		if (roomType == ProtocolDefine.nRoom.eCreateRoomType.ROOM_ROOM 
			|| roomType ==  ProtocolDefine.nRoom.eCreateRoomType.ROOM_TEAM) {

			if (rst.isOwner) {
				showOwner = true;
			} else {
				showOwner = false;
			}
		}

		playerScore.updatePlayScore (self,index+1,rst.seat,showOwner,rst.head,rst.name,
			rst.area,rst.kill,rst.score,rst.multi,rst.hasAbandon);

		return playerScore;
	}
	private updateLevel(level : Lobby.ePlazaLevelType,baseScore : number){
		let pname : string = "新手场";
		if(level == Lobby.ePlazaLevelType.PLAZA_LEVEL_LOW){
			pname = "新手场";
		}else if(level == Lobby.ePlazaLevelType.PLAZA_LEVEL_MIDDLE){
			pname = "进阶场";
		}else if(level == Lobby.ePlazaLevelType.PLAZA_LEVEL_HIGH){
			pname = "高手场";
		}
		this.levelText.string = pname;
        this.baseScoreText.string = "" + baseScore + "积分";
        
        resources.load(CommonDefine.ResPath.LEVEL_ICON + level + "/spriteFrame",SpriteFrame, (err, spriteFrame) => {
            this.levelIcon.spriteFrame = spriteFrame!;
            //spriteFrame.addRef();
        });
	}
}
