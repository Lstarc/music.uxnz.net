function init() {
    loadStyle("light.css");

    audio = document.getElementById('myAudio');

    navigator.mediaSession.setActionHandler('previoustrack', function () {
        // User clicked "Previous Track" media notification icon.
        control_player_status('previous');
    });

    navigator.mediaSession.setActionHandler('nexttrack', function () {
        // User clicked "Next Track" media notification icon.
        control_player_status('next');
    });

    audio.onended = function () {
        control_player_status('next');
    }

    cover_images_style = load_images("");
    document.body.style.backgroundImage = cover_images_style;
    document.getElementById("music_player_data_cover").style.backgroundImage = cover_images_style;
    document.getElementById("init_player_cover").style.backgroundImage = cover_images_style;

    token = getCookie('token')
    if (token != null) {
        axios({
            url: "https://music.api.uxnz.net:6/",
            method: "post",
            data: {
                "token": token
            }
        }).then(function (response) {
            data = response.data;
            if (data.token.valid == true) {
                document.getElementById("page_home").style.display = "flex";
                ui_load('box', 'recommendation');
            }
        }).catch(error => {
            if (error.response) {
                // 请求已发送，服务器响应了状态码，且状态码不在 2xx 范围内
                if (error.response.status === 403 && !error.response.data.token.valid) {
                    document.getElementById("page_login").style.display = "flex";
                    setCookie("token", null, 0);
                }
            }
        })
    } else {
        document.getElementById("page_login").style.display = "flex";
    }

    // 监听窗口大小改变事件

    window.addEventListener('resize', handleResize);
    // 页面加载时也执行一次处理函数，确保初始状态正确
    handleResize();
}