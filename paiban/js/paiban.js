//
//进度条加载
Pace.on("done", function (){
	after();
	});
newFolder = "";
newLI = "";
newMemo = "";
loc="http://"+window.location.host+"/uploadfile/";
console.log(loc);
Saved=true;
ifwheel=false;
Loaded=false;	//是否已全部加载完成。

//自动保存程序
function Saver(){
	if (!Saved){
		savepic();
		Saved=true;
		//$("#SaveBtn").removeClass("btn-success");
		//$("#SaveBtn").addClass("btn-default");
		$("#SaveBtn").attr("title","已保存");
		$("#SaveBtn").html("<i class='fa fa-check'> 就绪</i>");
		}
	}



//保存图片
function savepic() {
	//文件夹数组
	var fdata = [];
	$("#foldersbox li").each(function(i, val) {
		var frow = {};
		frow.name = $(this).find(".text").text();
		fdata.push(frow);
	});
	
	//图片数组
	var countpics=$("#picbox li:not('.ui-state-highlight')").size();
	if(countpics!==totalpics){
		alert("请刷新页面，否则可能会丢失信息。");
		return false;
		}
	var jdata = [];
	$("#picbox li:not('.ui-state-highlight')").each(function(i, val) {
		if ($(val).find("img").attr("bigsrc") == "undefined") {
			alert(0);
			return true;
		}
		var row = {};
		row.url=$(val).find("img").attr("bigsrc").replace(loc,'');
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
	
	var alldata = [];
	var allrow = {};
	allrow.folder=fdata;
	allrow.pics=jdata;
	alldata={"folder":fdata,"pics":jdata};
	
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "savepic",
			catid: thecatid,
			id: theid,
			json: $.toJSON(alldata)
		},
		dataType: "json",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
		},
		success: function(data, textStatus) {
			
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

	var myload=[
		$.each(data.folder, function(i, val) {
			addfolder(val.name,false);
			}),
		$("#addfolder").before(newFolder),
		newFolder = "",
		//生成图片
		$.each(data.pics, function(i, val) {
			addpic(val.url, val.name, val.alt, val.fenlei, val.title, val.ext);
		}),
		$("#picbox").append(newLI),
		newLI = "",
	];
	var haveload=function (){
		$(document).dequeue('at');
	}
	$(document).queue('at',myload);
	haveload();
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
	var img = "<img src='" +loc+ thumb + "' bigsrc='" +loc+ url + "' alt='" + alt + "' />";
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



//检查字符串是否在数组中，三个参数，在array中查找needle，bool为布尔量，如果为true则返回needle在array中的位置
function inArray(needle,array,bool){
	if(typeof needle=="string"||typeof needle=="number"){
	    var len=array.length;
		for(var i=0;i<len;i++){
			if(needle===array[i]){
				if(bool){
					return i;
				}
				return true;
			}
		}
		return false;
	}
}

//文件夹接受拖放
function FolderDroptable(){
	$("#foldersbox li").droppable({
		accept: "#picbox li",
		hoverClass: "folderdrop",
		tolerance: "pointer",
		drop: function(event, ui) {
			ui.draggable.attr("fenlei", $(this).find(".text").text());
			$("#picbox .active").attr("fenlei", $(this).find(".text").text());
			ui.draggable.hide();
			$("#picbox .active").hide();
			refreshbubble();
			RefreshFenleiProgress();
			RefreshRenameProgress();
			NotSave();
		}
	});
	}
//更改到未保存状态
function NotSave(){
	Saved=false;
	//$("#SaveBtn").removeClass("btn-default");
	//$("#SaveBtn").addClass("btn-success");
	$("#SaveBtn").attr("title","立即保存");
	$("#SaveBtn").html("<i class='fa fa-floppy-o'> 保存</i>");
	}

//文件夹可编辑	
function MakeFolderEditable(obj) {
	$(obj).editable({
		editby: "click",
		type: "text",
		submitBy: "blur",
		onSubmit:function(){
			var oldname=$(this).closest("li").find(".text").text();
			var newname=$(this).text();
			if($(this).text()==""){		//	如果空名称
				$(this).closest(".text").text(oldname);
				return false;}
			if(CheckFolderName()){
				$("#picbox li[fenlei='"+oldname+"']").attr("fenlei",newname);
				$("#foldersbox .active").attr("name",newname);
				NotSave();
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
				if($(this).text()==""){		//	如果空名称
				$(this).closest(".text").text("未命名");
				return false;}
				//if(Checkname()){
				NotSave();
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

//恢复历史记录
function RestoreHistory(hisid){
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "RestoreHistory",
			id:hisid
		},
		dataType: "json",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("载入历史记录时出错："+textStatus);
		},
		success: function(data, textStatus) {
			//清空当前文件夹和图片
			$("#foldersbox li").remove();
			$("#picbox").empty();
	var myload=[
		$.each(data.folder, function(i, val) {
			addfolder(val.name,false);
			}),
		$("#addfolder").before(newFolder),
		newFolder = "",
		//生成图片
		$.each(data.pics, function(i, val) {
			addpic(val.url, val.name, val.alt, val.fenlei, val.title, val.ext);
		}),
		$("#picbox").append(newLI),
		newLI = "",
		after(),
		NotSave(),
		$("#historyhelpBlock").text("历史记录恢复成功")
	];
	var haveload=function (){
		$(document).dequeue('at');
	}
	$(document).queue('at',myload);
	haveload();
		}
});
	}



//获取历史记录
function gethistory(page) {
	$.ajax({
		url: "/paiban.php",
		type: "POST",
		cache: false,
		data: {
			action: "gethistory",
			id: theid,
			thepage:page
		},
		dataType: "json",
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus);
		},
		success: function(data, textStatus) {
			$("#historylist tbody tr").not("tr:first").empty();
			$.each(data,
			function(i, val) {
				
				addhistory(val);
			});
		}
	});
}

//删除图片
function delpic(picobj) {
	if ($(picobj).attr("fenlei") == "回收站") {
		return false;
	}
	$("#picbox .active").attr("fenlei", "回收站");
	$("#picbox .active").hide();
	refreshbubble();
	RefreshFenleiProgress();
	RefreshRenameProgress();
	NotSave();
}

//删除文件夹
function delfolder(folderobj) {
	$("#picbox li[fenlei='" + $(folderobj).find(".text").text() + "']").attr("fenlei", "回收站");
	$(folderobj).remove();
	$("#picbox li").hide();
	ResizeFoldersbox();
	refreshbubble();
	NotSave();
	
}

//新建文件夹name:名称   action:false 加载时批量, true 单独增加
function addfolder(name,action) {
	if (name == "回收站") {
		return false;
	}
	if (name == "未命名") {
		return false;
	}
	var tempfolder;
	
	var a = "<li class='ui-corner-all'><div class=text>";
	var c = "新建文件夹";
	var d = "</div><div class='bubble'>0</div></li>";
	if (!action) {
		tempfolder = a + name + d;
		newFolder += tempfolder;
	} else {
		tempfolder = a + name + d;
		$("#addfolder").before(tempfolder);
		//selfolder($("#foldersbox li:last"));
		//MakeFolderEditable($("#foldersbox .text:last"));
		//FolderDroptable();
		//contactmenu();
	}
};
//添加历史记录
function addhistory(val) {
	$("#historylist").append("<tr><td>自动保存</td><td>"+val.time+"</td><td><button type='button' role='"+val.id+"' class='RestoreBtn btn btn-default btn-xs'><i class='fa fa-reply'></i> 恢复</button></td></tr>");	
}


//检查文件名
function Checkname() {
	var x=true;
	$("#picbox li").not(".active").each(function(index, element) {
		var othername = $(this).find(".text").text();
		var thisname = $("#picbox .active").find(".text").text();
		if (othername == thisname) {
			//$("#picbox .active").find(".text").text($("#picbox .active img").attr("alt"));
			//x=false;
		}
	});
	return x;
}
//检查文件夹名
function CheckFolderName() {
	var x=true;
	$("#foldersbox li").each(function(index, element) {
		if ($(this).find(".text").text() == $("#NewFolderName").val()) {
			 x=false;
			 return false;
		}
	});
	return x;
}


//演示大图函数
function Dialoger(obj) {
	//$("body").append("<div id='dialog'></div>");
	//$("#dialog").append($("#dialog_content").html());
	MakeNextShow(obj);
	var s = new GetSlide(obj);
	$("#SlideTitle").text(s.title);
	
/*	d = dialog({
		id: 'mydialog',
		title: s.title,
		width: 950,
		padding: 0,
		quickClose: false,
		content: $("#dialog"),
		statusbar:"<button id='SlideDel'><i class='fa fa-trash-o fa-lg'></i> 删除</button>",
		button: [{
			value: "<i class='fa fa-arrow-circle-o-left fa-lg'></i> 上一张",
			callback: function() {
				MakeNextShow(s.pre());
				d.title($(s.obj()).find(".text").text());
				d.reset();
				return false;
			},
			autofocus: false
		},
		{
			value: "下一张 <i class='fa fa-arrow-circle-o-right fa-lg'></i>",
			callback: function() {
				MakeNextShow(s.next());
				d.title($(s.obj()).find(".text").text());
				d.reset();
				
				return false;
			},
			autofocus: false
		}
		
		]
	});
	d.reset();
	d.showModal();*/
}

//制作下一张幻灯
function MakeNextShow(obj) {
	var t = new GetSlide(obj);
	$("#dia_img").attr("src", t.src);
	pimsize(t.img, 600, 600);
	var img = new Image();
	img.src = t.bigsrc;
	img.onload = function() {
		$("#dia_img").attr("src", t.bigsrc);
	}
	var obj2 = $("#picbox li:visible");
	if ($(obj2).size() < 2) {
		obj2 = $("#picbox li");
	}
	var truesrc2 = $("#dia_img").attr("src");
	var thisobj2;
	if (truesrc2.indexOf("thumb_160_140_") > 0) {
		thisobj2 = obj2.has("img[src='" + truesrc2 + "']");
	} else {
		thisobj2 = obj2.has("img[bigsrc='" + truesrc2 + "']");
	}	//信息
	$("#dia_title").val(t.title);			//标题
	$("#note").val($(obj).attr("title"));	//备注
	$("#dia_ext").val($(obj).attr("ext"));	//规格
	$("#dia_ul").html("");
	$("#dia_ul").append("<li><a href='#'><span>未分类</span></a></li>");
	$("#foldersbox .text").each(function(index, element) {
		$("#dia_ul").append("<li><a href='#'><span>" + $(this).text() + "</span></a></li>");
		if ($("#dia_ul li:last").text() == $(obj).attr("fenlei")) {
			$("#dia_ul li:last").addClass("checked");
		}
	});

	//$("#dia_title").focus();  //设置标题焦点
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
	//if(!this.title){this.title=$(me).attr("alt")}	//如果标题变成了空白，使用默认标题
	this.src=$(me).find("img").attr("src");		//图片路径
	this.fenlei=$(me).attr("fenlei");			//分类
	this.img=$(me).find("img");					//图片对象
	this.memo=$(me).attr("title");				//备注
	this.ext=$(me).attr("ext");					//规格
	this.bigsrc=$(me).find("img").attr("bigsrc");		//大图地址
	
	//刷新显示列表内容
	this.reget = function() {
		truesrc = $("#dia_img").attr("src");
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
	if (w >= h)
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
		$("#dia_img").attr("width", w);
	}
	if (h !== 0) {
		$("#dia_img").attr("height", h);
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
	var a = $("#picbox li").size()-$("#picbox li[fenlei='回收站']").size();
	$("#picbox li").each(function(index, element) {
		var b = $(this).find("img").attr("alt");
		var c = $(this).find(".text").text();
		if (b !== c&&$(this).attr("fenlei")!=="回收站") {
			named++;
		}
	});
	var rename = Math.floor(named * 100 / a);
	$("#norename .bubble").text(a - named);
	$('#myStat').empty();
	if (rename == 100) {
		$("#prg_name").text("完成");
	} else {
		$('#prg_name').text(rename + "%");
		}
	$('#prg_name').css("width", rename + "%");
	
}
//刷新分类进度
function RefreshFenleiProgress() {
	var fenleied = 0;
	var a = $("#picbox li").size();
	var b = $("#picbox li[fenlei!='未分类']").size();
	var fenleied = Math.floor(b * 100 / a);
	if (fenleied == 100) {
		$("#prg_item").text("完成");
	} else {
		$('#prg_item').text(fenleied + "%");
		}
	$('#prg_item').css("width", fenleied + "%");
	
}
//刷新规格进度
function RefreshGuigeProgress() {
	var guige = 0;
	var a = $("#picbox li").size()-$("#picbox li[fenlei='回收站']").size();
	var b = $("#picbox li:not([ext][ext!=''])").size()-$("#picbox li[fenlei='回收站']").size();
	var guige = (a - b) * 100 / a;
	var guige = Math.floor(guige);
		 if (guige == 100) {
			$("#prg_guige").text("完成");
		} else {
			$('#prg_guige').text(guige + "%");
			}
		$('#prg_guige').css("width", guige + "%");
}
//设置文件夹或图片过滤的已选中指示。
function ItemActive(item){
	$("#foldersbox .active").removeClass("active");
	$("#filter .active").removeClass("active");
	$("#recycle").removeClass("active");
	$(item).addClass("active");
	}

//选中文件夹
 function selfolder(obj) {
	ItemActive(obj);
}
//选中图片
function selpic(obj) {
	var objindex = $("#picbox li:visible").index(obj);
	var selindex = $("#picbox li:visible").index($("#picbox .active"));
	if (key.ctrl&& !key.isPressed("A")) {
		$(obj).toggleClass("active");
	} else if (key.shift) {
		if (objindex > selindex) {
			for (var i = selindex + 1; i <= objindex; i++)
			 {
				$("#picbox li:visible").eq(i).addClass("active");
			}
		} else {
			for (var i = objindex; i < selindex + 1; i++)
			 {
				$("#picbox li:visible").eq(i).addClass("active");
			}
		}
	} else {
		$("#picbox li").removeClass("active");
		$(obj).addClass("active");
	}
}
//刷新统计气泡
function refreshbubble() {
	$("#foldersbox li").each(function(i) {
		$(this).find(".bubble").text($("#picbox li[fenlei='" + $(this).find(".text").text() + "']").size());
	});
	$("#allfolder .bubble").text($("#picbox li:not('.ui-state-highlight')").size()-$("#picbox li[fenlei='回收站']").size());
	$("#nofenlei .bubble").text($("#picbox li[fenlei='未分类']").size());
	$("#recycle .bubble").text($("#picbox li[fenlei='回收站']").size());
	//回收站满了的样式
	if($("#picbox li[fenlei='回收站']").size()){
		$("#recycle img").attr("src","/statics/images/paiban/recycled.png");
		} else {
		$("#recycle img").attr("src","/statics/images/paiban/recycle.png");
			}
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
	var x = ($("#foldersbox li").size() + 2) * 114 - 40;
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

//幻灯详情页删除
function SlideDel(){
	var src=GetObjFromSrc($("#dia_img").attr("src"));
	var s = new GetSlide(src);
	SlideNext();
	delpic(s.pre());
	}

//跳到下一张
function SlideNext(){
		if(ifwheel){return false;}
		$("#dia_title,#dia_ext,#note").blur();
		$("#SlideNext").trigger('click');
		ifwheel=true;
		var t=setTimeout("ifwheel=false;",1000);
	}
//跳到上一张
function SlidePrev(){
		if(ifwheel){return false;}
		$("#dia_title,#dia_ext,#note").blur();
		$("#SlidePrev").trigger('click');
		ifwheel=true;
		var t=setTimeout("ifwheel=false;",1000);
		//event.stopPropagation();
		//event.preventDefault();
	}

function getFileName(str) {
	var reg = /[^\/]*[\/]+/g;
	str = str.replace(reg, '');
	return str;
}

function MakeBookSortable(){
	//图片可排序
$("#desk").sortable({
	connectWith: "#desk",
	items: "li:visible",
	placeholder: "ui-state-highlight ui-corner-all",
	cursor: "move",
	revert: 200,
	tolerance: "pointer",
	opacity: 0.5,
	sort: function( event, ui ) {},
	activate: function(event, ui) {},
	over: function(event, ui) {
		
		},
	update: function(event, ui) {
		//savepic();
		RefillPage(3,4);
	}
});
	}
//用户引导
function startIntro(){
        var intro = introJs();
          intro.setOptions({
            steps: [
              {
                element: '#toolbar',
                intro: "上面这排按钮可以看哪些没完成",
				position: 'bottom'
              },
              {
                element: '#addfolder',
                intro: "新建一个分类",
                position: 'right'
              },
              {
                element: '#foldersbox li',
                intro: '把图片拖放到文件夹可以分类',
                position: 'right'
              },
              {
				//element: '#picbox',
                intro: "前后拖动图片可以排序，双击看大图"
              },
              {
                element: '#progress',
                intro: '这里可以看到进度，点击可以看到没完成的',
				position: 'left'
              },
			  {
                element: '#guide',
                intro: "点这里再看一遍，或者完成",
                position: 'left'
              }
            ],
			nextLabel:"下一步 →",
			prevLabel:"← 上一步",
			skipLabel:"退出",
			doneLabel:"完成",
			exitOnEsc:true,
			exitOnOverlayClick:true,
			showStepNumbers:false,
			keyboardNavigation:true,
			showButtons:true,
			 bullets:false,
			 showProgress:false,
			 scrollToElement:true,
			 overlayOpacity:0.8,
			 disableInteraction:false
          });
          intro.start();
      }

function MakePicsSortable(){
	//图片可排序
		$("#picbox").sortable({
			connectWith: "#picbox",
			items: "li:visible",
			placeholder: "ui-state-highlight ui-corner-all",
			cursor: "move",
			revert: 100,
			tolerance: "pointer",
			opacity: 0.5,
			distance: 30,
			activate: function(event, ui) {},
			sort: function(event, ui) {},
			update: function(event, ui) {
				NotSave();
			}
		});
	}
function contactmenu(){

//文件夹菜单
        var menu = {};
        menu['new'] 			= {icon:'fa-folder-o',text:'新建文件夹',click:function(target,element){$("#addfolder").trigger("click");}};
        menu['rename'] 		= {icon:'fa-pencil-square-o',text:'重命名',click:function(target,element){
			selfolder(target);
			$("#ModalCreatFolder").modal('show');
			}};
        menu['del'] 			= {icon:'fa-times',text:'删除',click:function(target,element){delfolder(target);}};
        $('#foldersbox li').contextMenu(menu);
//文件夹空白区域点击
		var menu = {};
        menu['new'] 			= {icon:'fa-folder-o',text:'新建文件夹',click:function(target,element){$("#addfolder").trigger("click");}};
		$('#foldersbox').contextMenu(menu);
//图片上点击
/*        var menu = {};
		menu['open'] 			= {icon:'fa-folder-open-o',text:' 查看',click:function(target,element){$(target).trigger("dblclick");}};
        menu['del'] 			= {icon:'fa-times',text:'删除',click:function(target,element){delpic(target);}};
        $('#picbox li').contextMenu(menu);*/
	}
	
//标记任务进度
$(document).ready(function(){
	

	
	
//文件夹可排序
$("#foldersbox").sortable({
	cursor: "move",
	opacity: 0.5,
	distance: 40,
	revert: 100,
	zIndex: 999,
	cancel:"#addfolder",
	cursor: "move",
	update: function(event, ui) {
		//文件夹排序后把新建按钮放到最后
		if($("#addfolder").index()<$("#foldersbox li").size()){
				console.log(111);
			}
		NotSave();
	}
});
	//文件夹点击时
	$("#foldersbox").on("click", "li,input",
		function(event) {
			if($(event.target).html()!=="<input>"){
				selfolder(this);
				$("#picbox li").hide();
				$("#picbox li").removeClass("active");
				var sss = $(this).find(".text").text();
				var sss2 = $("#picbox li[fenlei='" + sss + "']");
				sss2.show();
			} else {
				event.preventDefault();
				}
		
	});
	
	
	//文件夹编辑文件名时失去焦点后处理
/*	$("#foldersbox").on("blur", "input",function (){
		var oldname=$(this).closest("li").find(".text").text();
		var newname=$(this).val();
		if($(this).val()==""){		//	如果空名称
			$(this).closest(".text").text(oldname);
			return false;}
		if(CheckFolderName()){
			$("#picbox li[fenlei='"+oldname+"']").attr("fenlei",newname);
			$("#foldersbox .active").attr("name",newname);
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
		//$("#dialog").show();
		//Dialoger(this);
		$('#dialog').modal('show');
		Dialoger(this);
	});
	
//历史记录对话框打开的时候
$('#ModalHistory').on('show.bs.modal', function (e) {
	 gethistory(1);
});


//新建文件夹输入框内回车的时候确定
$("body").on('keypress','#NewFolderName',
	function(e) {
		if (e.which == 13) {
			$("#folderok").trigger("click");
		}
});

//文本框内回车的时候失去焦点
$("body").on('keypress','input',
	function(e) {
		if (e.which == 13) {
			$("input").blur();
		}
});
//幻灯窗口修改产品名称时
$("body").on('change','#dia_title',
function() {
	$("#picbox li .photo img[bigsrc='" + $("#dia_img").attr("src") + "']").next().text($(this).val());
	$("#SlideTitle").text($(this).val());
	NotSave();
	RefreshRenameProgress();
});
//幻灯片修改规格时
$("body").on('change','#dia_ext',
function() {
	GetObjFromSrc($("#dia_img").attr("src")).attr("ext", $(this).val());
	RefreshGuigeProgress();
	NotSave();
});
//未命名进度点击时
$("#prg_name_div").on('click',
function() {
	$("#norename").trigger("click");
});
//未分类进度点击时
$("#prg_item_div").on('click',
function() {
	$("#nofenlei").trigger("click");
});

//点击保存按钮
$("#SaveBtn").on('click',
function() {
	if(!Saved){
		Saver();
		}
});


//规格完成进度点击时
$("#prg_guige_div").on('click',
function() {
	$("#foldersbox .active").removeClass("active");
	$("#picbox li").hide();
	$("#picbox li:not([ext][ext!=''])").show();
});

//历史记录面板点恢复按钮的时候
$("body").on('click',"#ModalHistory .RestoreBtn",
function() {
	RestoreHistory($(this).attr("role"));
});

//在详情中转滚轮的时候载入上一张下一张
$('body').on('mousewheel',"#dialog",
	function(event, delta) {
		if(ifwheel){return false;}
		if (delta > 0) {
			SlidePrev();
		} else if (delta < 0) {
			SlideNext();
		}
		event.preventDefault();
		ifwheel=true;
		var t=setTimeout("ifwheel=false;",1000);
	});

//在编辑详情时按pagedown跳到下一张
$('body').on('keypress',"#dialog",
	function(event) {
		switch(event.keyCode) {
			case 33:
				event.preventDefault();
				SlidePrev();
				break;
			case 34:
				event.preventDefault();
				SlideNext();
				break;
  		}
		
});

//幻灯中点击下一张按钮的时候
$("#SlideNext").on('click',function() {
	var obj=GetObjFromSrc($("#dia_img").attr("src"));
	var s = new GetSlide(obj);
	MakeNextShow(s.next());
	$("#SlideTitle").text($(s.obj()).find(".text").text());
});

//幻灯中点击上一张按钮的时候
$("#SlidePrev").on('click',function() {
	var obj=GetObjFromSrc($("#dia_img").attr("src"));
	var s = new GetSlide(obj);
	MakeNextShow(s.pre());
	$("#SlideTitle").text($(s.obj()).find(".text").text());
});

//幻灯中直接分类
$("body").on('click','#dialog li',
function() {
	$("#dialog li").removeClass("checked");
	$(this).addClass("checked");
	var obj = GetObjFromSrc($("#dia_img").attr("src"));
	$(obj).attr("fenlei", $(this).text());
	NotSave();
	refreshbubble();
	var selfenlei = $("#foldersbox .active").find(".text").text();
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

//搜索框键入内容时
$("body").on('keyup',"#Search",
function() {
	if($(this).val()==""){return false;}
	SearchTemp=$("#picbox li:visible");
	$("#picbox li:visible").hide();
	$("#picbox li:contains('"+$(this).val()+"')").show();
	$("#picbox li[ext*='"+$(recycle).val()+"']").show();
	$("#picbox li[title*='"+$(recycle).val()+"']").show();
});

//备注内容改变时
$("body").on('change',"#note",
function() {
	var obj = $("#picbox li .photo img[bigsrc='" + $("#dia_img").attr("src") + "']").parentsUntil("li").parent();
	$(obj).attr("title", $(this).val());
	BuildMemoList();
	NotSave();
});

//点击详情中的删除按钮
$("body").on('click',"#SlideDel",
function() {
	SlideDel();
});

//新建文件夹对话框弹出之前
$('#ModalCreatFolder').on('show.bs.modal', function (e) {
	if($("#foldersbox .active").size()>0){
		$("#CreatModalLabel").text("重命名文件夹");
		$("#CreatFolderLabel").text("新名称");
		$("#NewFolderName").val($("#foldersbox .active").find(".text").text());
	} else{
		$("#CreatModalLabel").text("新建文件夹");
		$("#CreatFolderLabel").text("文件夹名称");
		$("#NewFolderName").val("");
	}
	$("#helpBlock").text("");
});

//新建文件夹窗口显示出来后
$('#ModalCreatFolder').on('shown.bs.modal', function (e) {
	$("#NewFolderName").focus();
});

//点击历史记录的确定按钮
$("body").on('click',"#HistoryOk",
function() { //检查文件夹是否存在
	gethistory(1);
});


//点击新建文件夹对话框的确定按钮
$("body").on('click',"#folderok",
function() { //检查文件夹是否存在
	if($("#NewFolderName").val()==""){
		//空
		$("#ModalCreatFolder .modal-body .form-group").addClass("has-error");
		$("#helpBlock").text("名称不能为空");
		$("#NewFolderName").focus();
		return false;
		}
	//检查文件名重复
	if(!CheckFolderName()){
		$("#ModalCreatFolder .modal-body .form-group").addClass("has-error");
		$("#helpBlock").text("文件夹已存在");
		$("#NewFolderName").focus();
		return false;
	}
	//如果是重命名操作
	if($("#foldersbox .active").size()>0){
		var oldname=$("#foldersbox .active").find(".text").text();
		var newname=$("#NewFolderName").val()
		$("#picbox li[fenlei='"+oldname+"']").attr("fenlei",newname);
		$("#foldersbox .active").attr("name",newname);
		$("#foldersbox .active").find(".text").text(newname);
		NotSave();
		$("#ModalCreatFolder").modal('hide');
		return false;
		}
		
//新建文件夹操作
	addfolder($("#NewFolderName").val(),true);
	ResizeFoldersbox();
	$("#ModalCreatFolder .modal-body .form-group").removeClass("has-error");
	$("#NewFolderName").val("");
	$("#helpBlock").text("");
	FolderDroptable();
	contactmenu();
	NotSave();
	$("#ModalCreatFolder").modal('hide');
});


//点击新建文件夹按钮
$("#addfolder").on("click",
function() {
	$("#foldersbox .active").removeClass("active");
	$("#ModalCreatFolder").modal('show');
});
//点击回收站按钮
$("#recycle").on("click",
function() {
	ItemActive(this);
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
//点击帮助按钮
$("#guide").on("click",
function() {
	startIntro();
});


//点击预览按钮
$("#preview").on("click",
function() {
	CreatBook();

	/*$("#main").width("94%");
	var docH=$(document).height();
	var docW=$(document).width();
	$("#main").width(docW*0.9);
	var mainW=$("#main").width();
	$("#picbox").width(mainW);
	$("#picbox").height(mainW*0.736);
	var picH=$("#picbox").height();
	var picW=$("#picbox").width();
	$("#progress").hide();//隐藏统计
	$("#topbox").hide();//隐藏文件夹
	$("#picbox li").show();
	Fillpics(3,4);*/
});

//点击未分类按钮
$("#nofenlei").on("click",
function() {
	$("#foldersbox .active").removeClass("active");
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
		if (b == c&&$(this).attr("fenlei")!=="回收站") {
			$(this).show();
		}
	});
});


//过滤器加选中标记
$("#filter a").on("click",
function() {
	ItemActive(this);
	$(this).blur();
});

//所有文件夹按钮
$("#allfolder").on("click",
function() {
	$("#picbox li").hide();
	$("#picbox li[fenlei!='回收站']").show();
});
//拖放到回收站
 $("#recycle").droppable({
		tolerance: "pointer",
		accept: "#recycle",
		hoverClass:"recycledropclass",
		drop: function(event, ui) {
			if (ui.draggable.closest("div").attr("id") == "picbox") {
				delpic(ui.draggable);
			} else {
				delfolder(ui.draggable);
			}
		}
	});
//拖放到未分类按钮
 $("#nofenlei").droppable({
		accept: "#picbox li",
		tolerance: "pointer",
		drop: function(event, ui) {
			$("#picbox .active").attr("fenlei", "未分类");
			NotSave();
			$("#picbox .active").hide();
			refreshbubble();
			RefreshFenleiProgress();
			RefreshRenameProgress();
		}
	});
//全选功能
	key('ctrl+a',
function(e) {
	selpic($("#picbox li[fenlei='" + $('#foldersbox .active').attr('name') + "']"));
	e.preventDefault();
});

//按下删除键的时候
key('del',
function() {
if(!ifSlideShown){  //是否打开了详情页
		if ($("#picbox .active").size()) {
		delpic($("#picbox .active"));
		} else {
			delfolder($("#foldersbox .active"));
		}
		
	} else {
		SlideDel();
	}
});

//按下pagedown跳到下一张
key('pagedown',
function() {
	SlideNext();
});
//按下pageup跳到上一张
key('pageup',
function() {
	SlidePrev();
});

getpic();

});
function Init() {
	$("#nofenlei").trigger("click");
	loadimage();
	Saved=true;
	$("#Search").val("");
	thetimer=self.setInterval("Saver()",30000);
}
//集中预加载图像
function loadimage(){
	PreloadImg("/statics/images/paiban/folder-sel.png");
	PreloadImg("/statics/images/paiban/folder-hover.png");
	PreloadImg("/statics/images/paiban/recycled.png");
	PreloadImg("/statics/images/paiban/recycled-hover.png");
	}

