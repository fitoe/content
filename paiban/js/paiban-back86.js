//
picbox_pic=$("#picbox div.pic");


//保存图片排序
function savepic(){
	var jdata = [];
	$("#picbox div.pic").each( function(i,val){
		if($(this).find("img").attr("bigsrc")=="undefined"){alert(0);return true;}
		var row = {};
		row.url = $(this).find("img").attr("bigsrc");
		row.alt = $(this).find("img").attr("alt");
		if($(this).find(".text").text()!==$(this).find("img").attr("alt")){
			row.name = $(this).find(".text").text();
			}
		if($(this).attr("fenlei") && $(this).attr("fenlei")!=="未分类"){
			row.fenlei=$(this).attr("fenlei");
			}
		if($(this).attr("ext")!="undefined"){
			row.ext=$.trim($(this).attr("ext"));
			}
		if($(this).attr("note")!="undefined"){
			row.title=$.trim($(this).attr("title"));
			}
		
		jdata.push(row);
	  });

$.ajax({ 
		url: "/paiban.php",
		type: "POST",
		cache:false,
		data: {
			action:"savepic",
			catid:thecatid,
			id:theid,
			json:$.toJSON(jdata)
			},
		dataType:"text",
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
			},
		success: function(data, textStatus){
			//$("#debug").html(data);
			
			}
	});
}

//保存文件夹排序
function savefolder(){
	var jdata = [];
	$("#foldersbox .folder").each( function(i,val){
		var row = {};
		row.index = $(this).index();
		row.name = $(this).find(".text").text();
		jdata.push(row);
	  });
$.ajax({ 
		url: "/paiban.php",
		type: "POST",
		cache:false,
		data: {
			action:"savefolder",
			catid:thecatid,
			id:theid,
			json:$.toJSON(jdata)
			},
		dataType:"json",
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			//$("#debug").html(textStatus);
			},
		success: function(data, textStatus){
			//$("#debug").html(data);
			}
	});
}

//获取产品图片
function getpic(){
$.ajax({ 
		url: "/paiban.php",
		type: "POST",
		cache:false,
		data: {
			action:"getpic",
			catid:thecatid,
			id:theid
			},
		dataType:"json",
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
			},
		success: function(data, textStatus){
//$("#debug").html(data);
			$.each(data.pics, function(i,val){ 
				alert(val.url);
				addpic(val.url,val.name,val.alt,val.fenlei,val.title,val.ext);
			});
			 refreshbubble();		//载入完图片后刷新统计角标
			 RefreshMemo();
			 RefreshRenameProgress();
			 RefreshFenleiProgress();
			 $("#thumbs").empty();	//删除加载的缩略图
			 $("#nofenlei").trigger("click");
		}
	});
}

//获取历史记录
function gethistory(){
$.ajax({ 
		url: "/paiban.php",
		type: "POST",
		cache:false,
		data: {
			action:"gethistory",
			id:theid
			},
		dataType:"json",
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
			},
		success: function(data, textStatus){
//$("#debug").html(data);
			$.each(data, function(i,val){ 
				addhistory(val.id,val.time,val.kind,val.pics,val.folder);
			});
		}
	});
}

//删除图片
function delpic(picobj){
	if($(picobj).attr("fenlei")=="回收站"){return false;}
	$(picobj).attr("fenlei","回收站");
	savepic();
	$(picobj).hide();
	refreshbubble();
	RefreshFenleiProgress();
	}
//删除文件夹
function delfolder(folderobj){
	$("#picbox div.pic[fenlei='"+$(folderobj).find(".text").text()+"']").attr("fenlei","回收站");
	$(folderobj).remove();
	$("#picbox div.pic").hide();
	savefolder();
	savepic();
	refreshbubble();
	ResizeFoldersbox();
	}

