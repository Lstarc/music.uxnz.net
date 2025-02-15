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
    return axios(request).then(function (response) {
        if (response.data.token !== undefined) {
            if (response.data.token.valid == false) {
                setCookie("token", null, 0);
                exchenge_ui_flex(null, "page_player");
                exchenge_ui_flex("page_login", "page_home");
            }
        }

        return response;
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
}

function load_images(image_base64) {
    if (image_base64 == "") {
        return `url("data:image/svg+xml;base64,${night_image_base64()}")`;
    } else {
        return `url("data:image/png;base64,${image_base64}")`;
    }
}

function update_playlist(music_list) {
    playlist = music_list;
}

function change_music(music_id) {

    playindex = music_id;
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
    audio.play();
    
    
}

function change_kuwo_music(rid) {
    axios({
        url: "https://music.api.uxnz.net:6/resources/kw",
        method: "post",
        data: {
            "get_music": {
                "rid": rid
            }
        }
    }).then(function (response) {
        data = response.data;
        if (data.get_music.code == 0) {
            playlist[0] = data.get_music.save.file;
            change_music(0);
        }
    })
}

function search_kuwo_music() {
    search_text = document.getElementById("search_input").value
    axios({
        method: "post",
        url: "https://music.api.uxnz.net:6/resources/kw",
        data: {
            "search": {
                "search_music": search_text
            }
        }
    }).then(function (response) {
        data = response.data;
        i = 0;
        tempui = ``;
        while (data['search'][i] !== undefined) {
            search_list[i] = data.search[i].file
            tempui += `
                <div id="music_search_event" onclick="change_kuwo_music(${data.search[i].rid});">
                    <div class="music_search_event_title"> ${data.search[i].title} </div>`;
            if (targetPage == "desktop.html") {
                tempui += `<div class="music_search_event_text"> ${data.search[i].album} </div>`;
            }

            tempui += `<div class="music_search_event_text"> ${data.search[i].artist} </div>
                </div>
            `;
            i++;
        }
        document.getElementById("search_event").innerHTML = tempui
    })
}

function search_music() {
    tempui = "";
    search_text = document.getElementById("search_input").value;
    server_connect({
        method: "post",
        url: api_url,
        data: {
            "search_music": search_text
        },
    }).then(function (response) {
        console.log(response)
        const data = response.data.search_music;
        i = 0;
        while (data[i] !== undefined) {
            search_list[i] = data[i].file
            tempui += `
                <div id="music_search_event" onclick="update_playlist(search_list);change_music(${i});">
                    <div class="music_search_event_title"> ${data[i].title} </div>`;
            if (targetPage == "desktop.html") {
                tempui += `<div class="music_search_event_text"> ${data[i].album} </div>`;
            }
            tempui += `<div class="music_search_event_text"> ${data[i].artist} </div>
                </div>
            `;
            i++;
        }
        tempui += `<div id="search_end">关键词 "${search_text}" 一共查询到${i}条结果`
        if (i == 100) {
            tempui += ` ( 超出 100 的结果将不会显示 ) `;
        }
        tempui += `<a onclick="search_kuwo_music()">尝试kowo搜索</a>`
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

function exchenge_lyrics_exec(option) {
    if (option == "close") {
        document.getElementById("music_player_lyrics").style.display = "none";
        document.getElementById("music_player_meta").style.display = "flex";
    }
    if (option == "open") {
        document.getElementById("music_player_lyrics").style.display = "flex";
        document.getElementById("music_player_meta").style.display = "none";
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
        } else if (data.code == 1) {
            alert(data.msg);
        }
    })
}