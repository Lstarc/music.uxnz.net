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

window.onload = document.getElementById("body").style.backgroundImage = load_images("");