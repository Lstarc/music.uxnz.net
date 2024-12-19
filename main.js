api_url = "https://music.api.uxnz.net:6/";
cover_images = null;

let audio = document.getElementById('myAudio');

let search_list = [];
let playlist = [];
let playindex = 0;

function control_player_status(option){
    if(option == 'next'){
        playindex = (playindex + 1 + playlist.length) % playlist.length;
        change_music(playindex);
    }
    if(option == 'previous'){
        playindex = (playindex - 1 + playlist.length) % playlist.length;
        change_music(playindex);
    }
}

function load_images(image_base64){
    if(image_base64 == ""){
        return `url("data:image/svg+xml;base64,${night_image_base64()}")`;
    }else{
        return `url("data:image/png;base64,${image_base64}")`;
    }
}

function update_playlist(music_list){
    playlist = music_list;
}

function change_music(music_id) {
    playindex = music_id;
    music_file_name = playlist[music_id];
    audio.src = api_url + "resources/" + music_file_name;
    audio.play();
    axios({
        method: "post",
        url: api_url + "get_music_metadata",
        data: {
            file: music_file_name
        },
    }).then(function (response) {
        data = response.data;
        cover_images = data.cover;
        document.getElementById("init_player_meta").innerHTML = data.title
        document.getElementById("music_player_data_title").innerHTML = data.title;
        document.getElementById("music_player_data_artist").innerHTML = data.artist;
        cover_images_style = load_images(cover_images);
        document.getElementById("body").style.backgroundImage = cover_images_style;
        document.getElementById("music_player_data_cover").style.backgroundImage = cover_images_style;
        document.getElementById("init_player_cover").style.backgroundImage = cover_images_style;
        lrc = data.lyrics;
        if ('mediaSession' in navigator) {

            navigator.mediaSession.metadata = new MediaMetadata({
            title: data.title,
            artist: data.artist,
            album: data.album,
            artwork: [
                { src: "data:image/png;base64,"+cover_images ,   sizes: '96x96',   type: 'image/png;base64' }
            ]
            });
        }
        load_lyrics();
        //document.getElementById('body').style.backgroundImage = "url('"+api_url+"cover/"+music_file_name+"')"
    });
}
function search_music() {
    tempui = "";
    search_text = document.getElementById("search_input").value;
    axios({
        method: "post",
        url: api_url + "search_music",
        data: {
            text: search_text
        },
    }).then(function (response) {
        //document.getElementById('search_event').innerHTML += '<div>这是新添加到目标 div 中的元素</div>';
        data = response.data
        i = 0;
        while (response.data[i] !== undefined) {
            search_list[i] = data[i].file
            tempui += `
                <div id="music_search_event" onclick="update_playlist(search_list);change_music(${i});">
                    <div class="music_search_event_title"> ${data[i].title} </div>
                    <div class="music_search_event_text"> ${data[i].album} </div>
                    <div class="music_search_event_text"> ${data[i].artist} </div>
                </div>
            `;
            i++;
        }
        tempui += `<div id="search_end">关键词 "${search_text}" 一共查询到${i}条结果`
        if (i==100){
            tempui += ` ( 超出 100 的结果将不会显示 ) `;
        }
        tempui += `</div>`
        document.getElementById("search_event").innerHTML = tempui
    });
}

function control_player_page(option) {
    if (option == "close") {
        document.getElementById("page_player").style.display = "none";
        document.getElementById("page_home").style.display = "flex";
    }
    if (option == "open") {
        document.getElementById("page_player").style.display = "flex";
        document.getElementById("page_home").style.display = "none";
        load_lyrics();
    }
}
