// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Label, Sprite, Prefab, UITransform, instantiate } from 'cc';
import { Account } from '../../../Model/Account';
import { LobbyEvent } from '../../../Event/LobbyEvent';
import { Lobby } from '../../../Model/Lobby';
import { Utils } from '../../../Utils/Utils';
import { RankItem } from './RankItem';
import { ProtocolDefine } from '../../../Define/ProtocolDefine';
const { ccclass, property } = _decorator;

@ccclass('RankView')
export class RankView extends Component {
    //上方
    @property(Label)
    public myRank! : Label;
    @property(Label)
	public rankPopupTitle! : Label;

    //左侧
    @property(Label)
    public rankTime! : Label;
    @property(Label)
    public rankType! : Label;
    @property(Sprite)
    public rankAwardIcon! : Sprite;
    @property(Label)
	public rankAwardList : Array<Label> = [];

    //右侧
    @property(Prefab)
    public rankItemPrefab! : Prefab;
    @property(Node)
	public rankRoot! : Node;

	private _rankList : Array<RankItem> =  [];


    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onEnable(){
        Utils.getGlobalController()?.On(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_RANK],
            this.OnUpdateRank.bind(this),this);
        //this.OnUpdateRank();// 打开界面时，主动显示
        //需要打开时请求数据
        Utils.getGlobalController()?.Emit(LobbyEvent.EVENT[LobbyEvent.EVENT.SHOW_RANK],
            ProtocolDefine.nLobby.nRank.eRankScopeType.RANK_AREA,ProtocolDefine.nLobby.nRank.eRankType.RANK_GOLD);
    }

    onDisable(){
        Utils.getGlobalController()?.Off(LobbyEvent.EVENT[LobbyEvent.EVENT.UPDATE_RANK],
            this.OnUpdateRank.bind(this),this);

            		//隐藏删除
		for (var i = 0; i < this._rankList.length; i++) {
			this._rankList[i].node.destroy();
		}
		this._rankList = [];
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public OnClickCloseBtn() : void{
		this.node.active = false;
	}
    public OnUpdateRank(rankList : Array<Lobby.Rank>){        
        let content : UITransform = this.rankRoot.getComponent(UITransform)!;
        if(content) content.setContentSize(content.width,rankList.length*66 + 36);
        
		this.removeAllRank();
		//根据type 展示所需要的排行榜 
		for (var i = 0; i < rankList.length; i++) {
			let type : ProtocolDefine.nLobby.nRank.eRankType = rankList[i].rst.type;

			let score : string = "";
			switch(rankList[i].rst.type){
			case ProtocolDefine.nLobby.nRank.eRankType.RANK_CHARM:
				score = score + rankList[i].charm + " 魅力";
				break;
			case ProtocolDefine.nLobby.nRank.eRankType.RANK_DIAMOND:
				score = score + rankList[i].diamond + " 晶核";
				break;
			case ProtocolDefine.nLobby.nRank.eRankType.RANK_GOLD:
				score = score + rankList[i].gold + " 积分";
				break;
			case ProtocolDefine.nLobby.nRank.eRankType.RANK_SCORE:
				score = score + rankList[i].score + " 段位";
				break;
			case ProtocolDefine.nLobby.nRank.eRankType.RANK_WINRATE:
				score = score + rankList[i].win_rate + " 胜率";
				break;
			case ProtocolDefine.nLobby.nRank.eRankType.RANK_EXP:
				score = score + rankList[i].exp + " 经验等级（大厅等）";
				break;
			}
			this._rankList.push(this.createRankItem(i+1,rankList[i].name,score));

            //是否有自己，有自己则设置自己的排名
			if(Account.getSelfData().userID == rankList[i].userID){
				this.myRank.string = "你的排名："+(i+1);
			}
		}

        //设置时间
        let date = new Date();
		this.rankTime.string = date.getFullYear() + '年' + date.getMonth() + "月" + date.getDate() + "日";
    }
    //-------------------------一些接口--------------------------------------------------------
	private createRankItem(rank : number,nick : string,score : string) : RankItem{

        let ri : Node = instantiate(this.rankItemPrefab);
        let rankItem : RankItem = ri.getComponent(RankItem)!;
        rankItem.node.setParent(this.rankRoot);

        rankItem.node.setPosition(0,- (rank-1) * 66 - 25,0);

        rankItem.updateRankItem(rank,nick,score);

        //rankItem.transform.localScale = rankItem.transform.localScale * CommonUtil.Util.getScreenScale();

        return rankItem;
	}
	private removeAllRank() : void{
		for (var i = 0; i < this._rankList.length; i++) {
			if (this._rankList [i] != null) {
				this._rankList[i].node.destroy();
			}
		}
		this._rankList = [];
	}
}
