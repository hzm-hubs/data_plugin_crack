console.log("meta.js loaded");

const fieldsForm = [
	{
		groupName: "授权设置",
		keys: [
			{ key: "cozeToken", label: "授权码", default: "", placeholder: "请填写" },
		],
	},
	{
		groupName: "飞书设置",
		keys: [
			{ key: "appId", label: "appId", default: "", placeholder: "请填写" },
			{
				key: "feishuLink",
				label: "多维表链接",
				default: "",
				placeholder: "请填写您的飞书多维表链接",
			},
		],
	},
	{
		groupName: "钉钉设置",
		keys: [
			{
				key: "dingdingAppKey",
				label: "appKey",
				default: "",
				placeholder: "请填写",
			},
			{
				key: "dingdingLink",
				label: "多维表链接",
				default: "",
				placeholder: "请填写您的钉钉多维表链接",
			},
		],
	},
	{
		groupName: "淘宝设置",
		keys: [
			{ key: "tbSearchListNum", label: "搜索列表数", default: 100 },
			{ key: "tbCommentNum", label: "最大评论数", default: 100 },
			{ key: "tbAskNum", label: "最大问大家数", default: 50 },
		],
	},
	// {
	// 	groupName: "京东设置",
	// 	keys: [
	// 		{ key: "jdSearchListNum", label: "搜索列表数", default: 100 },
	// 		{ key: "jdCommentNum", label: "最大评论数", default: 100 },
	// 	],
	// },
	{
		groupName: "小红书设置",
		keys: [
			{ key: "xhsSearchListNum", label: "搜索列表数", default: 100 },
			{ key: "xhsCommentNum", label: "最大评论数", default: 100 },
			{ key: "xhsAskNum", label: "最大用户笔记数", default: 100 },
		],
	},
	{
		groupName: "抖音设置",
		keys: [
			{ key: "dySearchListNum", label: "搜索列表数", default: 100 },
			{ key: "dyCommentNum", label: "最大评论数", default: 100 },
			{ key: "dyVideoNum", label: "最大用户视频数", default: 100 },
		],
	},
];
