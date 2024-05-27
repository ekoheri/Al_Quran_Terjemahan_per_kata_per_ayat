class Ajax {
    constructor() {
        /* Sesuaikan URL API dengan alamat backend */
        this.url_api = 'https://quran.simetri.io/backend/index.php/api/';

        /* Sesuaikan API KEy dengan API Key yang terdaftar di backend */
        //this.api_key = 'e41d1f4ac632e4adf91ebf087a487ba4';

        this.ContainerLoading = null;
    }

    sendRequest(method, url_target, data) {
        var url = this.url_api + url_target;
        //var api_key = this.api_key;
        const ContainerLoading = this.ContainerLoading;
        const ShowLoading = this.ShowLoading();
        return new Promise(function(resolve, reject) {
            /* new instance dari object XMLHttpRequest */
            var http = new XMLHttpRequest();

            /* Membuka koneksi dengan backend server */
            http.open(method, url);

            /* Set header */
            http.setRequestHeader("Cache-Control", "no-cache");
            //http.setRequestHeader("api-key", api_key);

            /* Event ketika memulai memuat data dari backend */
            http.onloadstart = function() {
                ContainerLoading.innerHTML = '';
                ContainerLoading.appendChild(ShowLoading);
            }

            /* Event ketika berhasil mendapatlan data dari backend */
            http.onload = function() {
                if (http.readyState == 4 && http.status == 200) {
                    var response = http.responseText;
                    resolve(response);
                }
            }

            /* Event ketika gagal melakukan koneksi ke backend */
            http.onerror = reject;

            /* Kirim permintaan (request) data ke backend */
            http.send(data);
        });
    }

    /* Method untuk menampilkan gambar loading ketika request dari backend blm selesai */
    ShowLoading() {
        var divLoading = document.createElement("div");
        divLoading.className = "d-flex justify-content-center";

        var spinner = document.createElement("div");
        spinner.className = "spinner-border text-danger";
        spinner.setAttribute("role","status")

        var span = document.createElement("span");
        span.className = "visually-hidden";
        span.innerHTML = "Loading...";

        spinner.appendChild(span);
        divLoading.appendChild(spinner);

        return divLoading;
    }
}// end class

