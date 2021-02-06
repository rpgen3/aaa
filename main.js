(function() {
    'use strict';
    var rpgen3 = window.rpgen3,
        $ = window.$;
    var h = $("<div>").appendTo($("body")).css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>",{text:"GIF Maker from AAA"}).appendTo(h);
    var inputAAA = yaju1919.addInputText(h,{
        textarea: true,
        placeholder: "input area of AAA",
        save: "inputAAA",
    });
    var inputTime = yaju1919.addInputNumber(h,{
        textarea: true,
        placeholder: "input area of AAA[ms]",
        save: "inputTime",
    });
    $("<button>").appendTo(h).text("ユーザー定義絵文字の追加").on("click",()=>{});
    var itemList = $("<div>").appendTo(h);
    $('<style>').prependTo(h).html(`
.item:hover {
background-color:rgba(0, 0, 255, 1.0);
}
`);
    const archive = {};
    function getItems(){
        const obj = {};
        $(".item").each((i,e)=>{
            const k = $(e).find("input").val();
            if(!k) return;
            obj[k] = archive[$(e).attr('k')];
        })
        return obj;
    }
    function addItem(img, title){
        const now = String(new Date),
              item = $("<div>").prependTo(itemList).addClass("item").attr({k: now}),
              name = $("<span>").appendTo(item).text(' ' + title.slice(0,20)),
              height = name.height();
        archive[now] = img;
        $("<img>",{src:img.src}).prependTo(item).css({
            width: height,
            height: height
        });
        $("<input>").appendTo(item).attr({
            placeholder: "置換する文字列",
        }).on("change", function(){
            $(this).val($(this).val().trim());
        });
        $("<span>").appendTo(item).text("×").css({
            "font-weight": "bold",
            color: "white",
            backgroundColor : "red",
        }).on("click",()=>{
            item.remove();
        });
    }
    function loadImg(){
        $("<input>").attr({type:"file"}).on("change",e=>{
            const file = e.target.files[0];
            if(!file) return;
            const img = new Image();
            img.onload = () => {
                addImgList(img, file.name);
                processImg(img);
            };
            img.src = URL.createObjectURL(file);
        }).get(0).click();
    }
    $("<button>").appendTo(h).text("変換").on("click",()=>{});
})();
