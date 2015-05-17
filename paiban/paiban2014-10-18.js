//
newFolder = "";
newLI = "";
newMemo = "";
//保存图片

function savepic() {
	var jdata = [];
	$("#picbox li:not('.ui-state-highlight')").each(function(i, val) {
		if ($(val).find("img").attr("bigsrc") == "undefined") {
			alert(0);
			return true;
		}
		var row = {};
		row.url = $(val).find("img").attr("bigsrc");
		row.alt = $(val).find("img").attr("alt");
		if ($(val).find(".text").text() !== $(val).find("img").attr("alt")) {
			row.name = $(val).find(".text").text();
		}
		if ($(val).attr("fenlei") && $(val).attr("fenlei") !== "未分类") {
			row.fenlei = $(val).attr("fenlei");
		}
		
		if ($(val).attr("ext") !== undefined) {
			row.ext = $.trim($(val).attr("ext"));
		}
		if ($(val).attr("title") !== undefined) {
			row.title = $.trim($(val).attr("title"));
		}
		jdata.push(row);
	});
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "savepic",
			catid: thecatid,
			id: theid,
			json: $.toJSON(jdata)
		},
		dataType: "text",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
		},
		success: function(data, textStatus) {}
	});
}
//保存文件夹
function savefolder() {
	var jdata = [];
	$("#foldersbox li").each(function(i, val) {
		var row = {};
		row.name = $(this).attr("name");
		jdata.push(row);
	});
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "savefolder",
			catid: thecatid,
			id: theid,
			json: $.toJSON(jdata)
		},
		dataType: "text",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.error("错误："+errorThrown);
			},
		success: function(data, textStatus) {
			console.info("信息："+data);
			}
	});
}
//获取产品图片

function getpic() {
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "getpic",
			catid: thecatid,
			id: theid
		},
		dataType: "json",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
		},
		success: function(data, textStatus) {
			$.each(data, function(i, val) {
				addpic(val.url, val.name, val.alt, val.fenlei, val.title, val.ext);
			});
			newMemo = "<ul>" + newMemo + "</ul>";
			$("#picbox").append(newLI);
			$("#memos").append(newMemo);
			newMemo = "";
			newLI = "";
			after();
		}
});
}
//增加图片
function addpic(url, name, alt, fenlei, title, ext) {
	var a = "<li class='ui-corner-all' ";
	if (typeof(fenlei) == "undefined"){
		a += " fenlei='未分类'";
	} else {
		a += " fenlei='" + fenlei + "'";
	}
	if (title !== undefined && $.trim(title) !== "") {
		a += " title='" + title + "'";
		var memo = "<li rel=" + url + ">" + title + "</li>";
	}
	if (ext !== undefined && $.trim(ext) !== "") {
		a += " ext='" + ext + "'";
	}
	a += "><div class='photo'>";
	var thumb = url.replace(/[^\/]*[\/]+/g, '');
	thumb = url.replace(thumb, "thumb_160_140_" + thumb);
	var img = "<img src='" + thumb + "' bigsrc='" + url + "' alt='" + alt + "' />";
	var text = "<div class='text'>"
	if (name) {
		text += name;
	} else {
		text += alt;
	}
	text += "</div>";
	var b = "</div></li>"
	var allpic = a + img + text + b;
	newLI += allpic;
	if (memo !== undefined) {
		newMemo += memo;
	}
}

//建立备注列表
function BuildMemoList() {
	var obj = $("#picbox li[title]:not([title=''])");
	$("#memos").html("");
	var tempmemo = "";
	$(obj).each(function(index, element) {
		tempmemo += "<li rel=" + $(this).find('img').attr('bigsrc') + ">" + $(this).attr("title") + "</li>";
	});
	$("#memos").append(tempmemo);
	$("#allnotes .bubble").text($("#memos li").size());
}