function after(){
	var myload=[
	Init(),
	//后续任务
	//MakePicEditable($("#picbox div.text")),
	//$("#thumbs").empty(),
	MakeMemolistClickable(),
	$("#nofenlei").trigger("click"),
	contactmenu(),
	MakePicsSortable(),
	checkmissed(),
	ShowPanels(),	//呈现面板
	Loaded=true
	//$("#guide").trigger("click")
	];
	
	var haveload=function (){
		$(document).dequeue('at');
	}
	$(document).queue('at',myload);
	haveload();
}

function fadeshow(obj){
/*	$(obj).css("transition-property","opacity");
	$(obj).css("transition-duration",out+"s");
	$(obj).css("opacity",1);*/
	$(obj).fadeIn(del);
	}

function ShowPanels(){
	speed=300;
	
	$("#navbar").fadeIn(speed,function(){
   		$("#foldersbox").fadeIn(speed,function(){
   			$("#filter").fadeIn(speed,function(){
				refreshbubble();
				
				$("#prg_item_div").fadeIn(speed,function(){
						$("#prg_name_div").fadeIn(speed,function(){
							RefreshFenleiProgress();
							$("#prg_guige_div").fadeIn(speed,function(){
								RefreshRenameProgress();
								$("#recycle").fadeIn(speed,function(){
									RefreshGuigeProgress();
									$("#exbtn").fadeIn(speed,function(){
$("#picbox").fadeIn(speed,function(){

});
								});
							});
						});
					});
				});
	 		});
	 	});
	 });
	}


