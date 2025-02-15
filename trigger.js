function init(){
    audio = document.getElementById('myAudio');

    navigator.mediaSession.setActionHandler('previoustrack', function() {
        // User clicked "Previous Track" media notification icon.
        control_player_status('previous');
    });

    navigator.mediaSession.setActionHandler('nexttrack', function() {
        // User clicked "Next Track" media notification icon.
        control_player_status('next');
    });

    audio.onended = function () {
        control_player_status('next');
    }

    document.getElementById("search_input").addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                search_music();
            }
        });
    
    cover_images_style = load_images("");
    document.body.style.backgroundImage = cover_images_style;
    document.getElementById("music_player_data_cover").style.backgroundImage = cover_images_style;
    document.getElementById("init_player_cover").style.backgroundImage = cover_images_style;
    
    token = getCookie('token')
    if (token != null){
        axios({
            url:"https://music.api.uxnz.net:6/",
            method:"post",
            data:{
                "token":token
            }
        }).then(function (response){
            data = response.data;
            if (data.token.valid == true){
                exchenge_ui_flex("page_home","page_login");
            }else{
                setCookie("token",null,0);
            }
        })
    }
}