//文件夹接受拖放
function FolderDroptable(){
	$("#foldersbox li").droppable({
		accept: "#picbox li",
		hoverClass: "folderdrop",
		tolerance: "pointer",
		drop: function(event, ui) {
			ui.draggable.attr("fenlei", $(this).attr("name"));
			$("#picbox .selected").attr("fenlei", $(this).attr("name"));
			ui.draggable.hide();
			$("#picbox .selected").hide();
			refreshbubble();
			RefreshFenleiProgress();
			savepic();
		}
	});
	}

//文件夹可编辑	
function MakeFolderEditable(obj) {
	$(obj).editable({
		editby: "click",
		type: "text",
		submitBy: "blur",
		onSubmit:function(){
			var oldname=$(this).closest("li").attr("name");
			var newname=$(this).text();
			if($(this).text()==""){		//	如果空名称
				$(this).closest(".text").text(oldname);
				return false;}
			if(CheckFolderName()){
				$("#picbox li[fenlei='"+oldname+"']").attr("fenlei",newname);
				$("#foldersbox .selected").attr("name",newname);
				savefolder();
				savepic();
			} else {
				$(this).closest(".text").text(oldname);
				alert("重名文件夹");
			}
		}
				});
}
//图片可编辑
  function MakePicEditable(obj) {
	$(obj).editable({
			editby: "click",
			type: "text",
			submitBy: "blur",
			onSubmit:function(){
				//if(Checkname()){
				savepic();
				RefreshRenameProgress();
				//}
        	}
			});
}


//备注列表可点击
function MakeMemolistClickable(){
	$("body").on('click', '#memos li',
	function() {
		var obj = GetObjFromSrc($(this).attr("rel"));
		Dialoger($(obj));
	});
	}
//获取历史记录
function gethistory() {
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "gethistory",
			id: theid
		},
		dataType: "json",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
		},
		success: function(data, textStatus) {
			$.each(data,
			function(i, val) {
				addhistory(val.id, val.time, val.kind, val.pics, val.folder);
			});
		}
	});
}
//删除图片
function delpic(picobj) {
	if ($(picobj).attr("fenlei") == "回收站") {
		return false;
	}
	$(picobj).attr("fenlei", "回收站");
	savepic();
	$(picobj).hide();
	refreshbubble();
	RefreshFenleiProgress();
}

//删除文件夹
function delfolder(folderobj) {
	$("#picbox li[fenlei='" + $(folderobj).find(".text").text() + "']").attr("fenlei", "回收站");
	$(folderobj).remove();
	$("#picbox li").hide();
	ResizeFoldersbox();
	savefolder();
	savepic();
	refreshbubble();
	
}
//获取文件夹
function getfolder() {
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "getfolder",
			catid: thecatid,
			id: theid
		},
		dataType: "json",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
		},
		success: function(data, textStatus) {
			$.each(data,
			function(i, val) {
				addfolder(val.name);
			});
			$("#addfolder").before(newFolder);
			newFolder = "";
			ResizeFoldersbox();
			MakeFolderEditable($("#foldersbox .text"));
			FolderDroptable();
			getpic();
		}
	});
}
//新建文件夹
function addfolder(name) {
	if (name == "回收站") {
		return false;
	}
	if (name == "未命名") {
		return false;
	}
	var tempfolder;
	var a = "<li class='ui-corner-all' name='";
	var b = "'><div class=text>";
	var c = "新建文件夹";
	var d = "</div><div class='bubble'>0</div></li>";
	if (name !== undefined) {
		tempfolder = a + name + b + name + d;
		newFolder += tempfolder;
	} else {
		tempfolder = a + c + b + c + d;
		$("#addfolder").before(tempfolder);
		selfolder($("#foldersbox li:last"));
		MakeFolderEditable($("#foldersbox .text:last"));
		FolderDroptable();
	}
};
//添加历史记录
function addhistory(addtime, kind, pic, folder) {
	$("#historylist ul").append("<li></li>");
	$("#picbox img:last").attr("src", url);
	$("#picbox img:last").attr("alt", alt);
	if (name) {
		$("#picbox .text:last").text(name);
	} else {
		$("#picbox .text:last").text(alt);
	}
	if (typeof(fenlei) == undefined) {
		$("#picbox li:last").attr("fenlei", "未分类");
	} else {
		$("#picbox li:last").attr("fenlei", fenlei);
	}
}


