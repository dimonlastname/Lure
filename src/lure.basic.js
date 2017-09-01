//Tutorial
//TargetButton = {string, HTMLElement} - button who start the tutor
//TargetContent = {string, HTMLElement} - select/element where search tutors
Lure.Plugin.Tutor = class MonsieurTutor{
    /**
     *
     * @param {HTMLElement} TargetButton
     * @param {HTMLElement} TargetContent
     */
    constructor(TargetButton = null, TargetContent = null){
        //### DEFINES
        let $this = this;
        this.TargetButton = Lure.Select(TargetButton);
        this.TargetContent = Lure.Select(TargetContent);
        const MT = `<div class="lure-tutor">
                        <div class="cd-caption">
                            <span>Шаг </span>
                            <span class="lure-tutor_step"></span>
                        </div>
                        <div class="lure-tutor_desc"></div>
                        <div class="lure-tutor_btns">
                            <button class="button btn-tutor btn-tutor-stop">Прервать обучение</button>
                            <button class="button btn-tutor btn-tutor-next">Далeе →</button></div>
                   </div>`;
        this.Content = Lure.CreateElementFromString(MT);
        this.ContentBG = Lure.CreateElementFromString('<div class="lure-tutor-bg dialog-wrapper"></div>');
        this.Content.style.display = 'none';
        this.ContentBG.style.display = 'none';
        this._Description = this.Content.querySelector('.lure-tutor_desc');
        this._Step = this.Content.querySelector('.lure-tutor_step');
        this._ButtonNext = this.Content.querySelector('.btn-tutor-next');
        this._ButtonStop = this.Content.querySelector('.btn-tutor-stop');

        $this.Data = [];
        const ButtonNextText = this._ButtonNext.innerHTML;
        let TutorPosition = 0;
        /*get transparent*/
        let temp = document.createElement('div');
        temp.style.display = 'none';
        document.body.appendChild(temp);
        const ColorTransparent = window.getComputedStyle(temp).backgroundColor;
        temp.remove();
        //---
        const ElemCssRestore = function () {
            let Element = $this.Data[TutorPosition-1].obj;
            if (Element.tagName.toLowerCase() !== 'tr')
            {
                Element.style.zIndex = '';
                Element.style.position = '';
                Element.style.outline = '';
                Element.style.display = '';
                Element.style.backgroundColor = '';
                return;
            }
            let nElements = Element.querySelectorAll('th, td');
            nElements.forEach(function (elem) {
                elem.style.position = '';
                elem.style.zIndex = '';
            });
        };
        const ElemCssSet = function (Element) {
            if (Element.tagName.toLowerCase() !== 'tr')
            {
                Element.style.zIndex = '11';
                Element.style.position = 'relative';
                Element.style.outline = '5px #bee0ff solid';
                let style = window.getComputedStyle(Element);
                if (style.backgroundColor === ColorTransparent)
                    Element.style.backgroundColor = "#fff";
                if (!Lure.isVisible(Element) )
                {
                    if (Element.tagName.toLowerCase() !== "table" )
                        Element.style.display = 'block';
                    else
                        Element.style.display = 'table';
                }
                /* if (Element.length > 1)
                 Element.eq(1).css({zIndex: '', outline: ''});*/
                return;
            }
            let nElements = Element.querySelectorAll('th, td');
            nElements.forEach(function (elem) {
                elem.style.zIndex = "11";
                elem.style.position = "relative";
                let style = window.getComputedStyle(elem);
                if (style.backgroundColor === ColorTransparent){
                    elem.style.backgroundColor = "#fff";
                }
            });
            /* if (Element.length > 1)
             Element.eq(1).css({zIndex: '', outline: ''});*/
        };
        const Run = function () {
            console.log("tutor run");
            if ($this.TargetContent === null)
                return;
            let Items = $this.TargetContent.querySelectorAll('*[data-tutor]:not([data-line]), *[data-tutor][data-line="0"]');
            if (Items.length < 1){
                Lure.Confirm("Сообщение", "На этом экране нет подсказок");
                return;
            }
            // document.body.style.position = 'relative';

            Items.forEach(function (item) {
                $this.Data.push({
                    obj: item,
                    desc: item.dataset['tutor']
                })
            });
            $this.Content.style.display = '';
            $this.ContentBG.style.display = '';
            GoStep();
        };
        const GoStep = function () {
            //restore prev element's css
            if (TutorPosition > 0)
                ElemCssRestore();
            if (TutorPosition === $this.Data.length)
            {
                Stop();
                return;
            }
            //select next elem
            let Element = $this.Data[TutorPosition].obj;
            let ElementDesc = $this.Data[TutorPosition].desc;
            // check for invisible parent
            let ElemParent = ElementDesc.match(/{([\s\S]+)}/);
            if (ElemParent !== null)
            {
                ElemParent = ElemParent[1];
                ElementDesc = ElementDesc.replace(/{([\s\S]+)}/, '');
                Element = Element.closest(ElemParent);
                $this.Data[TutorPosition].obj = Element;
                //Element.push( );
            }
            //set element visible
            ElemCssSet(Element);
            //write new element title and desc
            $this._Step.innerHTML = (TutorPosition+1) + "/"+$this.Data.length;
            $this._Description.innerHTML = ElementDesc;
            //caption next button
            if ((TutorPosition+1) === $this.Data.length)
            {
                $this._ButtonNext.innerHTML = 'Завершить';
                $this._ButtonStop.style.opacity = '0';
            }

            //move tutor desc box
            let posX = Element.offsetLeft + Element.clientWidth + 10;
            let posY = Element.offsetTop - $this.Content.clientHeight - 10;
            if (posY < 10)
                posY = 10;
            if ( (posX + $this.Content.clientWidth) > window.innerWidth )
            {
                posX = Element.offsetLeft - $this.Content.clientWidth - 10;
                if (window.innerWidth < $this.Content.clientWidth + Element.clientWidth)
                {
                    posX = Element.offsetLeft + Element.clientWidth - $this.Content.clientWidth - 20;
                }

            }
            if (document.documentElement.scrollTop  > posY || document.documentElement.scrollTop + window.innerHeight < Element.offsetTop + Element.offsetHeight)
            {
                //$('html, body').animate({scrollTop: posY - 10}, 300);
                document.documentElement.scrollTop =  (posY - 10)  +'px';
            }
            if (posX < 10)
                posX = 10;
            $this.Content.style.left = posX +'px';
            $this.Content.style.top = posY +'px';

            TutorPosition++;
        };
        const Stop = function () {
            //     document.body.style.position = '';
            ElemCssRestore();
            $this.Content.style.display = 'none';
            $this.ContentBG.style.display = 'none';
            $this._ButtonNext.innerHTML = ButtonNextText;
            $this._ButtonStop.style.opacity = '';
            TutorPosition = 0;
            $this.Data = [];
        };
        //### CONSTRUCT

        this.TargetButton.onclick = Run;
        this._ButtonNext.onclick = GoStep;
        this._ButtonStop.onclick = Stop;

        document.body.appendChild(this.Content);
        document.body.appendChild(this.ContentBG);

        //### METHODS
        this.Run = Run;

    }
};




