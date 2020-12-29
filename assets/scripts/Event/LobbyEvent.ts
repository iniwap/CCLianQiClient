//原则上这些事件也是直接大厅界面访问到相应节点，直接操作使用
export namespace LobbyEvent{
    export enum EVENT{
		// 因为不希望在界面体现网络通信相关代码，所以需要传出这两个事件
		LOBBY_EVENT_BEGIN = 20000,

		//大厅panel 之间的切换
		SHOW_LOBBY_PANEL,

		UPDATE_USER_INFO,//更新用户信息
		SHOW_USER_INFO,//主动请求刷新用户信息

		UPDATE_PLAZA,//更新场次显示
		SHOW_PLAZA,
		UPDATE_STORE,//更新商城显示,如果此时商城正在显示，以下类似
		SHOW_STORE,
		UPDATE_PACKAGE,//
		SHOW_PACKAGE,
		SHOW_HAS_NEW_EMAIL_MARK,//显示有个人邮件红点
		UPDATE_PRIVATEMSG,//个人邮件
		SHOW_PRIVATE_MSG,
		SHOW_SYSMSG,//显示某条系统公告－跑马灯
		UPDATE_SYSMSG,//系统公告，跑马灯走起
		UPDATE_SIGNIN,//更新签到界面
		SHOW_SIGNIN,
		UPDATE_LUCKDRAW,//抽奖
		SHOW_LUCKDRAW,
		UPDATE_FRIEND,//显示好友列表
		SHOW_FRIEND,//显示好友界面
		UPDATE_RANK,
		SHOW_RANK,//需要传榜单类型

		RECEIVE_ALL_LOBBY_DATA,//收到所有大厅数据消息

		SHOW_POPUP,//弹窗界面之间的跳转

		SHOW_SIGNIN_RESULT,//显示签到结果，主要是是播放对应的动画
		SHOW_LUCKDRAW_RESULT,//显示抽奖结果

		REQ_UPDATE_EMAIL,
		SHOW_UPDATE_EMAIL_RESULT,

		SHOW_HAS_EMAIL,//有未读邮件标志

		REQ_FEEDBACK,
		RESP_FEEDBACK,
		REQ_OPEN_TALENTSLOT,
		RESP_OPEN_TALENTSLOT,
		UPDATE_USER_TALENT,//更新用户天赋列表
		//
		OPEN_CLOSE_EFFECT_SND,//开关音效
		OPEN_CLOSE_BG_SND,//开关背景音
	};
}