//检查文件名
function Checkname() {
	var x=true;
	$("#picbox li").not(".selected").each(function(index, element) {
		var othername = $(this).find(".text").text();
		var thisname = $("#picbox .selected").find(".text").text();
		if (othername == thisname) {
			//$("#picbox .selected").find(".text").text($("#picbox .selected img").attr("alt"));
			//x=false;
		}
	});
	return x;
}
//检查文件夹名
function CheckFolderName() {
	var x=true;
	$("#foldersbox li").not(".selected").each(function(index, element) {
		if ($(this).find(".text").text() == $("#foldersbox li.selected").find(".text").text()) {
			 x=false;
		}
	});
	return x;
}



//演示大图函数
function Dialoger(obj) {
	$("body").append("<div id='dialog'></div>");
	$("#dialog").append($("#dialog_content").html());
	MakeNextShow(obj);
	var s = new GetSlide(obj);
	var d = dialog({
		id: 'mydialog',
		title: s.title,
		width: 950,
		padding: 0,
		quickClose: false,
		content: $("#dialog"),
		button: [{
			value: '上一张',
			callback: function() {
				MakeNextShow(s.pre());
				d.title($(s.obj()).find(".text").text());
				d.reset();
				return false;
			},
			autofocus: true
		},
		{
			value: '下一张',
			callback: function() {
				MakeNextShow(s.next());
				d.title($(s.obj()).find(".text").text());
				d.reset();
				return false;
			},
			autofocus: true
		}]
	});
	d.reset();
	d.showModal();
}

//制作下一张幻灯
function MakeNextShow(obj) {
	var t = new GetSlide(obj);
	$("#dialog .dia_img").attr("src", t.src);
	pimsize(t.img, 600, 600);
	var img = new Image();
	img.src = t.bigsrc;
	img.onload = function() {
		$("#dialog .dia_img").attr("src", t.bigsrc);
	}
	var obj2 = $("#picbox li:visible");
	if ($(obj2).size() < 2) {
		obj2 = $("#picbox li");
	}
	var truesrc2 = $("#dialog .dia_img").attr("src");
	var thisobj2;
	if (truesrc2.indexOf("thumb_160_140_") > 0) {
		thisobj2 = obj2.has("img[src='" + truesrc2 + "']");
	} else {
		thisobj2 = obj2.has("img[bigsrc='" + truesrc2 + "']");
	}	//信息
	$("#dialog .dia_title").val(t.title);			//标题
	$("#dialog .note").val($(obj).attr("title"));	//备注
	$("#dialog .dia_ext").val($(obj).attr("ext"));	//规格
	$("#dialog .dia_ul").html("");
	$("#dialog .dia_ul").append("<li><a href='#'><span>未分类</span></a></li>");
	$("#foldersbox .text").each(function(index, element) {
		$("#dialog .dia_ul").append("<li><a href='#'><span>" + $(this).text() + "</span></a></li>");
		if ($("#dialog .dia_ul li:last").text() == $(obj).attr("fenlei")) {
			$("#dialog .dia_ul li:last").addClass("checked");
		}
	});

	
	//提前载入下一张幻灯
	var nextimg = new Image();
	nextimg.src=$(t.next()).find("img").attr("bigsrc");
}

