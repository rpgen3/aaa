(function() {
    'use strict';
    const rpgen3 = window.rpgen3,
          $ = window.$;
    const h = $("<div>").appendTo($("body")).css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>",{text:"GIF Maker from AAA"}).appendTo(h);
    const inputAAA = rpgen3.addInputText(h,{
        textarea: true,
        placeholder: "input area of AAA",
        save: "inputAAA",
        trim: false,
        hankaku: false,
    });
    const inputDelay = rpgen3.addInputNumber(h,{
        title: "フレーム毎ミリ秒",
        placeholder: "delay[ms]",
        save: "inputDelay",
        value: 30,
    });
    const inputW = rpgen3.addInputNumber(h,{
        title: "幅",
        save: "width",
        value: 320,
    });
    const inputH = rpgen3.addInputNumber(h,{
        title: "高さ",
        save: "height",
        value: 160,
    });
    const inputUnitSize = rpgen3.addInputNumber(h,{
        title: "文字サイズ",
        save: "unit",
        value: 16,
    });
    function addInputColor(title,value){
        const s = title,
              e = $("<input>",{type:"color"}).appendTo($("<div>",{text:title + ":"}).appendTo(h))
        .on("change",()=>rpgen3.save(s,e.val())).val(value);
        rpgen3.load(s,v=>{
            e.val(v);
        });
        return () => e.val();
    }
    const inputFontColor = addInputColor("文字の色","#0000FF");
    const inputBackColor = addInputColor("透明色の設定","#FF0000");
    $("<button>").appendTo(h).text("ユーザー定義絵文字の追加").on("click",loadImg);
    const itemList = $("<div>").appendTo(h);
    $("<button>").appendTo(h).text("変換").on("click",makeGIF);
    const result = $("<div>").appendTo(h);
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
              name = $("<span>").appendTo(item).text(' ' + title.slice(0,20) + "："),
              height = name.height();
        archive[now] = img;
        $("<img>",{src:img.src}).prependTo(item).css({
            width: height,
            height: height
        });
        $("<input>").appendTo(item).attr({
            placeholder: "置換文字列",
        }).css({
            width: "5em"
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
        const encoder = new GIFEncoder();
        encoder.setRepeat(0); //繰り返し回数 0=無限ループ
        encoder.setDelay(inputDelay()); //1コマあたりの待機秒数（ミリ秒）
        encoder.setQuality(10); // 色量子化の品質を設定
        encoder.setTransparent(parseInt(inputBackColor().slice(1),16)); // 最後に追加されたフレームと後続のフレームの透明色を設定
        encoder.start()
        const cv = $("<canvas>").attr({
            width: inputW(),
            height: inputH()
        });
        const ctx = cv.get(0).getContext('2d');
        ctx.globalAlpha = 1.0;
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        const unitSize = inputUnitSize(),
              items = getItems();
        inputAAA().replace(/^@AAA:.*?\n/,'').split(/\n?@@@\n?/).forEach(v=>{
            ctx.fillStyle = inputBackColor();
            ctx.fillRect(0, 0, cv.get(0).width, cv.get(0).height);
            v.split('\n').forEach((line,i)=>{
                let ar = [line];
                for(const k in items) {
                    let ar2 = [];
                    ar.forEach(v=>{
                        if(typeof v !== "string") return ar2.push(v);
                        v.split(k).forEach((v,i)=>{
                            if(!i) return ar2.push(v);
                            ar2.push(items[k]);
                            ar2.push(v);
                        });
                    });
                    ar = ar2;
                }
                ctx.fillStyle = inputFontColor();
                ctx.font = unitSize + "px 'ＭＳ ゴシック'";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                const nowY = unitSize * i;
                let nowX = 0;
                ar.forEach(v=>{
                    if(typeof v === "string") {
                        ctx.fillText(v, nowX, nowY);
                        ctx.strokeText(v, nowX, nowY);
                        nowX += ctx.measureText(v).width;
                    }
                    else {
                        ctx.drawImage(v, nowX, nowY, unitSize, unitSize);
                        nowX += unitSize;
                    }
                });
            });
            encoder.addFrame(ctx);
        });
        encoder.finish();
        result.append("<br><br>");
        $("<button>",{text:"ダウンロード"}).click(function(){
            encoder.download("aaa".replace(/\..*$/,'') + ".gif");
        }).appendTo(result.empty());
        result.append("<br>");
        const url = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
        $("<img>",{src:url}).appendTo(result);
    }
})();