class IndexedDBWrapper {
    constructor(dbName, storeName, keyPath) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
        this.keyPath = keyPath
    }

    // Method to open the database
    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                this.db.createObjectStore(this.storeName, { keyPath: this.keyPath });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to add data
    addData(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.add(data);

            request.onsuccess = () => {
                resolve(data.id);
            };

            request.onerror = (event) => {
                reject(`Add error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to get data by ID
    getData(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(`Get error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to update data
    updateData(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.put(data);

            request.onsuccess = () => {
                resolve(data.id);
            };

            request.onerror = (event) => {
                reject(`Update error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to delete data by ID
    deleteData(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                resolve(id);
            };

            request.onerror = (event) => {
                reject(`Delete error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to clear all data
    clearData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(`Clear error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to check if data exists by ID
    isExist(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result !== undefined);
            };

            request.onerror = (event) => {
                reject(`Existence check error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to count all records
    count() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.count();

            request.onsuccess = () => {
                if(typeof request.result === "object")
                    resolve(0)
                else
                    resolve(request.result);
            };

            request.onerror = (event) => {
                reject(`Count error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to count records by ID
    countId(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.openCursor();

            let count = 0;
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.id === id) {
                        count++;
                    }
                    cursor.continue();
                } else {
                    resolve(count);
                }
            };

            request.onerror = (event) => {
                reject(`CountId error: ${event.target.errorCode}`);
            };
        });
    }

    // Method to close the database
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        } 
    }//end class

    // Method to drop the database
    static dropDatabase(dbName) {
        return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onsuccess = () => {
            resolve(`Database ${dbName} deleted successfully`);
        };

        request.onerror = (event) => {
            reject(`Database delete error: ${event.target.errorCode}`);
        };

        request.onblocked = () => {
            reject(`Database delete blocked`);
        };
        });
    }
} //IndexedDBWrapper

class DataHandler {
    constructor(dbName, storeName, keyPath) {
        const dbWrapper = new IndexedDBWrapper(dbName, storeName, keyPath);
        this.dbWrapper = dbWrapper;
    }

    // Method untuk menambahkan data dan menutup koneksi basis data
    async setItem(id, data) {
        try {
            await this.dbWrapper.open();
            const exist = await this.dbWrapper.isExist(id);
            if (!exist) {
                await this.dbWrapper.addData({ id, data });
            }
            await this.dbWrapper.close();
        } catch (error) {
            console.error(error);
        }
    }

    async isExist(id) {
        try {
            await this.dbWrapper.open();
            const exist = await this.dbWrapper.isExist(id);
            await this.dbWrapper.close();
            return exist;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    // Method untuk mendapatkan data berdasarkan ID
    async getItem(id) {
        try {
            await this.dbWrapper.open();
            const data = await this.dbWrapper.getData(id);
            await this.dbWrapper.close();
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async count() {
        try {
            await this.dbWrapper.open();
            const count = await this.dbWrapper.count();
            await this.dbWrapper.close();
            return count;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async clear() {
        try {
            await this.dbWrapper.open();
            await this.dbWrapper.clearData();
            await this.dbWrapper.close();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}//end class DataHandler

class HandleUI{
    constructor() {
        this.Service = null;        //instnce variable untuk AJAX
        this.dataHandler = null;    //instance variable untuk IndexedDB

        this.current_page = 1;
        this.tampilan = 'kata';
        this.terjemah = 'show';
        this.UkuranFont = 'sedang';

        this.indexedDB_page = 'SMT_Page_';
        this.indexedDB_juz = 'SMT_List_Juz';
        this.indexedDB_list_surah = 'SMT_List_Surah';
        this.localStrg_last_opened = 'SMT_Last_Opened';
        this.localStrg_mark_read = 'SMT_Mark_Read';
        this.scrollPosition = 0;

        this.divContentCanvasPerAyat = document.getElementById('divContentCanvasPerAyat');
        this.divContentCanvasPerKata = document.getElementById('divContentCanvasPerKata');

        //Button header
        this.btnJuz = document.getElementById('btnJuz');
        this.btnHalamanSurah = document.getElementById('btnHalamanSurah');
        this.btnNamaSurah = document.getElementById('btnNamaSurah');

        //Button pengaturan
        this.btnPengaturan = document.getElementById('btnPengaturan');
        this.btnNext = document.getElementById('btnNext');
        this.btnPrev = document.getElementById('btnPrev');
        this.btnFontBesar = document.getElementById('btnFontBesar');
        this.btnFontSedang = document.getElementById('btnFontSedang');
        this.btnFontKecil = document.getElementById('btnFontKecil');
        this.btnPerAyat = document.getElementById('btnPerAyat');
        this.btnPerKata = document.getElementById('btnPerKata');
        this.btnShowHideTerjemah = document.getElementById('btnShowHideTerjemah');
        this.btnDownloadData = document.getElementById('btnDownloadData');
        this.btnClearData = document.getElementById('btnClearData');

        //Model component
        this.ModalPengaturan = document.getElementById('ModalPengaturan');
        this.ModalPilihAyat = document.getElementById('ModalPilihAyat');
        this.ModalTafsir = document.getElementById('ModalTafsir');
        this.ModalJuzSurah = document.getElementById('ModalJuzSurah');
        this.ModalJuzSurahLabel = document.getElementById('ModalJuzSurahLabel');
        this.ModalMarkOpened = document.getElementById('ModalMarkOpened');

        //Link penanda ayat
        this.lnkTafsirAyat = document.getElementById('lnkTafsirAyat');
        this.lnkCopyAyat = document.getElementById('lnkCopyAyat');
        this.lnkAkhirBaca = document.getElementById('lnkAkhirBaca');
    }
    
    async init() {
        /* Instansiasi class ajax */
        this.Service = new Ajax();
        this.Service.ContainerLoading = this.divContentCanvasPerAyat;

        /* Instansiasi class IndexexDB */
        this.dataHandler = new DataHandler('Simetri' ,'Al_Quran', 'id');

        /* Membaca history halaman surah yg terakhir dibuka */
        if(this.localStrg_last_opened in localStorage) {
            this.current_page = parseInt(localStorage.getItem(this.localStrg_last_opened));
        }

        /* Menampilkan surah sesuai dgn halaman terakhir dibuka */
        await this.RequestPage(this.current_page.toString());

        /* Cek apakah yang ditampilkan surah per ayat atau per kata? */
        if(this.tampilan == 'ayat') {
            this.divContentCanvasPerAyat.style.display = "block";
            this.divContentCanvasPerKata.style.display = "none";
            this.btnPerAyat.className = "btn btn-primary";
            this.btnPerKata.className = "btn btn-outline-primary";
        } else if(this.tampilan == 'kata') {
            this.divContentCanvasPerAyat.style.display = "none";
            this.divContentCanvasPerKata.style.display = "block";
            this.btnPerAyat.className = "btn btn-outline-primary";
            this.btnPerKata.className = "btn btn-primary";
        }

        /* Cek apakah terjemahan ditampilkan atau tidak? */
        if(this.terjemah == 'show') {
            this.btnShowHideTerjemah.innerHTML = 'Tidak ditampilkan';
        } else if(this.terjemah == 'hidden') {
            this.btnShowHideTerjemah.innerHTML = 'Ditampilkan';
        }

        /* Event handler untuk menuju halaman selanjutnya */
        this.btnNext.addEventListener('click', async function() {
            var halaman = this.current_page;
            if(halaman < 604) {
                halaman += 1;
                await this.RequestPage(halaman.toString());
                this.btnNext.style.display = "block";
                this.btnPrev.style.display = "block";
                if(halaman == 604) {
                    this.btnNext.style.display = "none";
                    halaman = 604;
                }
                this.current_page = halaman;
            }

        }.bind(this));

        /* Event handler untuk menuju halaman sebelumnya */
        this.btnPrev.addEventListener('click', async function() {
            var halaman = this.current_page;
            if(halaman > 1) {
                halaman -= 1;
                await this.RequestPage(halaman.toString());
                this.btnNext.style.display = "block";
                this.btnPrev.style.display = "block";
                if(halaman == 1) {
                    this.btnPrev.style.display = "none";
                    halaman = 1;
                }
                this.current_page = halaman;
            }

        }.bind(this));

        this.btnPengaturan.addEventListener('click', async function() {
            try {
              var prosentase = await this.prosentaseLocalStorage();
              //console.log("jumlah" + prosentase.toString());
              await this.UpdateProgressBarDownload(prosentase.toString());

              if(prosentase == 100) {
                document.getElementById('btnDownloadData').disabled = true;
              } else {
                document.getElementById('btnDownloadData').disabled = false;
              }

              if(prosentase == 0) {
                document.getElementById('btnClearData').disabled = true;
              } else {
                document.getElementById('btnClearData').disabled = false;
              }
              var modal  = bootstrap.Modal.getOrCreateInstance(this.ModalPengaturan);
              modal.show();
            } catch (error) {
              console.error('Error calculating percentage:', error);
            }
        }.bind(this));

        this.btnPerAyat.addEventListener('click', function() {
            this.tampilan = 'ayat';
            this.btnPerAyat.className = "btn btn-primary";
            this.btnPerKata.className = "btn btn-outline-primary";
            this.divContentCanvasPerAyat.style.display = "block";
            this.divContentCanvasPerKata.style.display = "none";
        }.bind(this));

        this.btnPerKata.addEventListener('click', function() {
            this.tampilan = 'kata';
            this.btnPerAyat.className = "btn btn-outline-primary";
            this.btnPerKata.className = "btn btn-primary";
            this.divContentCanvasPerAyat.style.display = "none";
            this.divContentCanvasPerKata.style.display = "block";
        }.bind(this));

        this.btnShowHideTerjemah.addEventListener('click', function() {
            if(this.terjemah == 'show') {
                this.terjemah = 'hidden';
                this.btnShowHideTerjemah.innerHTML = "Ditampilkan";
            } else 
            if(this.terjemah == 'hidden') {
                this.terjemah = 'show';
                this.btnShowHideTerjemah.innerHTML = "Tidak ditampilkan";
            }
            this.PengaturanTerjemah();
        }.bind(this));

        this.btnFontBesar.addEventListener('click', function() {
            this.UkuranFont = 'besar';
            this.SetFontSize();
            this.btnFontBesar.className = "btn btn-primary";
            this.btnFontSedang.className = "btn btn-outline-primary";
            this.btnFontKecil.className = "btn btn-outline-primary";
        }.bind(this));

        this.btnFontSedang.addEventListener('click', function() {
            this.UkuranFont = 'sedang';
            this.SetFontSize();
            this.btnFontBesar.className = "btn btn-outline-primary";
            this.btnFontSedang.className = "btn btn-primary";
            this.btnFontKecil.className = "btn btn-outline-primary";
        }.bind(this));

        this.btnFontKecil.addEventListener('click', function() {
            this.UkuranFont = 'kecil';
            this.SetFontSize();
            this.btnFontBesar.className = "btn btn-outline-primary";
            this.btnFontSedang.className = "btn btn-outline-primary";
            this.btnFontKecil.className = "btn btn-primary";
        }.bind(this));

        this.btnDownloadData.addEventListener('click', async function() {
            await this.DownloadData();
        }.bind(this));

        this.btnClearData.addEventListener('click', async function() {
            await this.EraseData();
        }.bind(this));

        this.lnkCopyAyat.addEventListener('click', function(){
            this.CopyToClipboard();
        }.bind(this));

        this.lnkAkhirBaca.addEventListener('click', function(){
            this.TandaAkhirBaca();
        }.bind(this));

        this.lnkTafsirAyat.addEventListener('click', function(){
            this.TampilkanTafsir();
        }.bind(this));

        this.btnJuz.addEventListener('click', function(){
            this.TampilkanJuz();
        }.bind(this));

        this.btnNamaSurah.addEventListener('click', function(){
            this.TampilkanSurah();
        }.bind(this));

        this.btnHalamanSurah.addEventListener('click', function(){
            const ModalMarkOpened  = bootstrap.Modal.getOrCreateInstance(this.ModalMarkOpened);
            ModalMarkOpened.show();

            if(this.localStrg_mark_read in localStorage) {
                document.getElementById('MarkOpenedIsEmpty').style.display = "none";
                document.getElementById('MarkOpenedExist').style.display = "block";

                var mark_opened =  JSON.parse(localStorage.getItem(this.localStrg_mark_read));
                const mark_halaman = mark_opened[0];
                document.getElementById('AyatLastRead').innerHTML = mark_opened[3];

                document.getElementById('OpenAyatLastRead').addEventListener('click', function(){
                    this.RequestPage(mark_halaman);
                    ModalMarkOpened.hide();
                }.bind(this));
            } else {
                document.getElementById('MarkOpenedIsEmpty').style.display = "block";
                document.getElementById('MarkOpenedExist').style.display = "none";
            }
        }.bind(this));

    }

    //Group Method untuk menampilkan ayat pada halaman utama
    async RequestPage(halaman) {
        if(this.divContentCanvasPerAyat.style.display == "block")
            this.Service.ContainerLoading = this.divContentCanvasPerAyat;
        else if(this.divContentCanvasPerKata.style.display == "block")
            this.Service.ContainerLoading = this.divContentCanvasPerKata;

        this.btnHalamanSurah.innerHTML = halaman;

        //Jika data halaman Al Quran ada di localStorage, maka ambil dari localStorage
        //Jika tidak di di localStorage, maka ambil dari server

        try {
            const exist = await this.dataHandler.isExist(this.indexedDB_page + halaman.toString());
            if(exist) {
                var result = await this.dataHandler.getItem(this.indexedDB_page + halaman.toString());
                var dataJson = JSON.parse(result.data);
                await this.parsingDataPage(dataJson.page, halaman);
            } else {
                const result = await this.Service.sendRequest('get', 'index/' + halaman.toString(), null);
                var dataJson = JSON.parse(result);
                await this.parsingDataPage(dataJson.page, halaman);
                await this.dataHandler.setItem(this.indexedDB_page + halaman.toString(), result);
            }
        } catch(error) {
            console.log(error);
        }
    }

    async parsingDataPage(dataObject, halaman) {
        localStorage.setItem(this.localStrg_last_opened, halaman);
        
        await this.WritePerAyat(dataObject);
        await this.WritePerKata(dataObject);
        this.SetFontSize();

        this.current_page = parseInt(halaman);
        this.btnHalamanSurah.innerHTML = halaman;

        if(this.current_page == 1) {
            this.btnPrev.style.display = "none";
            this.btnNext.style.display = "block";
        } else if(this.current_page == 604) {
            this.btnPrev.style.display = "block";
            this.btnNext.style.display = "none";
        } else {
            this.btnPrev.style.display = "block";
            this.btnNext.style.display = "block";
        }

        this.PengaturanTerjemah();
    }

    async WritePerAyat(dataAyat) {
        this.divContentCanvasPerAyat.innerHTML = "";
        var bismillah = "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ";
        var terjemah_bismillah = "Dengan nama Allah yang Maha Pengasih lagi Maha Penyayang";

        var ayat_container;
        var ayat;
        var ayat_number;
        var kata_container;
        var kata;
        var arti;
        var tafsir;

        var mark_halaman = "";
        var mark_nomor_surah = "";
        var mark_ayat = "";

        if(this.localStrg_mark_read in localStorage) {
            var mark_opened =  JSON.parse(localStorage.getItem(this.localStrg_mark_read));
            mark_halaman = mark_opened[0];
            mark_nomor_surah  = mark_opened[1];
            mark_ayat = mark_opened[2];
        }

        for(var i = 0; i < dataAyat.length; i++) {
            this.btnJuz.innerHTML = "Juz " + dataAyat[i]["juz"];
            this.btnNamaSurah.innerHTML = dataAyat[i]["title_latin_surah"];
            var awal = parseInt(dataAyat[i]["ayat_awal"]);
            var akhir = parseInt(dataAyat[i]["ayat_akhir"]);
            
            ayat_container = document.createElement("div");
            ayat_container.className = "ayat-container";

            const nomor_surah = dataAyat[i]["nomor"];
            const nama_latin_surah = dataAyat[i]["nama_latin_surah"];

            //Tampilkan nama surat dan Bismillah diawal surat
            if((awal == 1) && (dataAyat[i]["nomor"] != '1')) {
                ayat = document.createElement("div");
                ayat.className = "ayat";
                ayat.id = "bismillah";

                //Tampilkan nama surat
                var separator = document.createElement("div");
                separator.className = "separator";
                var span_separator = document.createElement("span");
                span_separator.innerHTML = dataAyat[i]['nama_surah'] +'<br />'+ dataAyat[i]['nama_latin_surah'];
                separator.appendChild(span_separator);
                ayat.appendChild(separator);
                ayat_container.appendChild(ayat);

                //Tampilkan Bismillah diawal surat
                kata_container = document.createElement("div");
                kata_container.className = "kata-container";
                kata = document.createElement("span");
                kata.className = "kata";
                kata.innerHTML = bismillah;
                kata_container.appendChild(kata);

                arti = document.createElement("span");
                arti.className = "arti";
                arti.innerHTML = terjemah_bismillah;
                kata_container.appendChild(arti);

                ayat.appendChild(kata_container);
                ayat_container.appendChild(ayat);
            }
            
            //looping per ayat
            for(var j = awal; j <= akhir; j++) {
                const nomor = j.toString();
                ayat = document.createElement("div");
                ayat.className = "ayat";
                //console.log(this.btnHalamanSurah.innerHTML + ' - ' + nomor_surah + ' '+nomor);
                if( (this.btnHalamanSurah.innerHTML === mark_halaman) && (nomor_surah === mark_nomor_surah) && (nomor === mark_ayat) ) {
                    ayat.className = "ayat akhir_baca";
                }
                ayat.id = "per_ayat_"+ nomor_surah + "_"+ nomor;

                ayat_number = document.createElement("div");
                ayat_number.className = "ayat-number";
                
                ayat_number.innerHTML = nomor;
                ayat_number.addEventListener('click', function(){
                    this.ShowDropDown(
                        nama_latin_surah + ' ayat ' + nomor,
                        this.btnHalamanSurah.innerHTML + '_'+nomor_surah + '_' + nomor
                    );
                }.bind(this));
                ayat.appendChild(ayat_number);

                kata_container = document.createElement("div");
                kata_container.className = "kata-container";
                
                kata = document.createElement("span");
                kata.className = "kata";
                kata.innerHTML = dataAyat[i]["isi_surah"][nomor]['per_ayat']["text_arab"]+ " " +this.LatinToArab(j.toString());
                kata_container.appendChild(kata);

                arti = document.createElement("span");
                arti.className = "arti";
                arti.innerHTML = dataAyat[i]["isi_surah"][nomor]['per_ayat']["terjemah"];
                kata_container.appendChild(arti);

                tafsir = document.createElement("p");
                tafsir.id = "tafsir_"+nomor_surah + '_' + nomor;
                tafsir.style.display = "none";
                tafsir.innerHTML = dataAyat[i]["isi_surah"][nomor]["tafsir"];
                kata_container.appendChild(tafsir);
                
                ayat.appendChild(kata_container);
                ayat_container.appendChild(ayat);
            } //end for j
            this.divContentCanvasPerAyat.appendChild(ayat_container);
            this.divContentCanvasPerAyat.appendChild(document.createElement("br"));
        }
    }//end function

    async WritePerKata(dataAyat) {
        this.divContentCanvasPerKata.innerHTML = "";
        var bismillah = "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ";
        var terjemah_bismillah = "Dengan nama Allah yang Maha Pengasih lagi Maha Penyayang";

        var ayat_container;
        var ayat;
        var ayat_number;
        var kata_container;
        var kata;
        var arti;

        var mark_halaman = "";
        var mark_nomor_surah = "";
        var mark_ayat = "";

        if(this.localStrg_mark_read in localStorage) {
            var mark_opened =  JSON.parse(localStorage.getItem(this.localStrg_mark_read));
            mark_halaman = mark_opened[0];
            mark_nomor_surah  = mark_opened[1];
            mark_ayat = mark_opened[2];
        }

        for(var i = 0; i < dataAyat.length; i++) {
            this.btnJuz.innerHTML = "Juz " + dataAyat[i]["juz"];
            this.btnNamaSurah.innerHTML = dataAyat[i]["title_latin_surah"];
            var awal = parseInt(dataAyat[i]["ayat_awal"]);
            var akhir = parseInt(dataAyat[i]["ayat_akhir"]);
            
            ayat_container = document.createElement("div");
            ayat_container.className = "ayat-container";

            const nomor_surah = dataAyat[i]["nomor"];
            const nama_latin_surah = dataAyat[i]["nama_latin_surah"];

            //Tampilkan nama surat dan Bismillah diawal surat
            if((awal == 1) && (dataAyat[i]["nomor"] != '1')) {
                ayat = document.createElement("div");
                ayat.className = "ayat";
                ayat.id = "bismillah";

                //Tampilkan nama surat
                var separator = document.createElement("div");
                separator.className = "separator";
                var span_separator = document.createElement("span");
                span_separator.innerHTML = dataAyat[i]['nama_surah'] +'<br />'+ dataAyat[i]['nama_latin_surah'];
                separator.appendChild(span_separator);
                ayat.appendChild(separator);
                ayat_container.appendChild(ayat);

                //Tampilkan Bismillah diawal surat
                kata_container = document.createElement("div");
                kata_container.className = "kata-container";
                kata = document.createElement("span");
                kata.className = "kata";
                kata.innerHTML = bismillah;
                kata_container.appendChild(kata);

                arti = document.createElement("span");
                arti.className = "arti";
                arti.innerHTML = terjemah_bismillah;
                kata_container.appendChild(arti);

                ayat.appendChild(kata_container);
                ayat_container.appendChild(ayat);
            }
            
            //looping per ayat
            for(var j = awal; j <= akhir; j++) {
                const nomor = j.toString();
                ayat = document.createElement("div");
                ayat.className = "ayat";
                if( (this.btnHalamanSurah.innerHTML == mark_halaman) && (nomor_surah == mark_nomor_surah) && (nomor == mark_ayat) ) {
                    ayat.className = "ayat akhir_baca";
                }
                ayat.id = "per_kata_"+ nomor_surah + "_"+ nomor;

                ayat_number = document.createElement("div");
                ayat_number.className = "ayat-number";
                
                ayat_number.innerHTML = nomor;
                ayat_number.addEventListener('click', function(){
                    this.ShowDropDown(
                        nama_latin_surah + ' ayat ' + nomor,
                        this.btnHalamanSurah.innerHTML + '_'+nomor_surah + '_' + nomor
                    );
                }.bind(this));
                ayat.appendChild(ayat_number);

                if(typeof dataAyat[i]["isi_surah"][j.toString()]['per_kata']["text_arab"] === "object") {
                    var arr_arab = Object.entries(dataAyat[i]["isi_surah"][j.toString()]['per_kata']["text_arab"]);
                    var arr_terjemah = Object.entries(dataAyat[i]["isi_surah"][j.toString()]['per_kata']["terjemah"]);

                    //looping per kata
                    for(var x = 0; x < arr_arab.length; x++) {
                        kata_container = document.createElement("div");
                        kata_container.className = "kata-container";
                        kata_container.style.textAlign = "center";

                        kata = document.createElement("span");
                        kata.className = "kata";
                        if(x == (arr_arab.length -1))
                            kata.innerHTML = arr_arab[x]['1'] + " " +this.LatinToArab(j.toString());
                        else
                            kata.innerHTML = arr_arab[x]['1'];
                        kata_container.appendChild(kata);

                        arti = document.createElement("span");
                        arti.className = "arti";
                        arti.innerHTML = arr_terjemah[x]['1'];
                        kata_container.appendChild(arti);

                        ayat.appendChild(kata_container);
                    }
                    ayat_container.appendChild(ayat);
                }
            } //end for j
            this.divContentCanvasPerKata.appendChild(ayat_container);
            this.divContentCanvasPerKata.appendChild(document.createElement("br"));
        }
    }

    //Group Method untuk menampilkan daftar Juz
    TampilkanJuz() {
        var ModalJuzSurah  = bootstrap.Modal.getOrCreateInstance(this.ModalJuzSurah);
        this.ModalJuzSurahLabel.innerHTML = "Daftar Juz";
        ModalJuzSurah.show();

        this.RequestJuz();
    }

    async RequestJuz() {
        document.getElementById('divListJuzSurah').innerHTML = "";
        this.Service.ContainerLoading = document.getElementById('divListJuzSurah');

        try {
            const exist = await this.dataHandler.isExist(this.indexedDB_juz);
            if(exist) {
                var result = await this.dataHandler.getItem(this.indexedDB_juz);
                var dataJson = JSON.parse(result.data);
                await this.ParsingDataJuz(dataJson.juz);
            } else {
                const result = await this.Service.sendRequest('get', 'juz', null);
                var dataJson = JSON.parse(result);
                await this.ParsingDataJuz(dataJson.juz);
                await this.dataHandler.setItem(this.indexedDB_juz, result);
            }
        } catch(error) {
            console.log(error);
        }
    }

    async ParsingDataJuz(dataJuz){
        document.getElementById('divListJuzSurah').innerHTML = "";
        if(typeof dataJuz === "object") {
            var arr_juz = Object.entries(dataJuz);
            for(var i = 0; i < arr_juz.length; i++) {
                const halaman_awal_juz = arr_juz[i][1]["start"]["page"];
                var a = document.createElement("a");
                a.className = "list-group-item list-group-item-action";
                a.setAttribute("aria-current", "true");
                a.href = "#";

                var div = document.createElement("div");
                div.className = "d-flex w-100 justify-content-between";

                var h5 = document.createElement("h5");
                h5.className = "mb-1";
                h5.innerHTML = "Juz " + arr_juz[i][0];
                div.appendChild(h5);

                var small_1 = document.createElement("small");
                small_1.className = "text-body-secondary";
                small_1.innerHTML = 'Halaman '+halaman_awal_juz;
                div.appendChild(small_1);

                var small_2 = document.createElement("small");
                small_2.className = "text-body-secondary";
                var surah_awal = arr_juz[i][1]["start"]["name_latin"];
                var surah_akhir = arr_juz[i][1]["end"]["name_latin"];
                small_2.innerHTML = surah_awal +' : '+ arr_juz[i][1]["start"]["ayat"] + ' - ' + surah_akhir  +' : '+ arr_juz[i][1]["end"]["ayat"];
                if(surah_awal == surah_akhir) {
                    small_2.innerHTML = surah_awal + ' : '+ arr_juz[i][1]["start"]["ayat"] + ' - ' + arr_juz[i][1]["end"]["ayat"];
                }

                a.appendChild(div);
                a.appendChild(small_2);

                a.addEventListener('click', function(){
                    var ModalJuzSurah  = bootstrap.Modal.getOrCreateInstance(this.ModalJuzSurah);
                    ModalJuzSurah.hide();
                    this.RequestPage(halaman_awal_juz);
                }.bind(this));

                document.getElementById('divListJuzSurah').appendChild(a);
            }//end for i
        }//end if
    }

    //Group Method untuk menampilkan daftar Surah
    TampilkanSurah() {
        var ModalJuzSurah  = bootstrap.Modal.getOrCreateInstance(this.ModalJuzSurah);
        this.ModalJuzSurahLabel.innerHTML = "Daftar Surah";
        ModalJuzSurah.show();

        this.RequestSurah();
    }

    async RequestSurah() {
        document.getElementById('divListJuzSurah').innerHTML = "";
        this.Service.ContainerLoading = document.getElementById('divListJuzSurah');

        try {
            const exist = await this.dataHandler.isExist(this.indexedDB_list_surah);
            if(exist) {
                var result = await this.dataHandler.getItem(this.indexedDB_list_surah);
                var dataJson = JSON.parse(result.data);
                await this.ParsingDataSurah(dataJson.surah);
                //console.log("GEt data from IndexedDB");
            } else {
                const result = await this.Service.sendRequest('get', 'list_surah', null);
                var dataJson = JSON.parse(result);
                await this.ParsingDataSurah(dataJson.surah);
                await this.dataHandler.setItem(this.indexedDB_list_surah, result);
                //console.log("GEt data from backend");
            }
        } catch(error) {
            console.log(error);
        }
    }
    
    async ParsingDataSurah(dataSurah){
        document.getElementById('divListJuzSurah').innerHTML = "";
        if(typeof dataSurah === "object") {
            var arr_surah = Object.entries(dataSurah);
            for(var i = 0; i < arr_surah.length; i++) {
                const halaman_awal_surah = arr_surah[i][1]["start_page"];
                var a = document.createElement("a");
                a.className = "list-group-item list-group-item-action";
                a.setAttribute("aria-current", "true");
                a.href = "#";

                var div = document.createElement("div");
                div.className = "d-flex w-100 justify-content-between";

                var h5 = document.createElement("h5");
                h5.className = "mb-1";
                h5.innerHTML = arr_surah[i][1]["name_latin"];
                div.appendChild(h5);

                var small_1 = document.createElement("small");
                small_1.className = "text-body-secondary";
                small_1.innerHTML = 'Halaman '+halaman_awal_surah;
                div.appendChild(small_1);

                var small_2 = document.createElement("small");
                small_2.className = "text-body-secondary";
                small_2.innerHTML = 'Jumlah ayat : '+ arr_surah[i][1]["jumlah_ayat"];

                a.appendChild(div);
                a.appendChild(small_2);

                a.addEventListener('click', function(){
                    var ModalJuzSurah  = bootstrap.Modal.getOrCreateInstance(this.ModalJuzSurah);
                    ModalJuzSurah.hide();
                    this.RequestPage(halaman_awal_surah);
                }.bind(this));

                document.getElementById('divListJuzSurah').appendChild(a);
            }//end for i
        }//end if
    }

    // Group Method Bagian Pengaturan
    SetFontSize() {
        var obj_per_ayat = this.divContentCanvasPerAyat.getElementsByClassName('kata');
        for(var i = 0; i < obj_per_ayat.length; i++) {
            switch(this.UkuranFont) {
                case "besar":
                    obj_per_ayat[i].style.fontSize = "35px";
                    break;
                case "sedang":
                    obj_per_ayat[i].style.fontSize = "30px";
                    break;
                case "kecil":
                    obj_per_ayat[i].style.fontSize = "25px";
                    break;  
                default:
                    obj_per_ayat[i].style.fontSize = "35px";
                    break;
            }
        }
        var obj_per_kata = this.divContentCanvasPerKata.getElementsByClassName('kata');
        for(var j = 0; j < obj_per_kata.length; j++) {
            switch(this.UkuranFont) {
                case "besar":
                    obj_per_kata[j].style.fontSize = "35px";
                    break;
                case "sedang":
                    obj_per_kata[j].style.fontSize = "30px";
                    break;
                case "kecil":
                    obj_per_kata[j].style.fontSize = "25px";
                    break;  
                default:
                    obj_per_kata[j].style.fontSize = "35px";
                    break;
            }
        }
    }

    PengaturanTerjemah() {
        var div_ayat = document.getElementById('divContentCanvasPerAyat');
        var obj_arti_ayat = div_ayat.getElementsByClassName("arti");
        for(var i = 0; i < obj_arti_ayat.length; i++) {
            if(this.terjemah == 'show')
                obj_arti_ayat[i].style.display = "block";
            else if(this.terjemah == 'hidden')
                obj_arti_ayat[i].style.display = "none";
        }

        var div_kata = document.getElementById('divContentCanvasPerKata');
        var obj_arti_kata = div_kata.getElementsByClassName("arti");
        for(var i = 0; i < obj_arti_kata.length; i++) {
            if(this.terjemah == 'show')
                obj_arti_kata[i].style.display = "block";
            else if(this.terjemah == 'hidden')
                obj_arti_kata[i].style.display = "none";
        }
    }

    async prosentaseLocalStorage() {
        var totalStorage = 606;
        var jumlahStorage = await this.dataHandler.count();
        var prosentase = Math.ceil((jumlahStorage / totalStorage) * 100);
        return prosentase;
    }

    async UpdateProgressBarDownload(prosentase) {
        var divProgressLocalStrg = document.getElementById('divProgressLocalStrg');
        var divProgressBarLocalStrg = document.getElementById('divProgressBarLocalStrg');
        divProgressLocalStrg.setAttribute("aria-valuenow", prosentase);
        divProgressBarLocalStrg.style.width = prosentase+"%";
        divProgressBarLocalStrg.innerHTML = prosentase+"%";
    }

    async DownloadData() {
        for(var i = 1; i <= 606; i++) {
            try {
                if(i <= 604) {
                    const result = await this.Service.sendRequest('get', 'index/' + i.toString(), null);
                    await this.dataHandler.setItem(this.indexedDB_page + i.toString(), result);
                } else if (i == 605) {
                    const result = await this.Service.sendRequest('get', 'juz' , null);
                    await this.dataHandler.setItem(this.indexedDB_juz, result);
                } else if (i == 606) {
                    const result = await this.Service.sendRequest('get', 'list_surah' , null);
                    await this.dataHandler.setItem(this.indexedDB_list_surah, result);
                } 

                var progress = i;
                var persen = Math.ceil((progress / 606) * 100);
                await this.UpdateProgressBarDownload(persen.toString());
            } catch (error) {
                console.log(error);
            }
        }//end for
        document.getElementById('btnDownloadData').disabled = true;
        await this.RequestPage('1');
    }

    async EraseData() {
        if(confirm("Anda yakin akan menghapus seluruh data Al Quran dari browser anda?")) {
            try {
                //Hapus data Al Qur`an dari IndexedDB
                await this.dataHandler.clear();

                //Hapus penanda ayat dari localStorage
                localStorage.clear();

                document.getElementById('btnClearData').disabled = true;
                
                this.RequestPage('1');
                var prosentase = await this.prosentaseLocalStorage();
                await this.UpdateProgressBarDownload(prosentase);
            }catch(error) {
                console.log(error);
            }
        }
    }

    //Group Method untuk Penanda Ayat
    ShowDropDown(info, hidden_info){
        const modal = bootstrap.Modal.getOrCreateInstance(this.ModalPilihAyat);

        this.ModalPilihAyat.addEventListener('show.bs.modal', function (e) {
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        }.bind(this));

        modal.show();

        document.getElementById('ModalPilihAyatModalLabel').innerHTML = info;
        document.getElementById('txtInfoModal').value = hidden_info;
    }

    CopyToClipboard() {
        var split_hidden_info = document.getElementById('txtInfoModal').value.split("_");
        var id_element = split_hidden_info[1] + '_' + split_hidden_info[2];
        const ayat_copy = document.getElementById('per_ayat_' + id_element);
        try {
            navigator.clipboard.writeText(
                ayat_copy.childNodes[1].childNodes[0].innerHTML + '\n' +
                ayat_copy.childNodes[1].childNodes[1].innerHTML
            );
        } catch(err) {
            ayat_copy.focus();
            ayat_copy.select();
            document.execCommand('copy');
        }

        const modal = bootstrap.Modal.getOrCreateInstance(this.ModalPilihAyat);

        this.ModalPilihAyat.addEventListener('hidden.bs.modal', function (e) {
            window.scrollTo(0, this.scrollPosition);
        }.bind(this));

        modal.hide();
    }

    TandaAkhirBaca() {
        var div_ayat = document.getElementById('divContentCanvasPerAyat');
        var obj_ayat = div_ayat.getElementsByClassName("akhir_baca");
        for(var i = 0; i < obj_ayat.length; i++) {
            obj_ayat[i].className = "ayat";
        }

        var div_kata = document.getElementById('divContentCanvasPerKata');
        var obj_kata = div_kata.getElementsByClassName("akhir_baca");
        for(var i = 0; i < obj_kata.length; i++) {
            obj_kata[i].className = "ayat";
        }

        var split_hidden_info = document.getElementById('txtInfoModal').value.split("_");
        var id_element = split_hidden_info[1] + '_' + split_hidden_info[2];
        
        const tanda_per_ayat = document.getElementById('per_ayat_' + id_element);
        tanda_per_ayat.className = "ayat akhir_baca";

        const tanda_per_kata = document.getElementById('per_kata_' + id_element);
        tanda_per_kata.className = "ayat akhir_baca";

        const modal = bootstrap.Modal.getOrCreateInstance(this.ModalPilihAyat);

        this.ModalPilihAyat.addEventListener('hidden.bs.modal', function (e) {
            window.scrollTo(0, this.scrollPosition);
        }.bind(this));

        modal.hide();

        split_hidden_info.push(document.getElementById('ModalPilihAyatModalLabel').innerHTML);
        localStorage.setItem(this.localStrg_mark_read, JSON.stringify(split_hidden_info));
    }

    TampilkanTafsir() {
        const modal = bootstrap.Modal.getOrCreateInstance(this.ModalPilihAyat);

        this.ModalPilihAyat.addEventListener('hidden.bs.modal', function (e) {
            window.scrollTo(0, this.scrollPosition);
        }.bind(this));

        modal.hide();

        document.getElementById('ModalTafsirLabel').innerHTML = "Tafsir "+document.getElementById('ModalPilihAyatModalLabel').innerHTML;
        var split_hidden_info = document.getElementById('txtInfoModal').value.split("_");
        var id_tafsir = "tafsir_"+split_hidden_info[1] + '_' + split_hidden_info[2];
        var tempTafsir = document.getElementById(id_tafsir).innerHTML;
        var paragraf = tempTafsir.split("\n");
        var isiTafsir = "";
        for(var i = 0; i < paragraf.length; i++) {
            isiTafsir += "<p>" + paragraf[i] + "</p>";
        }

        document.getElementById('divIsiTafsir').innerHTML = isiTafsir;

        var modalTafsir  = bootstrap.Modal.getOrCreateInstance(this.ModalTafsir);
        modalTafsir.show();
    }

    LatinToArab(latinNumber) {
        // Peta konversi dari angka Latin ke angka Arab
        const latinToArabicMap = {
            '0': '٠',
            '1': '١',
            '2': '٢',
            '3': '٣',
            '4': '٤',
            '5': '٥',
            '6': '٦',
            '7': '٧',
            '8': '٨',
            '9': '٩'
        };

        // Mengonversi angka Latin ke angka Arab dengan menggunakan peta konversi
        let arabicNumber = '';
        for (let i = 0; i < latinNumber.length; i++) {
            let latinDigit = latinNumber[i];
            let arabicDigit = latinToArabicMap[latinDigit];
            arabicNumber += arabicDigit !== undefined ? arabicDigit : latinDigit; // Menangani karakter non-angka
        }
    
        return arabicNumber;
    }
}//end class

//Inisialisasi class HandleUI
window.addEventListener('load', async () => {
    const handleUI = new HandleUI();
    await handleUI.init();
});