//获取下一张内容
function GetSlide(me) {
	var thisobj;
	var prevobj;
	var nextobj;
	var allobj;
	var truesrc;
	this.me = me;	//返回幻灯原始对象;
	this.title=$(me).find(".text").text();		//返回标题
	this.src=$(me).find("img").attr("src");		//图片路径
	this.fenlei=$(me).attr("fenlei");			//分类
	this.img=$(me).find("img");					//图片对象
	this.memo=$(me).attr("title");				//备注
	this.ext=$(me).attr("ext");					//规格
	this.bigsrc=$(me).find("img").attr("bigsrc");		//大图地址

	//刷新显示列表内容
	this.reget = function() {
		truesrc = $("#dialog .dia_img").attr("src");
		allobj = $("#picbox li:visible");
/*		if ($(allobj).size() < 2) {
			allobj = $("#picbox li");
		}*/
		if (truesrc.indexOf("thumb_160_140_") > 0) {
			thisobj = $(allobj).has("img[src='" + truesrc + "']");
		} else {
			thisobj = $(allobj).has("img[bigsrc='" + truesrc + "']");
		}
	}
	//当前幻灯在列表中的原始对象
	this.obj = function() {
		this.reget();
		return $(thisobj);
	}
	//上一个对象
	this.pre = function() {
		this.reget();
		var preobj;
		if (($(allobj).index($(thisobj)) - 1) < 0) {
			preobj= $(allobj).eq($(allobj).size() - 1);
		} else {
			preobj= $(allobj).eq($(allobj).index($(thisobj)) - 1);
		}
		return preobj;
	}
	//下一个对象
	this.next = function() {
		this.reget();
		if (($(allobj).index($(thisobj)) + 1) >= $(allobj).size()) {
			return $($(allobj).eq(0));
		} else {
			return $(allobj).eq($(allobj).index($(thisobj)) + 1);
		}
	}
}

//调整幻灯上图片尺寸
function pimsize(imgname, widths, heights)
 {
	var w;
	var h;
	w = $(imgname).width();
	h = $(imgname).height();
	if (w > h)
	 {
		var multiple = w / widths;
		h = h / multiple;
		w = widths;
	}
	if (h > w)
	 {
		var multiple = h / heights;
		w = w / multiple;
		h = heights;
	}
	if (w !== 0) {
		$("#dialog .dia_img").attr("width", w);
	}
	if (h !== 0) {
		$("#dialog .dia_img").attr("height", h);
	}
}

//提前载入图片
function PreloadImg(src) {
	var img = new Image();
	img.src = src;
}

//刷新重命名进度
function RefreshRenameProgress() {
	var named = 0;
	var a = $("#picbox li").size();
	$("#picbox li").each(function(index, element) {
		var b = $(this).find("img").attr("alt");
		var c = $(this).find(".text").text();
		if (b !== c) {
			named++
		}
	});
	var rename = Math.floor(named * 100 / a);
	$("#norename .bubble").text(a - named);
	$('#myStat').empty();
	if (rename == 100) {
		$("#myStat").data("text", "完成");
	} else {
		$('#myStat').data("text", rename + "%");
	}
	$('#myStat').data("percent", rename);
	$('#myStat').circliful();
}
//刷新分类进度
function RefreshFenleiProgress() {
	var fenleied = 0;
	var a = $("#picbox li").size();
	var b = $("#picbox li[fenlei!='未分类']").size();
	var fenleied = Math.floor(b * 100 / a);
	$('#myStat2').empty();
	if (fenleied == 100) {
		$("#myStat2").data("text", "完成");
	} else {
		$("#myStat2").data("text", fenleied + "%");
	}
	$("#myStat2").data("percent", fenleied);
	$("#myStat2").circliful();
	RefreshGuigeProgress();
}
//刷新规格进度
function RefreshGuigeProgress() {
	var guige = 0;
	var a = $("#picbox li").size();
	var b = $("#picbox li:not([ext][ext!=''])").size();
	var guige = (a - b) * 100 / a;
	var guige = Math.floor(guige);
	$('#myStat3').empty();
	if (guige !== 0) {
		$("#myStat3").show()
		 if (guige == 100) {
			$("#myStat3").data("text", "完成");
		} else {
			$("#myStat3").data("text", guige + "%");
		}
		$("#myStat3").data("percent", guige);
		$("#myStat3").circliful();
	} else {
		$("#myStat3").hide()
	}
}


