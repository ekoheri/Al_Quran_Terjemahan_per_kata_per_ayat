<?php
class api extends singleton {
    function __construct(){
        parent :: __construct ();

        registry::model('api_model');
    }

    function index($page = 1){
        echo $this->api_model->get_page($page);
    }

    function list_surah()
    {
        echo $this->api_model->get_list_surah();
    }

    function juz()
    {
        echo $this->api_model->get_juz();
    }
}
?>
