/*
	
*/
Sys_Cleanup_Cmd = 0x00000001		//	clean up resource
Entry_Logon_Cmd = 0x00010000		//	login
Entry_Logoff_Cmd = 0x00010001		//	logoff
Entry_LoginStatus_Get = 0x00010008		//	currect login status
Entry_Prop_Get = 0x00010002
Entry_ObsLst_Get = 0x00010005
Entry_NVSList_Get = 0x00010003

Obs_Add_Cmd = 0x00020002		//	add obs(window)
Obs_Remove_Cmd = 0x00020003		//	delete obs(window)
Obs_StartRealTime_Cmd = 0x00020004		//	start play video
Obs_Monopolize_Cmd = 0x00020014		//	Monopolize obs
Obs_Prop_Get = 0x00020000
Obs_MicEnable_Set = 0x0002000b
Obs_Stop_Cmd = 0x00020009


MAX_OBS_NUM = 32			//	Max windows number
NETMODE_TCP = 1				//	netword mode : TCP

LOGON_SUCCESS = 0  		//	Logon successfully
LOGON_ING = 1    	//	Being logon
LOGON_DSMING = 3    	//	DSM（Directory Sevices Mode）connecting
LOGON_RETRY = 2    	//	Retry
LOGON_FAILED = 4   	//	Fail to logon
LOGON_TIMEOUT = 5   	//	Logon timeout

var g_sProxyIP;				//	proxy ip
var g_sServerHost;			//	ipc/nvr/ptz ip
var g_iWPort;				//	data port
var g_iLoginID = -1;		//	login handle
var g_iCurObsCount = 0;		//	the window num of current 
var g_iCurMonitorCount = 0;	//	the monitor num of current
var g_arrObs = new Object;	//	array for obs(window)
var g_iCurObsIndex = 0;		//	the index of current selected obs
var g_splitCode = "\b";


var g_Active_Obs = [];


//	Save channel info
var g_ChannelInfo = new Array(MAX_OBS_NUM);
for (var i = 0; i < MAX_OBS_NUM; i++) {
	g_ChannelInfo[i] = new Array(5);
	g_ChannelInfo[i] = null;
	g_ChannelInfo[i] = new Object;
	g_ChannelInfo[i]['iObsID'] = 0;
	g_ChannelInfo[i]['bTalk'] = false;
	g_ChannelInfo[i]['bAudio'] = false;
	g_ChannelInfo[i]['bRec'] = false;
	g_ChannelInfo[i]['bShowBitRate'] = false;
	g_ChannelInfo[i]['bAuto'] = false;
}

function AddObs() {
	var ret = -1;
	cmdResult = TiandyVideo.Commander(Obs_Add_Cmd, 0, 0, 0, 0, 0, 0, 0, 0, 0).split('\n');
	if (cmdResult[0] == 0) {
		ret = parseInt(cmdResult[1]);
	}
	return ret;
}

function ChangeObsNum(num) {
	if (num > MAX_OBS_NUM) {
		alert(">MAX_OBS_NUM.");
		return;
	};


	for (var i = g_iCurObsCount; i < num; i++) {
		g_ChannelInfo[i]['iObsID'] = AddObs();
	}
	g_iCurObsCount = num;
}

/*
*	Set monitor number.
*/
function SetObsShow(_ObsArr) {
	try {
		if (_ObsArr.length <= 0) {
			return false;
		}
		var ret = TiandyVideo.Commander(Obs_Monopolize_Cmd, _ObsArr, 0, 0, 0, 0, 0, 0, 0, 0);
		TiandyVideo.CurObs = _ObsArr[0];

		for (var i = 0; i < g_iCurObsCount; i++) {
			if (g_ChannelInfo[i]['iObsID'] == TiandyVideo.CurObs) {
				g_iCurObsIndex = i;
				break;
			}
		}

		if (ret == 0) {
			return true;
		}
		else {
			return false;
		}
	}
	catch (e) {

	}
}