//获取文件夹
function getfolder(){
$.ajax({ 
		url: "/paiban.php",
		type: "POST",
		cache:false,
		data: {
			action:"getfolder",
			catid:thecatid,
			id:theid
			},
		dataType:"json",
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
			},
		success: function(data, textStatus){
			//$("#debug").html(data.length);
			//$("#debug").html(data);
			$.each(data, function(i,val){ 
			//alert($(".folder .text:contains("+val.fenlei+")").size());
				addfolder(val.name);
			  });
			  //顶栏固定
			$("#topbox").stickUp({marginTop: '0'});
			  refreshbubble();
			  ResizeFoldersbox();
		}
	});
}

//增加图片
function addpic(url,name,alt,fenlei,title,ext) {
    $("#picbox").append($("#newpic").html());
	
	$("#picbox .text:last").editable("", {
		editby: "click",
		type: "text",
		submitBy: "blur",
	});
	
	//url=getFileName(url);
	var thumb = url.replace(/[^\/]*[\/]+/g,'');
	thumb=url.replace(thumb,"thumb_160_140_"+thumb);
	//str.replace(rgExp, replaceText);
	$("#picbox img:last").attr("bigsrc",url);
	$("#picbox img:last").attr("src",thumb);
	$("#picbox img:last").attr("alt",alt);
	if (name){
		$("#picbox .text:last").text(name);
	} else {
		$("#picbox .text:last").text(alt);
	}
	if (typeof(fenlei)=="undefined"){
		$("#picbox .pic:last").attr("fenlei","未分类");
		
	} else {
		$("#picbox .pic:last").attr("fenlei",fenlei);
		}
	if (typeof(title)!="undefined"||$.trim(title)!==""){
		$("#picbox .pic:last").attr("title",title);
	}
	if (typeof(ext)!="undefined"||$.trim(ext)!==""){
		$("#picbox .pic:last").attr("ext",ext);
	}
}

//把获取到的历史记录显示出来
function addhistory(addtime,kind,pic,folder) {
    $("#historylist ul").append("<li></li>");
	
	$("#picbox .text:last").editable("", {
		editby: "click",
		type: "text",
		submitBy: "blur",
	});
	$("#picbox img:last").attr("src",url);
	$("#picbox img:last").attr("alt",alt);
	if (name){
		$("#picbox .text:last").text(name);
	} else {
		$("#picbox .text:last").text(alt);
	}
	if (typeof(fenlei)=="undefined"){
		$("#picbox .pic:last").attr("fenlei","未分类");
		
	} else {
		$("#picbox .pic:last").attr("fenlei",fenlei);
		}
}


function checkfolder(name){
	if(!$("#foldersbox .text:contains('"+name+"')").size()){
			return true;
		} else {
		$("#foldersbox .text:contains('"+name+"')").each(function(){
			if ($(this).text()!==name && name!==undefined){
				return true;
			}
			});
		}
	return false;
	}

//新建文件夹
function addfolder(name) {
	//if (!checkfolder(name)){ return false;}
	if(name=="回收站"){return false;}
	if(name=="未命名"){return false;}
	$("#addfolder").before($("#newfolder").html());
	$("#foldersbox .folder:last .text").editable("", {
    editby: "click",
    type: "text",
    onsubmit: "blur"
});

	if (typeof(name)!=="undefined"){
		$("#foldersbox .folder:last .text").text(name);
		$("#foldersbox .folder:last .text").closest(".folder").attr("name",name);
	} else {
ResizeFoldersbox();
selfolder($("#foldersbox input"));
$("#foldersbox .folder:last .text").trigger("click");
$("#foldersbox .folder:last input").select();
	}
};

//内容可拖动
$("#picbox").sortable({
	connectWith: "#picbox",
	placeholder: "ui-state-highlight ui-corner-all",
    cursor: "move",
	distance: 2,
	revert:200,
	tolerance:"pointer",
    opacity: 0.5,
	update: function( event, ui ) {
		savepic();
		}
});

//文件夹可拖动
$("#foldersbox").sortable({
    cursor: "move",
    opacity: 0.5,
    distance: 10,
    revert: true,
	cursor: "move",
    opacity: 0.5,
	update: function( event, ui ) {
		savefolder();
		}
});

