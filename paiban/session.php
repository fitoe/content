<?php
define('PHPCMS_PATH', dirname(__FILE__).DIRECTORY_SEPARATOR);
 include PHPCMS_PATH.'/phpcms/base.php';
 pc_base::creat_app(); 
 echo $MODULE[phpcms][path] ;
?>