//选中文件夹
 function selfolder(obj) {
	$("#foldersbox li.selected").removeClass("selected");
	$("#picbox li.selected").removeClass("selected");
	$(obj).addClass("selected");
}
//选中图片
function selpic(obj) {
	var objindex = $("#picbox li:visible").index(obj);
	var selindex = $("#picbox li:visible").index($("#picbox .selected"));
	if (key.ctrl) {
		$(obj).toggleClass("selected");
	} else if (key.shift) {
		if (objindex > selindex) {
			for (var i = selindex + 1; i <= objindex; i++)
			 {
				$("#picbox li:visible").eq(i).addClass("selected");
			}
		} else {
			for (var i = objindex; i < selindex + 1; i++)
			 {
				$("#picbox li:visible").eq(i).addClass("selected");
			}
		}
	} else {
		$("#picbox li").removeClass("selected");
		$(obj).addClass("selected");
	}
}
//刷新统计气泡
function refreshbubble() {
	$("#foldersbox li").each(function(i) {
		$(this).find(".bubble").text($("#picbox li[fenlei='" + $(this).find(".text").text() + "']").size());
	});
	$("#allfolder .bubble").text($("#picbox li:not('.ui-state-highlight')").size());
	$("#nofenlei .bubble").text($("#picbox li[fenlei='未分类']").size());
	$("#recycle .bubble").text($("#picbox li[fenlei='回收站']").size());
}
//刷新备注气泡
function RefreshMemoBuble() {
	$("#allnotes .bubble").text($("#memos li").size());
}
//从幻灯图片路径获取对应图片对象
function GetObjFromSrc(src) {
	var obj = $("#picbox .photo img[bigsrc='" + src + "']").parentsUntil("li").parent();
	return $(obj);
}

//调整文件夹栏宽度
function ResizeFoldersbox() {
	var x = ($("#foldersbox li").size() + 2) * 114 - 80;
	$("#foldersbox").width(x);
	$("#foldermain").mCustomScrollbar({
		axis: "x",
		theme: "minimal-dark",
		mouseWheel: {
			preventDefault: true
		},
		scrollAmount: 1,
		advanced: {
			autoExpandHorizontalScroll: true,
			updateOnBrowserResize: true,
			updateOnContentResize: true,
			autoExpandHorizontalScroll: true
		},
		scrollInertia: 0,
		autoExpandScrollbar: true,
	});
	$("#foldermain").mCustomScrollbar("update");
}




function getFileName(str) {
	var reg = /[^\/]*[\/]+/g;
	str = str.replace(reg, '');
	return str;
}

function MakePicsSortable(){
	//图片可排序
$("#picbox").sortable({
	connectWith: "#picbox",
	items: "> li:visible",
	placeholder: "ui-state-highlight ui-corner-all",
	cursor: "move",
	revert: 200,
	tolerance: "pointer",
	opacity: 0.5,
	activate: function(event, ui) {},
	sort: function(event, ui) {},
	update: function(event, ui) {
		savepic();
	}
});
	}