//检测是否有重名对象
function Checkname(){
	$("#picbox div.pic").not(".selected").each(function(index, element) {
       if($(this).find(".text").text()==$("#picbox .selected").find(".text").text()){
		   $("#picbox .selected").find(".text").text($("#picbox .selected img").attr("alt"));
		   
		   	
		    $("#picbox .selected").find(".text").trigger("click");
		   }
    });
	}

//检测是否有重名文件夹
function CheckFolderName(){
	$("#foldersbox .folder").not(".selected").each(function(index, element) {
       if($(this).find(".text").text()==$("#foldersbox .selected").find(".text").text()){
		   $("#foldersbox .selected").find(".text").text("新建文件夹");
		   $("#foldersbox .selected").find(".text").trigger("click");
		   }
    });
	}


//重命名图片的时候提交
$("#picbox div.pic input").livequery("blur", 
function() {
	Checkname();
	savepic();
	RefreshRenameProgress();
});
//点击文件夹/重命名的时候
$("#foldersbox .folder").livequery( 'click', function() {
	selfolder(this);
	if(!$(this).find("input").size()){
		$("#picbox div.pic").hide();
		var sss=$(this).find(".text").text();
		var sss2=$("#picbox div.pic[fenlei='"+sss+"']");
		sss2.show();
	}
})



//重命名文件夹的时候
$("#foldersbox input").livequery("change blur", 
function() {
	var oldname=$(this).closest(".folder").attr("name");
	var newname=$(this).val();
	var hasname=$("#foldersbox .folder .text:contains("+$(this).val()+")").size();
	if($(this).val()==""){		//	如果空名称
		$(this).closest(".text").text(oldname);
		return false;}
	$("#picbox div.pic[fenlei='"+oldname+"']").attr("fenlei",newname);
	$("#foldersbox .selected").attr("name",newname);
		CheckFolderName()
		savefolder();
		savepic();
	
});

//重命名文件夹的时候
$("#foldersbox input").livequery("keypress", 
function() {
	selfolder($(this).closest(".folder"));
});


//点击文件夹内文本框的时候
$("input").livequery("click", 
function() {
	$(this).select();
});
	
//文本可编辑
$(".text").editable("", {
    editby: "click",
    type: "text",
    submitBy: "blur"
});

//右键菜单


//新建文件夹按钮
$("#addfolder").on("click", 
function() {
    addfolder();
});
/*$( "#addfolder" ).tooltip({
      show: null,
	  track: true,
	  tooltipClass: "custom-tooltip-styling"
});*/
//回收站按钮
$("#recycle").on("click", 
function() {
$("#picbox div.pic").hide();
$("#picbox div.pic[fenlei='回收站']").show();
});



//下载按钮
$("#downloadtxt").on("click", 
function() {
	//$("#showdown").slideToggle("slow");
	$("#showdown").text("");
	$("#showdown").append("<li><a href=/download.php?action=downtxtrename&catid="+thecatid+"&id="+theid+"><b>《重命名文件》</b> </a></li>");
	$("#foldersbox .text").each(function(){
		$("#showdown").append("<li><a href=/download.php?action=downfenlei&catid="+thecatid+"&id="+theid+"&item="+$(this).text()+">"+$(this).text()+"</a></li>")
		});
	$("#showdown").wrapInner("<ul></ul>");
	$("#showdown").wrapInner("<div id='downlist'></div>");
	//window.location.href="/download.php?action=downtxtrename&catid="+thecatid+"&id="+theid
	var x = dialog({
	 quickClose: true,
	 padding:0,
	 content: $("#showdown").html(),
	});
	x.show(document.getElementById('downloadtxt'));
	});

//备注按钮
$("#allnotes").on("click", 
function() {
	var t = dialog({
	 quickClose: true,
	 padding:0,
	 content: $("#memoselect").html(),
	});
	t.show(document.getElementById('allnotes'));
});



//历史记录按钮
$("#history").on("click", 
function() {
	$("#historylist").slideToggle("fast");
	});

//未分类按钮
$("#nofenlei").on("click", 
function() {
	$("#foldersbox .selected").removeClass("selected");
	$("#picbox div.pic").hide();
    $("#picbox div.pic[fenlei='未分类']").show();
});
//未命名按钮
$("#norename").on("click", 
function() {
	$("#picbox div.pic").hide();
	$("#picbox div.pic").each(function(index, element) {
        var b=$(this).find("img").attr("alt");
		var c=$(this).find(".text").text();
		if(b==c){
			$(this).show();
			}
    });
});

