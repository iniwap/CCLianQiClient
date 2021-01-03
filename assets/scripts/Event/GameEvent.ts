import { ProtocolDefine } from "../Define/ProtocolDefine";

export namespace GameEvent{
    export enum EVENT{
        CLOCK,
        SHOW_GAME_START,
    };
    export interface IUpdateClock{
        local : number,
        leftTime : number,
        step : ProtocolDefine.nGame.nLianQi.eGameStepType,
    }
};