Lure.Plugin.Load = class MonsieurLoading{
    constructor(
        {
            Target = 'body'
        } = {}
    ){
        this.Target = Lure.Select(Target);
        this.Target.style.position = 'relative';
        this.Content = Lure.CreateElementFromString(`<div class="ajax-loading" style="display: none"></div>`);
        let cx = 60; //diameter
        let cy = 60;
        let _DoArc = function(radius, maxAngle){
            let d = " M "+ (cx + radius) + " " + cy;
            for (let angle = 0; angle < maxAngle; angle++)
            {
                let rad = angle * (Math.PI / 180);  //deg to rad
                let x = cx + Math.cos(rad) * radius;
                let y = cy + Math.sin(rad) * radius;
                d += " L "+x + " " + y;
            }
            return d;
        };
        let svg = `<svg xmlns="http://www.w3.org/2000/svg">
                     <path d="${_DoArc(45, 160)}" class="lure-arc1" fill="none" stroke="#449b22" stroke-width="5"></path>
                     <path d="${_DoArc(40, 130)}" class="lure-arc2" fill="none" stroke="#61c8de" stroke-width="5"></path>
                     <path d="${_DoArc(35, 100)}" class="lure-arc3" fill="none" stroke="#761c19" stroke-width="5"></path>
                     <path d="${_DoArc(30, 70)}"  class="lure-arc4" fill="none" stroke="#333333" stroke-width="5"></path>
                   </svg>`;
        this.Target.appendChild(this.Content);
        this.Content.innerHTML = svg;
        this.Timeout = null;
    }
    Show(){
        let $this = this;
        this.Content.style.display = '';
        clearTimeout(this.TimeoutHide);
        this.Timeout = setTimeout(function(){
            $this.Content.style.display = 'block';
        }, 70);
    }
    Hide(){
        let $this = this;
        clearTimeout(this.Timeout);
        this.TimeoutHide = setTimeout(function(){
            $this.Content.style.display = 'none';
        }, 250); //hide may be called in same time as the show()
    }
};

