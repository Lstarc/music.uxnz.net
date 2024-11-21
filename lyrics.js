// console.log(lrc);

var lrcData;
var doms = {};
var containerHeight;
var liHeight;
var maxOffset;

/**
 * 解析歌词字符串
 * 得到一个歌词对象的数组
 * 每个歌词对象: {time: 开始时间,words: 歌词内容}
 */
function parseLrc() {
    var lines = lrc.split('\n');
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        var str = lines[i];
        var parts = str.split(']');
        var timeStr = parts[0].substring(1);
        var obj = {
            time: parseTime(timeStr),
            words: parts[1]
        }
        result.push(obj);
    }
    return result;
}
/**
 * 将一个时间字符串解析成数字（秒）
 */
function parseTime(timeStr) {
    var parts = timeStr.split(':');
    return +parts[0] * 60 + +parts[1];
}


/**
 * 计算出在当前播放器播放到第几秒的情况下，
 * lrcData数组中，应高亮显示的歌词下标, 
 * 若没有任何一句歌词需要显示，得到-1
 */
function findIndex() {
    var curTime = doms.audio.currentTime;
    for (var i = 0; i < lrcData.length; i++) {
        if (curTime < lrcData[i].time) {
            return i - 1;
        }
    }
    // 找遍了还没找到，即最后一句
    return lrcData.length - 1;
}
// findIndex();

// 界面

/**
 * 创建歌词元素li
 */
function createLrcElements() {
    var frag = document.createDocumentFragment(); // 文档片段
    for (var i = 0; i < lrcData.length; i++) {
        var li = document.createElement('li');
        li.textContent = lrcData[i].words;
        //doms.ul.appendChild(li);  //改动了dom树
        frag.appendChild(li);
    }
    doms.ul.appendChild(frag);
}



function setOffset() {
    var index = findIndex();
    var offset = liHeight * index + liHeight / 2 - containerHeight / 2;
    offset = offset < 0 ? 0 : offset;
    offset = offset > maxOffset ? maxOffset : offset;
    doms.ul.style.transform = `translateY(-${offset}px)`
    // 去掉之前的active样式
    var li = doms.ul.querySelector('.active')
    if (li) {
        li.classList.remove('active')
    }
    li = doms.ul.children[index];
    if (li) {
        li.classList.add('active');
    }

}

function load_lyrics() {
    
    document.getElementById('music_player_lyrics').innerHTML = '<div class="container">\n<ul class="lrc-list">\n</ul>\n</div>';

    lrcData = parseLrc();
    // console.log(lrcData);

    // 获取需要的dom
    doms = {
        audio: document.querySelector('audio'),
        ul: document.querySelector('.container ul'),
        container: document.querySelector('.container')
    }

    createLrcElements();

    // 容器高度
    containerHeight = doms.container.clientHeight;
    // 每个li的高度
    liHeight = doms.ul.children[0].clientHeight;
    // 最大偏移量
    maxOffset = doms.ul.clientHeight - containerHeight;
    /**
     *  设置ul元素的偏移量
     */

    doms.audio.addEventListener('timeupdate', setOffset)
}