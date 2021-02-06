(function() {
    'use strict';
    var rpgen3 = window.rpgen3,
        $ = window.$;
    var h = $("<div>").appendTo($("body")).css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>",{text:"GIF Maker from AAA"}).appendTo(h);
    var inputAAA = rpgen3.addInputText(h,{
        textarea: true,
        placeholder: "input area of AAA",
        save: "inputAAA",
    });
    var inputDelay = rpgen3.addInputNumber(h,{
        placeholder: "delay[ms]",
        save: "inputDelay",
    });
    var inputW = rpgen3.addInputNumber(h,{
        title: "width",
        save: "width",
        value: 320,
    });
    var inputH = rpgen3.addInputNumber(h,{
        title: "height",
        save: "height",
        value: 160,
    });
    var inputUnitSize = rpgen3.addInputNumber(h,{
        title: "unit",
        save: "unit",
        value: 16,
    });
    var inputColor = (()=>{
        var s = "input_color",
            e = $("<input>",{type:"color"}).appendTo($("<div>",{text:"透明色の設定:"}).appendTo(h))
        .on("change",()=>rpgen3.save(s,e.val()));
        rpgen3.load(s,v=>{
            e.val(v);
        });
        return e;
    })();
    $("<button>").appendTo(h).text("ユーザー定義絵文字の追加").on("click",()=>{});
    var itemList = $("<div>").appendTo(h);
    $("<button>").appendTo(h).text("変換").on("click",makeGIF);
    const result = $("<div>").appendTo(h);
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
            img.onload = () => addItem(img, file.name);
            img.src = URL.createObjectURL(file);
        }).get(0).click();
    }
    function makeGIF(){
        var encoder = new GIFEncoder();
        encoder.setRepeat(0); //繰り返し回数 0=無限ループ
        encoder.setDelay(inputDelay()); //1コマあたりの待機秒数（ミリ秒）
        encoder.setQuality(10); // 色量子化の品質を設定
        encoder.setTransparent(parseInt(inputColor.val().slice(1),16)); // 最後に追加されたフレームと後続のフレームの透明色を設定
        encoder.start()
        var cv = $("<canvas>").attr({
            width: inputW(),
            height: inputH()
        });
        var ctx = cv.get(0).getContext('2d');
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        const unitSize = inputUnitSize();
        inputAAA().split("\n@@@\n").forEach(v=>{
            ctx.fillStyle = inputColor.val();
            ctx.fillRect(0, 0, cv.get(0).width, cv.get(0).height);
            v.split('\n').forEach((line,i)=>{
                ctx.fillStyle = "black";
                ctx.font = unitSize + "px 'ＭＳ ゴシック'";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillText(line, 0, unitSize * i);
            });
            encoder.addFrame(ctx);
        });
        encoder.finish();
        result.append("<br><br>");
        $("<button>",{text:"ダウンロード"}).click(function(){
            encoder.download("aaa".replace(/\..*$/,'') + ".gif");
        }).appendTo(result.empty());
        result.append("<br>");
        var url = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
        $("<img>",{src:url}).appendTo(result);
    }
})();
