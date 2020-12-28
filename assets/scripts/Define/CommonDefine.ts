//
//
//
export namespace CommonDefine{
    export enum eTalentType{
        TALENT_NONE,

        //base
        TALENT_A1,//资源占据：从自己所在格子获得1生命点
        TALENT_A2,//a2资源吸收：从前后未被敌人占据的格子各获得1生命点
        TALENT_A3,//a3基本攻击：面向敌人，以1点攻击力攻击前方敌人
        TALENT_B1,// b1加命：面对友军，为友军增加1生命点；
        TALENT_B2,//b2助攻：面对友军，且友军处于攻击状态，则自己的攻击力加到友军身上；备注：妨碍敌方的a2天赋可以减少敌方生命总量；背对背是天赋b5处于攻击状态= 面对敌人或面对空格

        //talent
        TALENT_B3,//b3环：己方n个棋子形成环，每个棋子增加n生命点
        TALENT_B4,// b4吸收：两个棋子相对，各具备3吸收力，能够对背后的敌人吸收最多3的攻击力；备注：经最近测试，改为3吸收力可以让吸收阵更加实用，而且也不会过于强大，不过可能导致以前设计的一些残局解法有变，一个有效的解决办法就是给以往的残局再设定天赋条件，比如每个残局都设定好了允许使用的天赋
        TALENT_B5,//b5双尖：两颗棋子背对背，各增加2攻击力；
        TALENT_C1,// c1吃子移动：己方活动时，若通过攻击干掉对方棋子，则获得1点移动能力，允许在本回合内向前移1格；
        //etc..
    };
    export enum TalentSlotState{
      TALENT_LOCK,
      TALENT_CAN_INSTALL,
      TALENT_INSTALLED,
    };
    
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
}