<?php
include("phpcms/libs/functions/global.func.php");
@$action=$_GET['action'];
@$catid=$_GET['catid'];
@$id=$_GET['id'];
@$item=$_GET['item'];
@$item_title=$_GET['item_title'];
if($_SERVER['HTTP_HOST']=="localhost"){
		@$con = mysql_connect("localhost","fitoev3","870814");
	} else {
		@$con = mysql_connect("localhost","imjzq2g","imjzq2g");
		}
if (!$con){die('Could not connect: ' . mysql_error());}
mysql_query("SET NAMES 'utf8'");
mysql_query("set character_set_client='utf8'"); 
mysql_query("set character_set_results='utf8'");
if($_SERVER['HTTP_HOST']=="localhost"){
		mysql_select_db("fitoev3", $con);
	} else {
		mysql_select_db("imjzq2g", $con);
		}
switch ($action){
		case "getlist":
			header("Content-Type: text/html; charset=utf-8");
			mysql_set_charset( "utf8" , $con ); 
			$result = mysql_query("SELECT title FROM fitoe_paiban");
			//$row = mysql_fetch_array($result);
			@$nums=1;
			while($row=mysql_fetch_array($result))
				{
				  echo $row['title'];
				  @$re_num = @mysql_num_rows($result);
				  if($nums!==$re_num){
					 echo "\r\n";
				  	$nums+=1;
				  }
				}
			break;
		case "getfenlei":
			header("Content-Type: text/html; charset=utf-8");
			mysql_set_charset( "utf8" , $con ); 
			$result = mysql_query("SELECT * FROM  fitoe_paiban a, fitoe_paiban_data b where a.id=b.id and a.title='$item'");
			$row = mysql_fetch_array($result);
			@$nums=1;
			@$arrfolder=string2array($row['pic_shop']);
			//$arrfolder=json_decode($arrfolder);
			@$echoline="";
			
			//echo $re_num2."+".$nums;
			@$dsds2=$arrfolder["folder"];
			@$re_num2 =count($dsds2);
			foreach ($dsds2 as $b){
				$echoline.=$b['name'];
				  if($nums!==$re_num2){
					 $echoline.= "\r\n";
				  	$nums+=1;
				  }
			}
			echo $echoline;
			break;
		case "downtxtrename":	
			$result = mysql_query("SELECT * FROM fitoe_paiban a, fitoe_paiban_data b where a.id=b.id and a.catid='$catid' and a.id='$id'");
			$row = mysql_fetch_array($result);	
			@$title=$row['title'];
			$ua = $_SERVER["HTTP_USER_AGENT"];  
			$filename = "Rename.txt";  
			$encoded_filename = urlencode($filename);  
			$encoded_filename = str_replace("+", "%20", $encoded_filename);  
			header("Content-Type: application/octet-stream");  
				if (preg_match("/MSIE/", $_SERVER['HTTP_USER_AGENT']) ) {  
					header('Content-Disposition:  attachment; filename="' . $encoded_filename . '"');  
				} elseif (preg_match("/Firefox/", $_SERVER['HTTP_USER_AGENT'])) {  
					header('Content-Disposition: attachment; filename*="UTF8' .  $filename . '"');  
				} else {  
					header('Content-Disposition: attachment; filename="' .  $filename . '"');  
				}
			@$arrpics=string2array($row['pic_shop']);
			foreach ($arrpics as $b){
				@$name=str_replace("*","-",@$b['name']);
				@$alt=str_replace("*","-",@$b['alt']);
				@$fenlei=str_replace("*","-",@$b['fenlei']);
				@$echoline=$alt.".tif,";
				if ($fenlei){
					$echoline.= $fenlei."\\";
				}
				if ($name){
					$echoline.= $name.".tif";
				} else {
					$echoline.= $alt.".tif";
					}
				$echoline.= "\r\n";
				echo $echoline;
			}
		break;
		//下载分类排序
	case "downfenlei":
			header("Content-Type: text/html; charset=utf-8");
			mysql_set_charset( "utf8" , $con ); 
			$result = mysql_query("SELECT * FROM fitoe_paiban a, fitoe_paiban_data b where a.id=b.id and a.title='$item_title'");
			$row = mysql_fetch_array($result);	
			//@$title=$row['title'];
			/*$ua = $_SERVER["HTTP_USER_AGENT"];  
			$filename = $item.".txt";  
			$encoded_filename = urlencode($filename);  
			$encoded_filename = str_replace("+", "%20", $encoded_filename);  
			header("Content-Type: application/octet-stream");  
				if (preg_match("/MSIE/", $_SERVER['HTTP_USER_AGENT']) ) {  
					header('Content-Disposition:  attachment; filename="' . $encoded_filename . '"');  
				} elseif (preg_match("/Firefox/", $_SERVER['HTTP_USER_AGENT'])) {  
					header('Content-Disposition: attachment; filename*="ASCII' .  $filename . '"');  
				} else {  
					header('Content-Disposition: attachment; filename="' .  $filename . '"');  
				}*/
			@$arrpics=string2array($row['pic_shop']);
			@$canshu=$row['canshu'];
			//输出表头
			//echo "@路径\t名称\t规格\r\n";
			@$echoline="";
			$echoline.="@路径\t名称";
			$arr = explode(",",$canshu);
			for($i=0; $i < count($arr); ++$i){
				$field = explode("|",$arr[$i]);
				$echoline.= "\t".$field[0];
				}
			$echoline.="\t备注\r\n";
			@$dsds=$arrpics["pics"];
			foreach ($dsds as $b){
				@$name=@$b['name'];
				$name = str_replace(",","，",$name);
				$name = str_replace("\t"," ",$name);
				@$alt=@$b['alt'];
				$alt = str_replace("\t"," ",$alt);
				$alt = str_replace(",","，",$alt);
				
				@$fenlei=@$b['fenlei'];
				@$ext=@$b['ext'];
				$ext = str_replace(",","，",$ext);
				$ext = str_replace("\t"," ",$ext);
				//@$title=@$b['title'];
				@$title = str_replace("\n\r","|",$b['title']); 
				$title = str_replace("\n","|",$title);
				$title = str_replace("\r","|",$title);
				$title = str_replace(",","，",$title);
				$title = str_replace("\t"," ",$title);
				if ($fenlei==$item){	//路径和名称
					//$echoline.= "\\".$alt.".tif\t".$name."\t";
					if ($name){
						$echoline.="\\". $alt.".tif\t".$name."\t";
					} else {
						$echoline.="\\". $alt.".tif\t".$alt."\t";
					}
				for($i=0; $i < count($arr); ++$i){
				$field = explode("|",$arr[$i]);
					if(!empty($b[$field[1]])){
						$echoline.= $b[$field[1]]."\t";
					}
				}
				
				//$echoline.=$ext."\t";		//规格
				$echoline.=$title;
				$echoline.=PHP_EOL;
				}
			}
			echo $echoline;
	break;
	}
$con.mysql_close();
?>