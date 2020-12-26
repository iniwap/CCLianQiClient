//
//
//
export namespace AccountEvent{
    export enum EVENT{
		// 因为不希望在界面体现网络通信相关代码，所以需要传出这两个事件
		ACCOUNT_EVENT_BEGIN = 10000,
		CONNECT_SERVER,//首次连接服务器
		LOGIN,//登陆按钮点击//传递登陆类型
		THIRD_PARTY_LOGIN,
		THIRD_PARTY_LOGIN_RET,
		LOGOUT,//请求退出
		LOGIN_SUCCESS,//登陆成功，用于通知其他
		NETWORK_ERROR,
		NETWORK_DISCONNECT,
	};

	export interface ThirdPartyLoginResult{
		openId : string;
		token : string;
		name : string;
		head : string;
		sex : number;
		expireTime : number;
	};
}