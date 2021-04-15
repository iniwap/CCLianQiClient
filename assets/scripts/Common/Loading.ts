// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component ,Animation} from 'cc';
const { ccclass } = _decorator;

@ccclass('Loading')
export class Loading extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    public ShowLoading(show : boolean){
        //显示loading
        this.node.active = show;
        if(!show){
            //destory
           // let ani : Animation = this.node.getChildByPath("BG/loading")!.getComponent(Animation) as Animation;
            //ani.stop();
            this.node.destroy();
        }
    }
}