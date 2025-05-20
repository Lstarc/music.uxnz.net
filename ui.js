const static_ui = {
    box: {
        home: ``,
        search: `
            <div id="search_info">
                <input id="search_input" type="text" value="" placeholder="歌曲搜索" />
                <span id="search_text"></span><span onclick="search_kuwo_music()"> 尝试kowo搜索 </span>
            </div>
            <div id="search_event"></div>
        `,
        recommendation: `
            <span id="search_text" style="display:none;"></span>
            <div id="search_event"></div>
        `
    }
}
var dynamic_ui = static_ui;

function ui_load(ui_class, ui_box) {
    document.getElementById(ui_class).innerHTML = dynamic_ui[ui_class][ui_box];
    if (ui_class == 'box') {
        if (ui_box == 'search') {
            document.getElementById("search_input").addEventListener("keyup", function (event) {
                if (event.key === "Enter") {
                    search_music();
                }
            });
        }
        if(ui_box == "recommendation"){
            text_search_music(' ',true);
        }
    }
}

