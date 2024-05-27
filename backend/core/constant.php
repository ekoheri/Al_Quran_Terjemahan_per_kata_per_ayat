<?php
$protocol = isset($_SERVER['HTTPS']) ? 'https' : 'http';
define('BASE_URL', $protocol."://".$_SERVER['SERVER_NAME'] .":".$_SERVER['SERVER_PORT']);
define('DIR_ROOT', $_SERVER['DOCUMENT_ROOT']);
define('DB_FILE_PAGE_SURAH', DIR_ROOT.'/backend/database/page_surah.json');
define('DIR_FILE_SURAH_PER_AYAT', DIR_ROOT.'/backend/database/surah_per_ayat/');
define('DIR_FILE_SURAH_PER_KATA', DIR_ROOT.'/backend/database/surah_per_kata/');
?>