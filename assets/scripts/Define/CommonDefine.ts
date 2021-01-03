//
//
//
export namespace CommonDefine{
    export enum eSceneType{
      Login,
      Lobby,
      Game,
    }
    export enum eRespResultType{
      SUCCESS,
      FAIL,
    };
    
    
    export namespace ResPath{
      //common
      export const LEVEL_ICON = "Lobby/Common/LevelIcon";
      export const HEAD = "Lobby/Common/Head/";
  
      //大厅
      export const RANK_NUM_ICON : string = "Lobby/Lobby/06_start_popup_ranking/ranking_icon_";
      export const  EMAIL_NOT_GET_AWARD_BTN : string = "Lobby/Email/GetRwdBtn";
      export const EMAIL_HAS_GET_AWARD_BTN : string = "Lobby/Email/HasGotRwdBtn";
      export const CANT_CHANGE_MODE_BTN : string = "Lobby/UpBtn1";
      export const CAN_CHANGE_MODE_BTN : string = "Lobby/UpBtn2";
  
      //天赋配置
      export const TALENT_ICON_BTN : string = "Lobby/Lobby/talent/icon_talent_";
      export const TALENT_LOCK_BTN : string = "Lobby/Lobby/talent/btn_talent_lock";
      export const TALENT_CANINSTALL_BTN : string = "Lobby/Lobby/talent/btn_open_talent";
  
      export const TALENT_HIGHTLIGHT : string = "Lobby/Lobby/talent/point_hightlight";
      export const TALENT_DE_HIGHTLIGHT : string = "Lobby/Lobby/talent/point_normal";
  
      //房间和场
      export const ROOM_TOPBAR_BG : string = "Lobby/Plaza/plaza03_room/plaza03_room";//队伍面板背景图
  
      export const PLAZA_TAG : string = "Lobby/Plaza/01/plaza_icon_special_";//场左上角角标图
      export const PLAZA_ICON : string = "Lobby/PlazaRoom/PlazaModelIcon";//场的标示图
      export const PLAZA_HALF_STAR : string = "Lobby/Plaza/plaza00/plaza_icon_halfstar";
      export const PLAZA_STAR : string = "Lobby/Plaza/plaza00/plaza_icon_star";
      export const PLAZA_MODEL_N_BTN : string = "Lobby/Plaza/plaza00/plaza_radio_bg";
      export const PLAZA_MODEL_S_BTN : string = "Lobby/Plaza/plaza00/plaza_panel_radio_selected";
      export const PLAZA_ROOM_LEVEL : string = "Lobby/Plaza/plaza01_roomsetting/plaza_icon_integral_";
      export const VIP_ICON : string = "Lobby/Plaza/03/icon_vip_";
      export const ROOM_HEAD_BG : string = "Lobby/Plaza/plaza03_room/room_head_defult_0";
      export const ROOM_READY_HEAD_BG : string = "Lobby/Plaza/plaza03_room/room_head_preparing_0";
      export const ROOM_HEAD : string = "Lobby/Plaza/plaza03_room/img_defulthead";
  
      export const LQ_DIRECTION_INFOBG : string = "Game/GameLianQi/DirInfoBg";
      export const LQ_DIRECTION_DIRECT : string = "Game/GameLianQi/Dir";
      export const LQ_DIRECTION_DIRECT_WITHE : string = "Game/GameLianQi/NotBanDir";
      export const LQ_DIRECTION_DIR_BG_1 : string = "Game/GameLianQi/DirBanBg1";
      export const LQ_DIRECTION_DIR_BG_2 : string = "Game/GameLianQi/DirBanBg2";// 最深
      export const LQ_PASS_BTN : string = "Game/GameLianQi/Pass";
  
      export const PLAYER_HEAD : string = "Game/GameLianQi/PlayerInfoHead";
      export const PLAYER_BG : string = "Game/GameLianQi/PlayerInfoBg";
  
      export const CHESS : string = "Game/GameLianQi/QiZi";
      export const CHESS_BG : string = "Game/GameLianQi/ChessBg";
  
      //结算
      export const GAME_RESULT_TITLE : string = "Game/GameResult/title";
      export const GAME_RESULT_TITLE_WIN : string = "Game/GameResult/titlewin";
      export const GAME_RESULT_TITLE_LOSE : string = "Game/GameResult/titlelose";
      export const GAME_RESULT_TITLE_DRAW : string = "Game/GameResult/titledraw";
    };

    export const TALENT_SLOT_STATE : string = "TALENT_SLOT_STATE";
    export const MAX_TALENT_CFG_NUM : number = 4;

    export const SETTING_BG_SND : string = "SETTING_BG_SND";
    export const SETTING_EFF_SNF : string = "SETTING_EFF_SNF";

    export namespace CONST {
      export const MAX_LMT_ROUND = 500;
      export const MIN_LMT_ROUND = 10;
      export const MAX_LMT_TURNTIME = 60;
      export const MIN_LMT_TURNTIME = 5;
  
      export const MAX_TALENT_CFG_NUM = 4;
      export const TALENT_SLOT_STATE = "TALENT_SLOT_STATE";
    };

}