//所有图片按钮
$("#allfolder").on("click", 
function() {
    $("#picbox div.pic").show();
});

//点击图片/重命名的时候
$("#picbox div.pic").livequery( 'click', function(event) {
	selpic(this);
	});
	
//双击显示大图
$("#picbox div.pic").livequery( 'dblclick', function() {
	$("#dialog").show();
	Dialoger(this);
	
});
	 
//点击备注项目的时候显示产品详情窗口
$("#memos li").livequery( 'click', function(e) {
	var obj=GetObjFromSrc($(this).attr("rel"));
    Dialoger($(obj));
});

//按比例缩放
 function pimsize(imgname,widths,heights)
    {
        var w;
        var h;
		
        w=$(imgname).width();
        h=$(imgname).height();
        if(w>h)
        {
            var multiple = w / widths;
            h = h / multiple;
            w=widths;                
        }
        if(h>w)
        {
            var multiple = h / heights;
            w = w / multiple;
            h=heights;
        }
		if(w!==0){$("#dialog .dia_img").attr("width",w);}
		if(h!==0){$("#dialog .dia_img").attr("height",h);}
    }

function MakeNextShow(obj){
	$("#dialog .dia_title").val($(obj).find(".text").text());
	$("#dialog .dia_img").attr("src",$(obj).find("img").attr("src"));
	//加载过程中先显示小图
	
	pimsize($(obj).find("img"),600,600);//把小图填满窗口
	var img = new Image();	//加载大图
	img.src = $(obj).find("img").attr("bigsrc");
	img.onload = function() {
	$("#dialog .dia_img").attr("src",this.src);
	}
	//预加载下一张
	var obj2=$("#picbox .pic:visible");
	var truesrc2=$("#dialog .dia_img").attr("src");
	var thisobj2;
	if(truesrc2.indexOf("thumb_160_140_") > 0 ){ 
		thisobj2=obj2.has("img[src='"+truesrc2+"']"); 
	} else {
		thisobj2=obj2.has("img[bigsrc='"+truesrc2+"']");
	}
	var nextobj2;
	var nextimg = new Image();	//加载大图
	if((obj2.index(thisobj2)+1)>=obj2.size()){
		nextobj2=obj2.eq(0);
		nextimg.src = $(nextobj2).find("img").attr("bigsrc");
	} else {
		nextobj2=obj2.eq(obj2.index(thisobj2)+1);
		nextimg.src = $(nextobj2).find("img").attr("bigsrc");
		}
	
	$("#dialog .dia_ul").html("");
	$("#dialog .dia_ul").append("<li><a href='#'><span>未分类</span></a></li>");
	$("#foldersbox .text").each(function(index, element) {
		$("#dialog .dia_ul").append("<li><a href='#'><span>"+$(this).text()+"</span></a></li>");
		if($("#dialog .dia_ul li:last").text()==$(obj).attr("fenlei")){
			$("#dialog .dia_ul li:last").addClass("checked");
			}
	});
	$("#dialog .note").val($(obj).attr("title"));
	$("#dialog .dia_ext").val($(obj).attr("ext"));
}

//类 找上一张和下一张幻灯对象
function GetSlide(){
	var thisobj;
	var prevobj;
	var nextobj;
	var allobj;
	var truesrc;

	this.reget=function (){
		truesrc=$("#dialog .dia_img").attr("src");
		allobj=$("#picbox .pic:visible");
		if($(allobj).size()<2){
			allobj=$("#picbox div.pic");
			}
		if(truesrc.indexOf("thumb_160_140_") > 0 ){ 
			thisobj=$(allobj).has("img[src='"+truesrc+"']"); 
		} else {
			thisobj=$(allobj).has("img[bigsrc='"+truesrc+"']");
		}
	}
	this.obj=function (){
		this.reget();
		return $(thisobj);
	}
	
	
	this.pre=function (){
		//上一张
		this.reget();
		if(($(allobj).index($(thisobj))-1)<0){
			return $(allobj).eq($(allobj).size()-1);
		} else {
			return $(allobj).eq($(allobj).index($(thisobj))-1);
			}
	}
	this.next=function (){
		//下一张
		this.reget();
		if(($(allobj).index($(thisobj))+1)>=$(allobj).size()){
			return $(allobj).eq(0);
		} else {
			return $(allobj).eq($(allobj).index($(thisobj))+1);
			}
	}	
}