//检查丢失图片
function checkmissed(){
	var disall=0;
	$("#foldersbox li").each(function(i) {
		disall+=$("#picbox li[fenlei='" + $(this).find(".text").text() + "']").size();
	});
	disall+=$("#picbox li[fenlei='回收站']").size();
	if(disall!==$("#picbox li").size()){
	//alert("丢失"+($('#picbox li').size()-disall)+"个图片");
	//return false;
	//检查是图片是否都有对应文件夹,如果没有就新建
	var foldernames = [];
	$("#foldersbox li").each(function(index, element) {
        foldernames.push($(this).find(".text").text());
    });
	var temp=$("#picbox li");
	$(foldernames).each(function(index, element) {
        temp=$(temp).not($("#picbox li[fenlei='"+this+"']"));
    });
	temp=$(temp).not($("#picbox li[fenlei='回收站']"));
	//新建缺失文件夹
	$(temp).each(function(index, element) {
		var tf=$(this).attr("fenlei");
        if(!inArray(tf,foldernames,false)){
			console.log("开始建立"+tf);
			addfolder(tf,true);
			foldernames.push(tf);
			console.log(foldernames);
			}
    });
		}
	//新建完文件夹后调整文件夹栏宽度、可拖放属性
	ResizeFoldersbox();
	FolderDroptable();
	}