//	Change the monitor num.
function ChangeMonitorNum(num) {
	var TempObs = new Object;
	for (var i = 0; i < num; i++) {
		TempObs[i] = g_arrObs[i];
	}

	if (SetObsShow(TempObs) == true) {
		g_iCurMonitorCount = num;
	}
	//	RecordMonitorNum( g_iCurMonitorCount );
}

//	Initial monitor num.
function InitMonitorNum(num) {
	if (num > g_iCurObsCount)//add window 
	{
		ChangeObsNum(num);
	}
	for (var i = 0; i < num; i++) {

		g_arrObs[i] = parseInt(g_ChannelInfo[i]['iObsID']);
	}
}


//	Event for unload html
function UnLoadHtml() {
	try {
		TiandyVideo.Commander(Sys_Cleanup_Cmd, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	}
	catch (e) {
	}
}

function GetLogonStatus(iLoginID)//获取该设备的登录状态
{
	//	result \n iLoginStatus
	var iTempLoginID = parseInt(iLoginID);
	var sTemp = TiandyVideo.Commander(Entry_LoginStatus_Get, iTempLoginID, 0, 0, 0, 0, 0, 0, 0, 0);
	var arrResult = sTemp.split('\n')[1].split(g_splitCode);

	iLogonStatus = parseInt(arrResult[0]);
	if (LOGON_SUCCESS == iLogonStatus) {
		return true;
	}
	else {
		return false;
	}
}

function Sleep(n) {
	var start = new Date().getTime();
	while (true) {
		if ((new Date().getTime() - start) > n) {
			break;
		}
	}
}


// 登出录像机
function Logoff(nvsID){
	var nvs_logoff = TiandyVideo.Commander(Entry_Logoff_Cmd, nvsID, 0, 0, 0, 0, 0, 0, 0, 0).split('\n');
}


// 关闭视频窗口
function CloseObs(obsID) {
	obsID = parseInt(obsID);
	console.log("closing " + obsID);
	var closed = TiandyVideo.Commander(Obs_Remove_Cmd, obsID, 0, 0, 0, 0, 0, 0, 0, 0).split('\n');
	Logoff(0);
}

// 关闭所有视频窗口

function closeAllObs(){
	for (i = 0; i < g_Active_Obs.length; i++) {
		console.log("窗口数组的ID:" + g_Active_Obs[i]);
		CloseObs(g_Active_Obs[i]);
	}
	g_Active_Obs = [];
}

function StartVideo(proxyIP, hostIP, username, pwd, iPort, iChan, iStream, iObsID) {
	//	Login
	var sProxyIP = proxyIP;
	var sHostIP = hostIP;
	var sUserNmae = username;
	var sPassword = pwd;
	var iPort = parseInt(iPort);
	var iChannelNum = parseInt(iChan);
	var iStreamNO = parseInt(iStream);
	var iDelayNum = 0;
	var iMode = NETMODE_TCP;
	var sLogon = TiandyVideo.Commander(Entry_Logon_Cmd, sProxyIP, sHostIP, sUserNmae, sPassword, "", iPort, 0, 0, 0).split('\n');
	if (sLogon[0] != 0) {
		alert("Login failed");
		return;
	}

	// 登录信息
	// console.log("login info: ");
	// console.log(sLogon);

	g_iLoginID = parseInt(sLogon[1]);

	// // 打印 ID
	// console.log("ID: " + g_iLoginID);
	// console.log(sLogon);

	// 获取登录设备属性
	// var sLogonProp = TiandyVideo.Commander(Entry_Prop_Get, g_iLoginID, 0, 0, 0, 0, 0, 0, 0, 0);

	// console.log("登录设备信息:");
	// console.log(sLogonProp);
	// console.log(typeof (sLogonProp));

	// var sLogonInfo = TiandyVideo.Commander(Entry_NVSList_Get, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	// console.log(sLogonInfo);


	// console.log(sLogonProp[5]);
	// ChangeMonitorNum(parseInt(sLogonProp[5]));
	// 窗口属性
	// var windowProp = TiandyVideo.Commander(Obs_Prop_Get, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	// console.log(windowProp);


	iCurLogon = parseInt(sLogon[1]);

	var iTimes = 50;
	var bLoginStatus = false;
	while (iTimes--) {
		bLoginStatus = GetLogonStatus(iCurLogon);
		if (bLoginStatus) {
			break;
		}
		else {
		}
		Sleep(200);
	}
	//Sleep(5000);
	var bLoginStatus = true;
	//	Play video

	// 添加一个新窗口
	var newObs = TiandyVideo.Commander(Obs_Add_Cmd, 0, 0, 0, 0, 0, 0, 0, 0, 0).split('\n');
	// 获取新窗口的ID
	// console.log("New OBSID: " + newObs[1]);
	// 记录窗口id
	g_Active_Obs.push(newObs[1]);
	console.log(g_Active_Obs);

	// 将当前窗口设为新添加的窗口
	TiandyVideo.CurObs = newObs[1];

	if (bLoginStatus) {
		//	login success
		// var a = TiandyVideo.Commander(Obs_StartRealTime_Cmd, TiandyVideo.CurObs, iCurLogon, iChannelNum, iStreamNO, 20 * iDelayNum, iDelayNum, iMode, 0, 0).split('\n');
		var a = TiandyVideo.Commander(Obs_StartRealTime_Cmd, TiandyVideo.CurObs, iCurLogon, iChannelNum, iStreamNO, 20 * iDelayNum, iDelayNum, iMode, 0, 0).split('\n');
	}
	else {
		//	login failed
		return;
	}
}

//	start play video from the 'hostIP'
/**
 * 
 * @param {*} proxyIP 
 * @param {*} hostIP 
 * @param {*} username 
 * @param {*} pwd 
 * @param {*} iPort 
 * @param {*} iChan 硬盘录像机下摄像头. 0为默认第一个, 1为第二个 西川计量站只有两个摄像头
 * @param {*} iStream 码流. 0为主码流最高清,1为副码流
 */
function StartView(proxyIP, hostIP, username, pwd, iPort, iChan, iStream) {
	//	Login
	var sProxyIP = proxyIP;
	var sHostIP = hostIP;
	var sUserNmae = username;
	var sPassword = pwd;
	var iPort = parseInt(iPort);
	var iChannelNum = parseInt(iChan);
	var iStreamNO = parseInt(iStream);
	var iDelayNum = 0;
	var iMode = NETMODE_TCP;

	var sLogon = TiandyVideo.Commander(Entry_Logon_Cmd, sProxyIP, sHostIP, sUserNmae, sPassword, "", iPort, 0, 0, 0).split('\n');
	if (sLogon[0] != 0) {
		alert("Login failed");
		return;
	}
	g_iLoginID = parseInt(sLogon[1]);
	iCurLogon = parseInt(sLogon[1]);

	var iTimes = 50;
	var bLoginStatus = false;
	while (iTimes--) {
		bLoginStatus = GetLogonStatus(iCurLogon);
		if (bLoginStatus) {
			break;
		}
		else {
		}
		Sleep(200);
	}

	//Sleep(5000);
	var bLoginStatus = true;
	//	Play video
	if (bLoginStatus) {
		//	login success
		var a = TiandyVideo.Commander(Obs_StartRealTime_Cmd, TiandyVideo.CurObs, iCurLogon, iChannelNum, iStreamNO
			, 20 * iDelayNum, iDelayNum, iMode, 0, 0).split('\n');
	}
	else {
		//	login failed
		return;
	}
}




function GetArgsFromHref(sHref, sArgName) {
	var args = sHref.split("?");
	var retval = "";

	//null param
	if (args[0] == sHref) {
		return retval;
	}
	var str = args[1];
	args = str.split("&");
	for (var i = 0; i < args.length; i++) {
		str = args[i];
		var arg = str.split("=");
		if (arg.length <= 1) continue;
		if (arg[0] == sArgName) retval = arg[1];
	}
	return retval;
}