//函数：改变查看大图的内容
function Dialoger(obj){
$("body").append("<div id='dialog'></div>");
$("#dialog").append($("#dialog_content").html());
MakeNextShow(obj);
var s=new GetSlide();
 var d = dialog({
	 id:'mydialog',
    title:$(obj).find(".text").text(),
	width:950,
	padding: 0,
	quickClose: false,
    content: $("#dialog"),
	button: [
			{
				value: '上一张',
				callback: function () {
				MakeNextShow(s.pre());
				d.title($(s.obj()).find(".text").text());
				d.reset();
				return false;
            },
            autofocus: true
        },
        {
            value: '下一张',
            callback: function () {
				MakeNextShow(s.next());
				d.title($(s.obj()).find(".text").text());
				d.reset();
				return false;
            },
            autofocus: true
        }
		]
});
d.reset();
d.showModal();
	}




//预加载图片
function PreloadImg(src){
	var img = new Image();	
	img.src = src;
	}


//详情页产品名称编辑后应用到项目
$("#dialog .dia_title").livequery( 'change', function () {
	$("#picbox div.pic .photo img[bigsrc='"+$("#dialog .dia_img").attr("src")+"']").next().text($(this).val());
	savepic();
	RefreshRenameProgress();
	 });
//详情页规格编辑后应用到项目
$("#dialog .dia_ext").livequery( 'change', function () {
	GetObjFromSrc($("#dialog .dia_img").attr("src")).attr("ext",$(this).val());
	RefreshGuigeProgress();
	savepic();
	 });
//刷新起名进度
function RefreshRenameProgress(){
	var named=0;
	var a=$("#picbox div.pic").size();
	//var b=$("#picbox img[alt]:not([alt='"+$(this).next().text()+"'])");
	$("#picbox div.pic").each(function(index, element) {
        var b=$(this).find("img").attr("alt");
		var c=$(this).find(".text").text();
		if(b!==c){named++}
    });
	var rename=Math.ceil(named*100/a);
	$("#norename .bubble").text(a-named);
	$('#myStat').empty();
	if(rename==100){
			$("#myStat").data("text","完成");
		}else{
			$('#myStat').data("text",rename+"%");
			}
	$('#myStat').data("percent",rename);
	$('#myStat').circliful();
	
	}
//刷新分类进度
function RefreshFenleiProgress(){
	var fenleied=0;
	var a=$("#picbox div.pic").size();
	//var b=$("#picbox img[alt]:not([alt='"+$(this).next().text()+"'])");
	var b=$("#picbox div.pic[fenlei!='未分类']").size();
	var fenleied=Math.floor(b*100/a);
	$('#myStat2').empty();
	if(fenleied==100){
			$("#myStat2").data("text","完成");
		}else{
			$("#myStat2").data("text",fenleied+"%");
			}
	
	$("#myStat2").data("percent",fenleied);
	$("#myStat2").circliful();
	RefreshGuigeProgress();
	}
//刷新规格进度
function RefreshGuigeProgress(){
	var guige=0;
	var a=$("#picbox div.pic").size();
	//var b=$("#picbox img[alt]:not([alt='"+$(this).next().text()+"'])");
	var b=$("#picbox div.pic:not([ext][ext!=''])").size();
	var guige=(a-b)*100/a;
	var guige=Math.ceil(guige);
	$('#myStat3').empty();
	if(guige!==0){$("#myStat3").show()
		if(guige==100){
			$("#myStat3").data("text","完成");
		}else{
			$("#myStat3").data("text",guige+"%");
			}
		$("#myStat3").data("percent",guige);
		$("#myStat3").circliful();
	} else {
		$("#myStat3").hide()
		}
	}

