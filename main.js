api_url = "https://music.api.uxnz.net:6/";
cover_images = null;

let audio = null;

let search_list = [];
let playlist = [];
let playindex = 0;

// 设置 Cookie
function setCookie(name, value, seconds) {
    let expires = "";
    if (seconds) {
        const date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// 读取 Cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function server_connect(request) {
    request['data']['token'] = getCookie("token");
    return axios(
        request
    ).then(function (response) {
        return response;
    }).catch(error => {
        if (error.response) {
          // 请求已发送，服务器响应了状态码，且状态码不在 2xx 范围内
          if (error.response.status === 403 && !error.response.data.token.valid) {
            setCookie("token", null, 0);
            exchenge_ui_flex(null, "page_player");
            exchenge_ui_flex("page_login", "page_home");
            throw new Error('token 过期'); 
          }
        }
    })
}

function loadStyle(cssPath) {
    // 创建一个 link 元素
    const link = document.createElement('link');
    // 设置 link 元素的属性
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = cssPath;
    // 获取文档的 head 元素
    const head = document.getElementsByTagName('head')[0];
    // 将 link 元素插入到 head 中
    head.appendChild(link);
}

function control_player_status(option) {
    if (option == 'next') {
        playindex = (playindex + 1 + playlist.length) % playlist.length;
        change_music(playindex);
    }
    if (option == 'previous') {
        playindex = (playindex - 1 + playlist.length) % playlist.length;
        change_music(playindex);
    }
    if (option == 'pause'){
        audio.pause();
        document.getElementById("music_player_status_control_pause").classList.remove("fa-pause");
        document.getElementById("music_player_status_control_pause").classList.add("fa-play");
    }
    if (option == 'play'){
        audio.play();
        document.getElementById("music_player_status_control_pause").classList.remove("fa-play");
        document.getElementById("music_player_status_control_pause").classList.add("fa-pause");
    }
    if (option == 'auto'){
        if(audio.paused){
            audio.play();
            document.getElementById("music_player_status_control_pause").classList.remove("fa-play");
            document.getElementById("music_player_status_control_pause").classList.add("fa-pause");
        }else{
            audio.pause();
            document.getElementById("music_player_status_control_pause").classList.remove("fa-pause");
            document.getElementById("music_player_status_control_pause").classList.add("fa-play");
        }
    }
        
}

function load_images(image_base64) {
    if (image_base64 == "") {
        return `url("data:image/svg+xml;base64,${night_image_base64()}")`;
    } else {
        return `url("data:image/png;base64,${image_base64}")`;
    }
}

function add_search_music_to_playlist(music_id){
    playlist.splice(playindex+1, 0, search_list[music_id]);
    control_player_status('next');
}

function change_music(music_id) {
    
    music_file_name = playlist[music_id];

    server_connect({
        method: "post",
        url: api_url,
        data: {
            get_music_metadata: music_file_name
        },
    }).then(function (response) {
        data = response.data.get_music_metadata;
        cover_images = data.cover;
        document.getElementById("init_player_meta").innerHTML = data.title
        document.getElementById("music_player_data_title").innerHTML = data.title;
        document.getElementById("music_player_data_artist").innerHTML = data.artist;
        cover_images_style = load_images(cover_images);
        document.body.style.backgroundImage = cover_images_style;
        document.getElementById("music_player_data_cover").style.backgroundImage = cover_images_style;
        document.getElementById("init_player_cover").style.backgroundImage = cover_images_style;
        lrc = data.lyrics;
        if ('mediaSession' in navigator) {

            navigator.mediaSession.metadata = new MediaMetadata({
                title: data.title,
                artist: data.artist,
                album: data.album,
                artwork: [
                    { src: "data:image/png;base64," + cover_images, sizes: '96x96', type: 'image/png;base64' }
                ]
            });
        }
        load_lyrics();
        //document.getElementById('body').style.backgroundImage = "url('"+api_url+"cover/"+music_file_name+"')"
    });

    /* server_connect({
        method: "post",
        url: api_url,
        data: {
            music_resources_access: music_file_name
        }
    }).then(function (response) {
        const blob = new Blob([response.data], { type: 'audio/flac' });
        const audioUrl = URL.createObjectURL(blob);
        audio.pause();
        audio.currentTime = 0;
        audio.src = audioUrl;
        audio.play();
    }) */

    audio.src = api_url + "resources/" + music_file_name + "?token=" + encodeURIComponent(getCookie("token"));
    control_player_status('play');


}

function change_kuwo_music(rid) {
    server_connect({
        url: "https://music.api.uxnz.net:6/",
        method: "post",
        data: {
            "resources_kw": {
                "get_music": {
                    "rid": rid
                }
            }
        }
    }).then(function (response) {
        data = response.data.resources_kw;
        if (data.get_music.code == 0) {
            playlist.splice(playindex+1, 0, data.get_music.save.file);
            control_player_status('next');
        }else{
            alert(data.get_music.message);
        }
    })
}

function search_kuwo_music() {
    search_text = document.getElementById("search_input").value
    server_connect({
        method: "post",
        url: "https://music.api.uxnz.net:6/",
        data: {
            "resources_kw": {
                "search": search_text
            }
        }
    }).then(function (response) {
        data = response.data.resources_kw;
        i = 0;
        tempui = ``;
        while (data['search'][i] !== undefined) {
            tempui += `
                <div id="music_search_event" onclick="change_kuwo_music(${data.search[i].rid});">
                    <div id="music_search_event_texts">
                        <div class="music_search_event_title"> ${data.search[i].title} </div>
                        <div class="music_search_event_text"> ${data.search[i].album} </div>
                        <div class="music_search_event_text"> ${data.search[i].artist} </div>
                    </div>
                </div>
            `;
            i++;
        }
        document.getElementById("search_event").innerHTML = tempui
    })
}

function search_music(){
     return text_search_music(document.getElementById("search_input").value);
}
function text_search_music(search_text,update=false) {
    server_connect({
        method: "post",
        url: api_url,
        data: {
            "search_music": search_text
        },
    }).then(function (response) {
        const data = response.data.search_music;
        i = 0;
        document.getElementById("search_text").innerHTML = `关键词 "${search_text}" 一共查询到${data.length}条结果`;
        tempui = "";
        while (i<data.length) {
            search_list[i] = data[i].file
            if(data[i].thumbnail == ""){
                img_url = `url('data:image/svg+xml;base64,${night_image_base64()}')`;
            }else{
                img_url = `url('data:image/jpeg;base64,${data[i].thumbnail}')`;
            }

            tempui += `
                <div id="music_search_event" onclick="add_search_music_to_playlist(${i});">
                    <div id="music_search_event_thumbnail" style="background-image: ${img_url}"></div>
                    <div id="music_search_event_texts">
                        <div class="music_search_event_title"> ${data[i].title} </div>
                        <div class="music_search_event_text">
                            <div> ${data[i].album} </div>
                            <div> ${data[i].artist} </div>
                        </div>
                    </div>
                </div>
            `;
            i++;
        }
        if(update){
            playlist = search_list;
        }
        
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

function exchenge_ui_flex(open, close) {
    if (open != null) {
        document.getElementById(open).style.display = "flex";
    }
    if (open != null) {
        document.getElementById(close).style.display = "none";
    }
}

function login() {
    username = document.getElementById("username_input").value;
    password = document.getElementById("password_input").value;
    axios({
        url: "https://account.api.uxnz.net:6/login",
        method: "post",
        data: {
            "email": username,
            "password": password
        }
    }).then(function (response) {
        data = response.data;
        if (data.code == 0) {
            setCookie("token", data.token, 7200);
            exchenge_ui_flex("page_home", "page_login");
            ui_load('box','recommendation');
        } else if (data.code == 1) {
            alert(data.msg);
        }
    })
}

function handleResize() {
    // 获取当前窗口的宽度
    const windowWidth = window.innerWidth;

    if (windowWidth < 750) {
        // 当窗口宽度小于阈值时修改 CSS 属性
        document.getElementById("panel").style.width = '50px';
    } else {
        // 当窗口宽度大于等于阈值时恢复初始样式
        document.getElementById("panel").style.width = '200px';
    }
}