Lure.Plugin.Tooltip = class MonsieurTooltip{
    constructor({
                    Target    = document,           //Target-listener (global document by default)
                    Attribute = "data-tooltip",     // data-tooltip="Help text here"
                    Delay     = 400,                //delay before tooltip show
                    Time      = 1100,               //showing time
                    Cursor    = "help",             //item:hover cursor
                    Custom    = `<div class="lure-tooltip">`,               //custom html of tooltip
                    AfterBuild = function(){}

                })
    {
        let $this = this;
        this.ToolTip = Lure.CreateElementFromString(Custom);
        let Timer = null;
        let Destr = null;
        this.Target = Lure.Select(Target);
        const Show = function (text){
            this.ToolTip.innerHTML = text;
            $this.Target.appendChild(this.ToolTip);

        }.bind(this);
        Lure.AddEventListenerGlobal('mouseover', `[${Attribute}]`, function (e) {
            let text = e.currentTarget.dataset[Attribute.replace('data-', '')];
            clearTimeout(Destr);
            Timer = setTimeout(function(){
                Show(text);
            }, Delay);
        }, this.Target);
        Lure.AddEventListenerGlobal('mouseout', `[${Attribute}]`, function (e) {
            clearTimeout(Timer);
            Destr = setTimeout(function () {
                //$this.ToolTip.remove();
            }, Time)
        }, this.Target);
        setTimeout(function () {
            AfterBuild.bind($this);
        }, 0)
    }

};



Lure.Tutor = Lure.Plugin.Tutor;
Lure.Load = Lure.Plugin.Load;
Lure.Tooltip = Lure.Plugin.Tooltip;




/*
 class yWatcher {
 constructor(target, handler, level) {
 let $this = this;
 let mirror = JSON.parse(JSON.stringify(target));
 let watch = {};
 function setGetSet(obj, prop, handler, tar) {
 let oldval = obj[prop];
 let newval = oldval;
 this['_'+prop] = obj[prop];
 let getter = function () {
 return this['_'+prop];
 };
 let setter = function (val) {
 oldval = newval;

 tar[prop] = val;
 console.log('xo', target);
 if (Array.isArray(val) || typeof val === typeof {}) {
 setWatcher(val, [prop]);
 }
 return newval = handler.call(obj, prop, oldval, val);
 };
 obj["_"+prop] = obj[prop];
 if (delete obj[prop]) { // can't watch constants
 Object.defineProperty(obj, prop, {
 get: getter,
 set: setter,
 enumerable: true,
 configurable: true
 });

 }


 }

 function GetterSetter(obj, prop, deepprop) {
 //watch['_'+deepprop] = obj[prop];
 console.log('watch', watch);
 console.log('obdp', obj, `prop: ${prop}`, `deepprop: ${deepprop}`);
 let x = eval(`watch${deepprop}`);
 console.log('x', x);

 x['_'+prop] = obj[prop];
 let getter = function () {
 if (deepprop !== '')
 return target[deepprop][prop];
 return target[prop];
 };

 let setter = function (val) {
 let oldval;
 if (deepprop !== '')
 oldval = target[deepprop][prop];
 oldval = target[prop];
 console.log('xo', target);
 //if (Array.isArray(val) || typeof val === typeof {}) {
 //    setWatcher(val, [prop]);
 //}
 if (deepprop !== '')
 target[deepprop][prop] = val;
 target[prop] = val;
 return handler.call(obj, prop, oldval, val);
 };
 Object.defineProperty(x, prop, {
 get: getter,
 set: setter,
 enumerable: true,
 configurable: true
 });
 }
 this.GetDeep = function getOfDeep(deep){
 let s='';
 for (let i = 0; i < deep.length; i++){
 if (typeof deep[i] === 'undefined' || !deep[i])
 return s;
 s += `["${deep[i]}"]`;
 }
 return s;
 };
 let lvl = 0;
 let deep = [];
 function setWatcher(obj,) {
 //      debugger;
 if (!Array.isArray(obj) && typeof obj === typeof {}) {
 for (let k in obj) {
 if (obj.hasOwnProperty(k)) {
 GetterSetter(obj, k, $this.GetDeep(deep));
 // setGetSet(obj, k, handler, eval('target'+$this.GetDeep(deep)));
 if (Array.isArray(obj[k]) || typeof obj[k] === typeof {}) {
 deep.push(k);
 lvl++;
 setWatcher(JSON.parse(JSON.stringify(obj[k])));
 // continue;
 }
 //deep.slpice(deep.length-1, 1);
 }
 }
 return
 }
 console.log('-array: ', obj);
 }
 setWatcher(mirror);
 this.o = mirror;
 this.watch = watch;
 }
 }
 //let xo = {name: "vasan", val: 12, a: {b:'', c: ''}, arr: [11,22]};
 let xo = {a: 'vasya', b: 42, c:{d: 'valued'}};
 let wa = new Watcher(xo, console.log);
 console.log('---');
 console.log('xo', xo);
 console.log('wa', wa);

 */