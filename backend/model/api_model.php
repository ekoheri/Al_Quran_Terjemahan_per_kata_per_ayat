<?php
class api_model {
    public function get_page($page_number = 1) {
        $list_page = array();
        $list_surah = array();
        $content_surah = array();
        $title_latin_surah = "";
        if(file_exists(DB_FILE_PAGE_SURAH)) {
            $db = file_get_contents(DB_FILE_PAGE_SURAH);
            $list_page = json_decode($db, true);
            $juz = 1;
            $juz_string = '1';
            while($juz <= 30) {
                if( ($page_number >= intval($list_page["juz"][strval($juz)]["start"]["page"])) && ($page_number <= intval($list_page["juz"][strval($juz)]["end"]["page"])) ) {
                    $juz_string = strval($juz);
                    if($page_number < 604) {
                        if( 
                            ($page_number >= intval($list_page["juz"][strval($juz)]["end"]["page"])) && 
                            ($page_number <= intval($list_page["juz"][strval($juz + 1)]["start"]["page"]))
                        ) {
                            $juz_string = strval($juz) ." | " .$juz_string = strval($juz+1);
                        }
                    }
                    break;
                }
                else
                    $juz++;
            }
            for($s = 0; $s < count($list_page["page"][$page_number]); $s++) {
                $index_surah = $list_page["page"][$page_number][$s]["index_surah"];
                $file_surah_per_ayat = DIR_FILE_SURAH_PER_AYAT . $index_surah . ".json";
                $file_surah_per_kata = DIR_FILE_SURAH_PER_KATA . $index_surah . ".json";
                $file_tafsir = DIR_FILE_TAFSIR . $index_surah . ".json";

                if( (file_exists($file_surah_per_ayat)) && (file_exists($file_surah_per_kata))  && (file_exists($file_tafsir)) ) {

                    $db_surah_per_ayat = file_get_contents($file_surah_per_ayat, true);
                    $list_surah_per_ayat = json_decode($db_surah_per_ayat, true);

                    $db_surah_per_kata = file_get_contents($file_surah_per_kata, true);
                    $list_surah_per_kata = json_decode($db_surah_per_kata, true);

                    $db_tafsir = file_get_contents($file_tafsir, true);
                    $list_tafsir = json_decode($db_tafsir, true);

                    $content_surah[$s]["nomor"] = $list_surah_per_ayat[$index_surah]["number"];
                    $content_surah[$s]["nama_surah"] = $list_surah_per_ayat[$index_surah]["name"];
                    $content_surah[$s]["nama_latin_surah"] = $list_surah_per_ayat[$index_surah]["name_latin"];

                    if($title_latin_surah == "") {
                        $title_latin_surah = $list_surah_per_ayat[$index_surah]["number"].". ".$list_surah_per_ayat[$index_surah]["name_latin"];
                    } else {
                        $title_latin_surah .= " | ".$list_surah_per_ayat[$index_surah]["number"].". ".$list_surah_per_ayat[$index_surah]["name_latin"];
                    }
                    $content_surah[$s]["title_latin_surah"] = $title_latin_surah;

                    $start = $list_page["page"][$page_number][$s]["start"];
                    $end = $list_page["page"][$page_number][$s]["end"];
                    $content_surah[$s]["ayat_awal"] = $start;
                    $content_surah[$s]["ayat_akhir"] = $end;
                    $content_surah[$s]["juz"] = $juz_string;
                    $content_surah[$s]["isi_surah"] = array();

                    for($i =  $start; $i<= $end; $i++) {
                        //Tampung array surat per ayat
                        $content_surah[$s]["isi_surah"][$i]['per_ayat']["text_arab"] = $list_surah_per_ayat[$index_surah]["text"][$i];
                        $content_surah[$s]["isi_surah"][$i]['per_ayat']["latin"] = $list_surah_per_ayat[$index_surah]["latin"][$i];
                        $content_surah[$s]["isi_surah"][$i]['per_ayat']["terjemah"] = $list_surah_per_ayat[$index_surah]["terjemah"][$i];
                        
                        //Tampung array surat per kata
                        $content_surah[$s]["isi_surah"][$i]['per_kata']["text_arab"] = $list_surah_per_kata[$index_surah]["text"][$i];
                        $content_surah[$s]["isi_surah"][$i]['per_kata']["terjemah"] = $list_surah_per_kata[$index_surah]["terjemah"][$i];
                        
                        //Tampung array tafsir
                        if( (isset($list_tafsir[$index_surah]["wajiz"][$i])) && (isset($list_tafsir[$index_surah]["tahlili"][$i])) ) {
                            $content_surah[$s]["isi_surah"][$i]['tafsir_wajiz'] = $list_tafsir[$index_surah]["wajiz"][$i];
                            $content_surah[$s]["isi_surah"][$i]['tafsir_tahlili'] = $list_tafsir[$index_surah]["tahlili"][$i];
                        }
                        else {
                            $content_surah[$s]["isi_surah"][$i]['tafsir_wajiz'] = "";
                            $content_surah[$s]["isi_surah"][$i]['tafsir_tahlili'] = "";
                        }
                    }
                }
            }
            
        }
        $data = array(
            'page' => $content_surah
        );
        /*echo "<pre>";
        print_r($data);
        echo "</pre>";*/
        return json_encode($data);
    }

    public function get_list_surah() {
        $content_list_surah = array();
        if(file_exists(DB_FILE_PAGE_SURAH)) {
            $file_json = file_get_contents(DB_FILE_PAGE_SURAH);
            $list_surah = json_decode($file_json, true);

            $content_list_surah = $list_surah["surah"];
        }

        $data = array(
            'surah' => $content_list_surah
        );

        return json_encode($data);
    }

    public function get_juz() {
        $content_list_juz = array();
        if(file_exists(DB_FILE_PAGE_SURAH)) {
            $file_json = file_get_contents(DB_FILE_PAGE_SURAH);
            $list_surah = json_decode($file_json, true);

            $content_list_juz = $list_surah["juz"];
        }

        $data = array(
            'juz' => $content_list_juz
        );

        return json_encode($data);
    }
}
?>