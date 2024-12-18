api_url = "https://music.api.uxnz.net:6/";
playing = "";
cover_images = null;

document
    .getElementById("search_input")
    .addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            search_music();
        }
    });

function load_images(image_base64){
    if(image_base64 == ""){
        image_base64 = `url("data:image/svg+xml;base64,${night_image_base64()}")`;
    }else{
        image_base64 = `url("data:image/png;base64,${image_base64}")`;
    }
    document.getElementById("body").style.backgroundImage = image_base64;
    document.getElementById("music_player_data_cover").style.backgroundImage = image_base64;
    document.getElementById("init_player_cover").style.backgroundImage = image_base64;
}
window.onload = load_images("")

function change_music(music_file_name) {
    document.getElementById("myAudio").src =
        api_url + "resources/" + music_file_name;
    document.getElementById("myAudio").play();
    axios({
        method: "post",
        url: api_url + "get_music_metadata",
        data: {
            file: music_file_name
        },
    }).then(function (response) {
        console.log(response);
        data = response.data;
        cover_images = data.cover;
        document.getElementById("init_player_meta").innerHTML = data.title
        document.getElementById("music_player_data_title").innerHTML = data.title;
        document.getElementById("music_player_data_artist").innerHTML = data.artist;
        load_images(cover_images)
        lrc = data.lyrics;
        //load_lyrics();
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
        console.log(response);
        i = 0;
        while (response.data[i] !== undefined) {
            tempui +=
                '<div id="music_search_event" onclick="change_music(\'' +
                response.data[i].file +
                "')\">" +
                '<div class="music_search_event_title">' +
                response.data[i].title +
                "</div>" +
                '<div class="music_search_event_text">' +
                response.data[i].album +
                "</div>" +
                '<div class="music_search_event_text">' +
                response.data[i].artist +
                "</div>" +
                "</div>";
            i++;
        }
        tempui += `<div id="search_end">关键词 "${search_text}" 一共查询到${i}条结果`
        if (i==100){
            tempui += ` ( 超出 100 的结果将不会显示 ) `;
        }
        tempui += `</div>`
        document.getElementById("search_event").innerHTML = tempui
        
        console.log(i);
    });
}

function control_player(option) {
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