//
function RefillPage(x,y){
	$("#desk .page").each(function(index, element) {
        var all=x*y;
		var has=$(this).find(">li").not('.ui-state-highlight').size();
		if(has>all){	//如果多出来了
				$(this).find(">li:gt("+(all-1)+")").prependTo($(this).next(".page"));
			} else if(has<all){
				$(this).next(".page").find(">li:lt("+(all-has)+")").appendTo($(this));
			}
    });
	}

function ifSlideShown(){
	if($("#SlideTitle").css("display")=="block"){
		return true;		
		} else {
		return false;
			}
	}

//往布局方框内填充图片内容
function Fillpics(x,y){
	$("#picbox li").show();
	var s=$("#picbox li").size();
	var t=Math.ceil(s/(x*y));
	var e=x*y;
	CreatPage(t);
	for(i=0;i<=t;i++){
		//$("#picbox").append("<div class='box'>"+i+"</div>");//添加分栏框
		//$("#picbox .box").height($("#picbox").width()*0.736);			//设置框尺寸
		//$("#picbox .box").width($("#picbox").width()/2.1);
		for(x=0;x<e;x++){
			$("#picbox li:eq(0)").appendTo("#desk .page:eq("+i+")");
		}
	}
	$("#desk li").show();
	MakeBookSortable();
	}

