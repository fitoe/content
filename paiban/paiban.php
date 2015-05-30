<?php
error_reporting(E_ALL ^ E_DEPRECATED);
mysql_query("set character set 'utf8'");//读库 
mysql_query("set names 'utf8'");//写库 
//include($_SERVER['DOCUMENT_ROOT']."/phpcms/libs/functions/global.func.php");
@$action=$_POST['action'];
@$catid=$_POST['catid'];
@$id=$_POST['id'];
@$thepage=$_POST['thepage'];
@$json=$_POST['json'];

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
	case "getpic":
		$result = mysql_query("SELECT * FROM fitoe_paiban a, fitoe_paiban_data b where a.id=b.id and a.catid='$catid' and a.id=$id");
		$row = mysql_fetch_array($result);
		//如果新上传了图片
		if($row['pics'] <> ""){
			@$way="http://".$_SERVER['HTTP_HOST']."/uploadfile/";
			@$arr_a=str_replace($way,"",$row['pics']);
			@$arr_a=string2array($arr_a);
			@$arr_b=string2array($row['pic_shop']);
			@$arr_c=$arr_b["pics"];
			if(!isset($arr_c)){
				//echo "y";
				$arr_c=array();
				}
			//var_dump($arr_b);
			//var_dump($arr_c);
			@$arr_d = array_merge ($arr_c,$arr_a); 
			//var_dump($arr_d);
			@$arr_e=array('pics'=>$arr_d);
			//var_dump($arr_e);
			@$arr_f = array_merge ($arr_b, $arr_e); 
			//var_dump($arr_f);
			@$str_g= array2string($arr_f);
			//die;
			mysql_query("update fitoe_paiban_data set pic_shop='$str_g' where id=$id");
			mysql_query("update fitoe_paiban_data set pics='' where id=$id");
			$result = mysql_query("SELECT * FROM fitoe_paiban a, fitoe_paiban_data b where a.id=b.id and a.catid='$catid' and a.id=$id");
			$row = mysql_fetch_array($result);
			
			/*$arr_a=string2array($arr_a);
			@$arr_b=string2array($row['pic_shop']);
			$arr_a=array('pics'=>$arr_a);
			@$arr_c = array_merge ($arr_b, $arr_a); 
			@$str_c= array2string($arr_c);
			mysql_query("update fitoe_paiban_data set pic_shop='$str_c' where id=$id");
			mysql_query("update fitoe_paiban_data set pics='' where id=$id");
			$result = mysql_query("SELECT * FROM fitoe_paiban a, fitoe_paiban_data b where a.id=b.id and a.catid='$catid' and a.id=$id");
			$row = mysql_fetch_array($result);*/
			}
		echo json_encode(string2array($row['pic_shop']));
		break;
	case "RestoreHistory":
		$result = mysql_query("SELECT * FROM paiban_history where id='$id'");
		$row = mysql_fetch_array($result);
		echo json_encode(string2array($row['pic_shop']));
		break;
	case "gethistory":
		//@$lim=(($thepage-1)*10).",10";
		$result = mysql_query("SELECT * FROM paiban_history where paiban_id='$id' order by id desc");
		@$his_row=array();
		@$history=array();
		while($row=mysql_fetch_array($result)){
			$his_row['id'] = $row['id'];
			$his_row['time'] = $row['time'];
			array_push($history,$his_row);
		}
		echo json_encode($history);
		break;
	case "getfolder":
		$result = mysql_query("SELECT * FROM fitoe_paiban_data where id=$id");
		$row = mysql_fetch_array($result);
		echo json_encode(string2array($row['folder']));
		break;
	case "savepic":
		@$jar=array2string(json_decode($json,true));
		//写入更改
		mysql_query("update fitoe_paiban_data set pic_shop='$jar' where id=$id");
		//超过十分钟写入历史记录
		$result = mysql_query("SELECT * FROM paiban_history where paiban_id='$id' and kind='pic' order by id desc");
		$row = mysql_fetch_array($result);
		date_default_timezone_set('Etc/GMT-8');
		@$enddate=date("Y-m-d H:i:s");
		@$startdate=$row['time'];
		$theminute=floor((strtotime($enddate)-strtotime($startdate))%86400/60);
		//echo $theminute."------".$row['time'];
		if($theminute>=10){
			mysql_query("INSERT INTO paiban_history(time,pic_shop,paiban_id,kind) VALUES (now(),'$jar',$id,'pic')");
			}
		break;
	case "savefolder":
		@$jar=array2string(json_decode($json,true));
		mysql_query("update fitoe_paiban_data set folder='$jar' where id=$id");//写入更改
		//$result = mysql_query("SELECT * FROM fitoe_paiban_data where id=$id");
		//$row = mysql_fetch_array($result);
		$result = mysql_query("SELECT * FROM paiban_history where paiban_id='$id' and kind='folder' order by id desc");
		$row = mysql_fetch_array($result);
		date_default_timezone_set('Etc/GMT-8');
		@$enddate=date("Y-m-d H:i:s");
		@$startdate=$row['time'];
		$theminute=floor((strtotime($enddate)-strtotime($startdate))%86400/60);
		//@$lastfolder= json_encode(string2array($row['folder']));
		if($theminute>=10){
			mysql_query("INSERT INTO paiban_history(time,pic_shop,paiban_id,kind) VALUES (now(),'$jar',$id,'folder')");
			}
		break;
	
	}
$con.mysql_close();
/**
* 将字符串转换为数组
*
* @param	string	$data	字符串
* @return	array	返回数组格式，如果，data为空，则返回空数组
*/
function string2array($data) {
	if($data == '') return array();
	@eval("\$array = $data;");
	return $array;
}
/**
* 将数组转换为字符串
*
* @param	array	$data		数组
* @param	bool	$isformdata	如果为0，则不使用new_stripslashes处理，可选参数，默认为1
* @return	string	返回字符串，如果，data为空，则返回空
*/
function array2string($data, $isformdata = 1) {
	if($data == '') return '';
	if($isformdata) $data = new_stripslashes($data);
	return addslashes(var_export($data, TRUE));
}
/**
 * 返回经stripslashes处理过的字符串或数组
 * @param $string 需要处理的字符串或数组
 * @return mixed
 */
function new_stripslashes($string) {
	if(!is_array($string)) return stripslashes($string);
	foreach($string as $key => $val) $string[$key] = new_stripslashes($val);
	return $string;
}
?>