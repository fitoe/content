
//保存图片排序
function savepic(){
	var jdata = [];
	$("#picbox .pic").each( function(i,val){
		if($(this).find("img").attr("src")=="undefined"){alert(0);return true;}
		var row = {};
		row.url = $(this).find("img").attr("src");
		row.alt = $(this).find("img").attr("alt");
		if($(this).find(".text").text()!==$(this).find("img").attr("alt")){
			row.name = $(this).find(".text").text();
			}
		if($(this).attr("fenlei") && $(this).attr("fenlei")!=="未分类"){
			row.fenlei=$(this).attr("fenlei");
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
			$("#debug").html(data);}
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
		dataType:"text",
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			$("#debug").html(textStatus);
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

			$.each(data, function(i,val){ 
				addpic(val.url,val.name,val.alt,val.fenlei);
			});
			 refreshbubble();		//载入完图片后刷新统计角标
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
	}
//删除文件夹
function delfolder(folderobj){
	$(".pic[fenlei='"+$(folderobj).find(".text").text()+"']").attr("fenlei","回收站");
	$(folderobj).remove();
	$("#picbox .pic").hide();
	savefolder();
	savepic();
	refreshbubble();
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
		}
	});
}

//增加图片
function addpic(url,name,alt,fenlei) {
    $("#picbox").append($("#newpic").html());
	
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
		$("#picbox .pic:last").removeClass("hidden");
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
	$("#foldersbox").append($("#newfolder").html());
	$("#foldersbox .folder:last .text").editable("", {
    editby: "click",
    type: "text",
    onsubmit: "blur"
});
	if (typeof(name)!=="undefined"){
		$("#foldersbox .folder:last .text").text(name);
		$("#foldersbox .folder:last .text").closest(".folder").attr("name",name);
	} else {
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

//重命名图片的时候提交
$(".pic input").livequery("blur", 
function() {
	savepic();
});
//点击文件夹/重命名的时候
$(".folder").livequery( 'click', function() {
	selfolder(this);
	if(!$(this).find("input").size()){
		$(".pic").fadeOut();
		var sss=$(this).find(".text").text();
		$(".pic[fenlei='"+sss+"']").fadeIn();
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

	$(".pic[fenlei='"+oldname+"']").attr("fenlei",newname);
	$("#foldersbox .selected").attr("name",newname);
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
$("#add").on("click", 
function() {
    addfolder();
});
//回收站按钮
$("#recycle").on("click", 
function() {
$(".pic").fadeOut();
$(".pic[fenlei='回收站']").fadeIn();
});

//未分类按钮
$("#nofenlei").on("click", 
function() {
	$(".pic").fadeOut();
    $(".pic[fenlei='未分类']").fadeIn();
});
//所有图片按钮
$("#allfolder").on("click", 
function() {
    $(".pic").fadeIn();
});
//图片双击的时候
$(".pic").livequery("dblclick", 
function() {
   alert($(this).attr("fenlei"));
});

//点击图片/重命名的时候
$(".pic").livequery( 'click', function() {
	selpic(this);
	});


//拖放到文件夹的时候
$(".folder").livequery( '', function() {
$(this).droppable({
      accept: ".pic",
      hoverClass: "folderdrop",
	  tolerance :"pointer",
      drop: function( event, ui ) {
        ui.draggable.attr("fenlei",$(this).find(".text").text());
		savepic();
		ui.draggable.hide();
		//selfolder($(this));
		refreshbubble();
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
		refreshbubble()
      }
    });
})
//选中文件夹
function selfolder(obj){
	$(".folder").removeClass("selected ui-corner-all");
	$(obj).addClass("selected  ui-corner-all");
	}
//选中图片
function selpic(obj){
	$(".pic").removeClass("selected ui-corner-all");
	$(obj).addClass("selected  ui-corner-all");
	}	

//刷新气泡
function refreshbubble(){
	
	$(".folder").each(function(i){
  $(this).find(".bubble").text($(".pic[fenlei='"+$(this).find(".text").text()+"']").size());
 	});
	$("#allfolder .bubble").text($(".pic").size()-1);
	$("#nofenlei .bubble").text($(".pic[fenlei='未分类']").size());
	$("#recycle .bubble").text($(".pic[fenlei='回收站']").size());
	}
//热键
$(document).bind('keydown', 'del', function(){
	if ($("#picbox .selected").size()){
		delpic($("#picbox .selected"));
		} else {
    	delfolder($("#foldersbox .selected"));
		}
});
//文本框里回车
$(document).bind('keydown', 'return', function(){
	$("input").blur();
});

$(document).bind('keypress', {combi:'ctrl+a', disableinInput: true}, function(){
	selpic($(".pic"));
});

//页面载入时
$(function(){
	getfolder();
	getpic();
	$("#nofenlei").trigger("click");
	 $(document).ready( function() {
	 	$("#topbox").stickUp({marginTop: '10px'});
	 });

	});