//点击未命名图表的时候显示未命名图片
$("#myStat").livequery( 'click',function(e) {
    $("#norename").trigger("click");
});

//点击未分类图表的时候显示未分类图片
$("#myStat2").livequery( 'click',function(e) {
    $("#nofenlei").trigger("click");
});

//点击规格图表的时候显示未填写规格图片
$("#myStat3").livequery( 'click',function(e) {
	$("#foldersbox .selected").removeClass("selected");
	$("#picbox div.pic").hide();
    $("#picbox div.pic:not([ext!=''])").show();
});

//点击详情页项目列表，直接分类
$("#dialog	li").livequery( 'click', function () {
	$("#dialog	li").removeClass("checked");
	 $(this).addClass("checked"); 
	 var obj=$("#picbox div.pic .photo img[bigsrc='"+$("#dialog .dia_img").attr("src")+"']").parentsUntil(".pic").parent();
	 $(obj).attr("fenlei",$(this).text());
	 savepic();
	 refreshbubble();
	 var selfenlei=$("#foldersbox .selected").attr("name");
	 if(selfenlei=="undefined"){
		 if($(obj).attr("fenlei")=="未分类"){
			obj.show();
		 } else {
			obj.hide(); 
			 }
	 } else {
		 if($(obj).attr("fenlei")==selfenlei){
			obj.show();
		 } else {
			obj.hide(); 
			 }
	 }
	 });

//编辑详情后设置到属性中
$("#dialog .note").livequery( 'change', function () {
	var obj=$("#picbox div.pic .photo img[bigsrc='"+$("#dialog .dia_img").attr("src")+"']").parentsUntil(".pic").parent();
	$(obj).attr("title",$(this).val());
	RefreshMemo();
	savepic();
	 });


//拖放到文件夹的时候
$(".folder").livequery( '', function() {
$(this).droppable({
      accept: ".pic",
      hoverClass: "folderdrop",
	  tolerance :"pointer",
      drop: function( event, ui ) {
		ui.draggable.attr("fenlei",$(this).find(".text").text()); 
		$("#picbox .selected").attr("fenlei",$(this).find(".text").text());
		savepic();
		ui.draggable.hide();
		$("#picbox .selected").hide();
		refreshbubble();
		RefreshFenleiProgress();
      }
    });
})

//拖放到回收站的时候
$("#recycle").livequery( '', function() {
$(this).droppable({
	  tolerance :"pointer",
      drop: function( event, ui ) {
	  if(ui.draggable.hasClass("pic")){
		  	delpic(ui.draggable);
		} else {
			delfolder(ui.draggable);
		}
      }
    });
})
//拖放到未分类的时候
$("#nofenlei").livequery( '', function() {
$(this).droppable({
      accept: ".pic",
	  tolerance :"pointer",
      drop: function( event, ui ) {
        ui.draggable.attr("fenlei","未分类");
		savepic();
		ui.draggable.hide();
		refreshbubble();
		RefreshFenleiProgress();
      }
    });
})

//文本框按下回车键
$("input").livequery( 'keypress', function(e) {
	if(e.which == 13){
	   $("input").blur();
	}
})

//选中文件夹
function selfolder(obj){
	$("#foldersbox .selected").removeClass("selected");
	$("#picsbox .selected").removeClass("selected");
	$(obj).addClass("selected");
	}
//选中图片
function selpic(obj){
	//alert($(obj).index());
	//alert($("#picbox .pic").index($("#picbox .selected")));
	var objindex=$("#picbox .pic:visible").index(obj);
	var selindex=$("#picbox .pic:visible").index($("#picbox .selected"));
	if(key.ctrl){
		$(obj).addClass("selected");
	} else if(key.shift){
		if(objindex>selindex){
			for (var i=selindex+1;i<=objindex;i++)
				{
				$("#picbox .pic:visible").eq(i).addClass("selected");
				}
			} else {
				for (var i=objindex;i<selindex+1;i++)
					{
					$("#picbox .pic:visible").eq(i).addClass("selected");
					}
				
				}
		//$("#picbox div.pic").removeClass("selected");
	} else {
		$("#picbox div.pic").removeClass("selected");
		$(obj).addClass("selected");
		}
	
	
	}