$(document).ready(function(){

MakePicsSortable();
//文件夹可排序
$("#foldersbox").sortable({
	cursor: "move",
	opacity: 0.5,
	distance: 10,
	revert: true,
	cursor: "move",
	update: function(event, ui) {
		savefolder();
	}
});
	//文件夹点击时
	$("#foldersbox").on("click", "li,input",
		function(event) {
			if($(event.target).html()!=="<input>"){
				selfolder(this);
				$("#picbox li").hide();
				var sss = $(this).find(".text").text();
				var sss2 = $("#picbox li[fenlei='" + sss + "']");
				sss2.show();
			} else {
				event.preventDefault();
				}
		
	});
	
	
	//文件夹编辑文件名时失去焦点后处理
/*	$("#foldersbox").on("blur", "input",function (){
		var oldname=$(this).closest("li").attr("name");
		var newname=$(this).val();
		if($(this).val()==""){		//	如果空名称
			$(this).closest(".text").text(oldname);
			return false;}
		console.info("信息："+CheckFolderName());
		if(CheckFolderName()){
			$("#picbox li[fenlei='"+oldname+"']").attr("fenlei",newname);
			$("#foldersbox .selected").attr("name",newname);
			savefolder();
			savepic();
		} else {
			$(this).closest(".text").text(oldname);
			alert("重名文件夹");
			}
	});*/
	
	//文件夹编辑文件名时选中它
	$("#foldersbox").on("keypress", "input",
	function() {
		selfolder($(this).closest("li"));
	});
	
	//图片文本框失去焦点
 // $("#picbox").on("blur", "input",function (event){
	  	//console.info("信息："+$(event.currentTarget).val());
		//$(event.currentTarget).parent(".text").text($(event.currentTarget).val());
		//MakePicEditable($(event.currentTarget).parent(".text"));
		//Checkname();
		//savepic();
		//RefreshRenameProgress();
	//});
	//单击图片选中
	$("#picbox").on("click", ">li",
	function(event) {
		selpic(this);
	});
	
	//双击图片时显示幻灯
	$("#picbox").on("dblclick", "li",
	function() {
		$("#dialog").show();
		Dialoger(this);
	});

//文本框内回车的时候失去焦点
$("body").on('keypress','input',
	function(e) {
		if (e.which == 13) {
			$("input").blur();
		}
});
//幻灯窗口修改产品名称时
$("body").on('blur','.dia_title',
function() {
	$("#picbox li .photo img[bigsrc='" + $("#dialog .dia_img").attr("src") + "']").next().text($(this).val());
	savepic();
	RefreshRenameProgress();
});
//幻灯片修改规格时
$("body").on('blur','.dia_ext',
function() {
	GetObjFromSrc($("#dialog .dia_img").attr("src")).attr("ext", $(this).val());
	RefreshGuigeProgress();
	savepic();
});
//未命名进度点击时
$("#myStat").on('click',
function() {
	$("#norename").trigger("click");
});
//未分类进度点击时
$("#myStat2").on('click',
function() {
	$("#nofenlei").trigger("click");
});

//规格完成进度点击时
$("#myStat3").on('click',
function() {
	$("#foldersbox .selected").removeClass("selected");
	$("#picbox li").hide();
	$("#picbox li:not([ext][ext!=''])").show();
});

$('body').on('mousewheel',"#dialog",
	function(event, delta) {
		if (delta > 0) {
			$(".ui-dialog-footer button:contains('上一张')").trigger('click');
		} else if (delta < 0) {
			$(".ui-dialog-footer button:contains('下一张')").trigger('click');
		}
		event.stopPropagation();
		event.preventDefault();
	});
//幻灯中直接分类
$("body").on('click','#dialog li',
function() {
	$("#dialog li").removeClass("checked");
	$(this).addClass("checked");
	var obj = $("#picbox li .photo img[bigsrc='" + $("#dialog .dia_img").attr("src") + "']").parentsUntil("li").parent();
	$(obj).attr("fenlei", $(this).text());
	savepic();
	refreshbubble();
	var selfenlei = $("#foldersbox .selected").attr("name");
	if (selfenlei == undefined) {
		if ($(obj).attr("fenlei") == "未分类") {
			obj.show();
		} else {
			obj.hide();
		}
	} else {
		if ($(obj).attr("fenlei") == selfenlei) {
			obj.show();
		} else {
			obj.hide();
		}
	}
});

$("body").on('blur',"#dialog .note",
function() {
	var obj = $("#picbox li .photo img[bigsrc='" + $("#dialog .dia_img").attr("src") + "']").parentsUntil("li").parent();
	$(obj).attr("title", $(this).val());
	BuildMemoList();
	savepic();
});

//点击新建文件夹按钮
$("#addfolder").on("click",
function() {
	$("#foldersbox input").blur();
	addfolder();
	ResizeFoldersbox();
	$("#foldermain").mCustomScrollbar("update");
	$("#foldersbox li:last .text").trigger("click");
	selfolder($("#foldersbox li:last"));
	$("#foldersbox li:last input").select();
});
//点击回收站按钮
$("#recycle").on("click",
function() {
	$("#picbox li").hide();
	$("#picbox li[fenlei='回收站']").show();
});
//点击下载按钮
/*$("#downloadtxt").on("click",
function() {
	$("#showdown").text("");
	$("#foldersbox .text").each(function() {
		$("#showdown").append("<li><a href=/download.php?action=downfenlei&catid=" + thecatid + "&id=" + theid + "&item=" + $(this).text() + ">" + $(this).text() + "</a></li>")
	});
	$("#showdown").wrapInner("<ul></ul>");
	$("#showdown").wrapInner("<div id='downlist'></div>");
	var x = dialog({
		quickClose: true,
		padding: 0,
		content: $("#showdown").html(),
	});
	x.show(document.getElementById('downloadtxt'));
});*/
//点击备注按钮
$("#allnotes").on("click",
function() {
	var t = dialog({
		quickClose: true,
		padding: 0,
		content: $("#memoselect").html(),
	});
	t.show(document.getElementById('allnotes'));
});
//点击历史记录按钮
$("#history").on("click",
function() {
	$("#historylist").slideToggle("fast");
});
//点击未分类按钮
$("#nofenlei").on("click",
function() {
	$("#foldersbox .selected").removeClass("selected");
	$("#picbox li").hide();
	$("#picbox li[fenlei='未分类']").show();
});
//点击未命名按钮
$("#norename").on("click",
function() {
	$("#picbox li").hide();
	$("#picbox li").each(function(index, element) {
		var b = $(this).find("img").attr("alt");
		var c = $(this).find(".text").text();
		if (b == c) {
			$(this).show();
		}
	});
});
//所有文件夹按钮
$("#allfolder").on("click",
function() {
	$("#picbox li").show();
});

 $("#recycle").droppable({
		tolerance: "pointer",
		drop: function(event, ui) {
			if (ui.draggable.closest("div").attr("id") == "picbox") {
				delpic(ui.draggable);
			} else {
				delfolder(ui.draggable);
			}
		}
	});

 $("#nofenlei").droppable({
		accept: "#picbox li",
		tolerance: "pointer",
		drop: function(event, ui) {
			ui.draggable.attr("fenlei", "未分类");
			savepic();
			ui.draggable.hide();
			refreshbubble();
			RefreshFenleiProgress();
		}
	});
	key('ctrl+a',
function(e) {
	e.preventDefault();
	selpic($("#picbox li[fenlei='" + $('#foldersbox .selected').attr('name') + "']"));
});

key('del',
function() {
	if ($("#picbox .selected").size()) {
		delpic($("#picbox .selected"));
	} else {
		delfolder($("#foldersbox .selected"));
	}
});

getfolder();

});
function Init() {
	$("#topbox").stickUp();
	$("#nofenlei").trigger("click");
	$("#allfolder").button();
	$("#nofenlei").button();
	$("#norename").button();
	$("#recycle").button();
//	$("#downloadtxt").button();
	$("#allnotes").button();
	$("#main,#topbox").blurjs({
		source: "#div1",
		radius: 30,
		overlay: 'rgba(255,255,255,0.5)',
		draggable: true,
	});
	PreloadImg("/statics/images/paiban/folder-sel.png");
}
function after(){
	var myload=[
	Init(),
	//后续任务
	MakePicEditable($("#picbox div.text")),
	$("#thumbs").empty(),
	MakeMemolistClickable(),
	refreshbubble(),
	RefreshMemoBuble(),
	RefreshRenameProgress(),
	RefreshFenleiProgress(),
	$("#nofenlei").trigger("click")
	];

var haveload=function (){
	$(document).dequeue('at');
	}
$(document).queue('at',myload);
haveload();
	}