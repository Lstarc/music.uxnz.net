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
        document.getElementById("body").style.backgroundImage = `url("data:image/jpeg;base64,${cover_images}")`;
        document.getElementById("music_player_data_cover").style.backgroundImage = `url("data:image/jpeg;base64,${cover_images}")`;
        document.getElementById("init_player_cover").style.backgroundImage = `url("data:image/jpeg;base64,${cover_images}")`;
        lrc = data.lyrics;
        //load_lyrics();
        //document.getElementById('body').style.backgroundImage = "url('"+api_url+"cover/"+music_file_name+"')"
    });
}
function search_music() {
    document.getElementById("search_event").innerHTML = "";
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
            document.getElementById("search_event").innerHTML +=
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