//刷新气泡
function refreshbubble(){
	
	$(".folder").each(function(i){
		$(this).find(".bubble").text($("#picbox div.pic[fenlei='"+$(this).find(".text").text()+"']").size());
 	});
	$("#allfolder .bubble").text($("#picbox div.pic").size()-1);
	$("#nofenlei .bubble").text($("#picbox div.pic[fenlei='未分类']").size());
	
	$("#recycle .bubble").text($("#picbox div.pic[fenlei='回收站']").size());
	$("#allnotes .bubble").text($("#picbox div.pic[title]").size());
	}
	
//刷新备注数量
function RefreshMemo(){
	var obj=$("#picbox div.pic[title]:not([title=''])");
	$("#allnotes .bubble").text($(obj).size());
	$("#memoselect").html("");
	$(obj).each(function(index, element) {
        $("#memoselect").append("<li rel="+$(this).find('img').attr('bigsrc')+">"+$(this).attr("title")+"</li>");
    });
	$("#memoselect").wrapInner("<ul id='memos'></ul>");
	}	

//从图片路径获取图片框对象
function GetObjFromSrc(src){
	var obj=$("#picbox .photo img[bigsrc='"+src+"']").parentsUntil(".pic").parent();
	return $(obj);
	}



//热键
/*backspace, tab, clear, enter, return, esc, escape, space, up, down, left, right, home, end, pageup, pagedown, del, delete and f1 through f19*/
//全选
key('ctrl+a', function(e){
	e.preventDefault();
	selpic($("#picbox div.pic[fenlei='"+$('#foldersbox .selected').attr('name')+"']"));
	});
//删除
key('del', function(){
	if ($("#picbox .selected").size()){
		delpic($("#picbox .selected"));
		} else {
    	delfolder($("#foldersbox .selected"));
		}
	});

//调整文件夹栏宽度
function ResizeFoldersbox(){
	var x=($("#foldersbox .folder").size()+3)*114-80
	$("#foldersbox").width(x);
	$("#foldermain").mCustomScrollbar({
		 axis:"x",
		 theme:"minimal-dark",
		 mouseWheel:{ preventDefault:true },
		 //autoHideScrollbar:true,
		 scrollAmount:1,
		 advanced:{autoExpandHorizontalScroll:true},
		 scrollInertia:0,
		 autoExpandScrollbar:true,
		});
	}


function Init(){
	//载入进度条
	paceOptions = {
		ajax: true, // disabled
		document: true, // disabled
		eventLag: true, // disabled
		elements:true
	};
	$(document).ready( function() {
		
	 });
	//按钮样式
	$("#nofenlei").trigger("click");
	$("#allfolder").button();
	$("#nofenlei").button();
	$("#norename").button();
	$("#recycle").button();
	$("#downloadtxt").button();
	$("#allnotes").button();
	//模糊背景
	$("#main,#topbox").blurjs({
		source: "#div1",
		radius: 30,
		overlay: 'rgba(255,255,255,0.5)',
		draggable:true,
		});
	//鼠标滚轮
	$('#dialog').livequery('mousewheel',function(event, delta) {
		if (delta > 0){
			$(".ui-dialog-footer button:contains('上一张')").trigger('click');
		}else if (delta < 0){
			$(".ui-dialog-footer button:contains('下一张')").trigger('click');
		}
		event.stopPropagation();
		event.preventDefault();
	});
	PreloadImg("/statics/images/paiban/folder-sel.png");	//预加载文件夹选中图片
}
	
	
//从路径中获取文件名
function getFileName(str){ 
  var reg = /[^\/]*[\/]+/g;
  str = str.replace(reg,'');
  return str; 
 } 
//页面载入时
$(function(){
	Init();
	//缩略图生成完成后获取图片
	$("#thumbs").ready(function(){
		getfolder();	//获取内容
		getpic();
	});
});