function CreatBook(){	//生成预览书
var docH=$(window).height();
var docW=$(window).width();
//$("#main").width(docW*0.9);
//var mainW=$("#main").width();
//$("#picbox").width(mainW);
//$("#picbox").height(mainW*0.736);
//var pageH=$("#picbox").height();
//var picW=$("#picbox").width();
//$("#progress").hide();//隐藏统计
//$("#topbox").hide();//隐藏文件夹
//$("#picbox li").show();
//Fillpics(3,4);
var deskH=docH*0.85;
var deskW=deskH*0.7*2;
	//书本容器
	console.info("deskW："+deskW+"deskH"+deskH);
	$("body").append("<div id='desk'></div>");
	$("#desk").height(deskH);
	$("#desk").width(deskW);
	var d = dialog({
		id: 'deskshow',
		title:"效果预览",
		width: deskW+20,
		height:deskH+20,
		padding: 0,
		quickClose: false,
		content: $("#desk"),
		button: [{
			value: '上一页',
			callback: function() {
				//MakeNextShow(s.pre());
				//d.title($(s.obj()).find(".text").text());
				//d.reset();
				return false;
			},
			autofocus: true
		},
		{
			value: '下一页',
			callback: function() {
				//MakeNextShow(s.next());
				//d.title($(s.obj()).find(".text").text());
				//d.reset();
				return false;
			},
			autofocus: true
		}]
	});
	d.reset();
	d.showModal();
	//CreatPage();
	Fillpics(3,4);
	}

function CreatPage(n){
	var PageH=$("#desk").height();
	var PageW=$("#desk").width()/2.02;
	console.info("信息："+$("#desk").html());
	for(x=1;x<=n;x++){
		if(x%2==0){
			$("#desk").append("<div class='page right'></div>");
		} else{
			$("#desk").append("<div class='page left'></div>");
			}
	}
	$("#desk .page").height(PageH);
	$("#desk .page").width(PageW);
	}