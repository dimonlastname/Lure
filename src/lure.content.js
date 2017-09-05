//sets = {
//  SubContent: [
//      {sets},                             -same object to create subs
// ],
//
// Controller:{                                   - if needs some Template master
//    Type: Templator,                                    - class link [optional] Templator by default
//    Target: {string|HTMLElement}                        -[optional] if Controller.Target is undefined, Controller.Target = sets.Target
//    Data: {array|object},                               - data array [optional] Data === [] by default
//    ListElement: {string|HTMLElement},                  - repeated element
//    EmptyMessage: "no items",                           - render if Data.length === 0;

//  Control: {
//    Target: {string, jQuery, HTMLElement},
//    Global: {bool}                               - set global event listener. Set true if control renders after init or it renders dynamicly
//    OnClick: {function}                          - here this === current Lure.Content
//    OnChange: {function}                         - here this === current Lure.Content
// },}


if (typeof Lure === 'undefined'){
    console.error('[Lure] Lure core is not defined');
}

Lure.Plugin.Content = {
    Version: '0.9.1',
    Content: class LureContent {
        constructor({                       //--Lure.Content Settings--
                        Target     = null,              //{string, HTMLElement} - where to render       [by default this.Parent.Content];
                        Content    = null,              //{string}  - html content string, if           [by default this.Target.innerHTML]
                        CSS        = '',                //{string}  - css classes string
                        Name       = null,              //{string}  - Lure.Content's name. Need for search content by .GetContent(contentName)
                        Global     = false,             //{bool}    - actual for SubContent. Set true, if SubContent is outside of Parent
                        Title      = "",                //{string}  -  header element, contains name/caption/title of content
                        Type       = "Untyped",         //{string}  - if has - this.Content will be invisible by default, if need be visible set next property:
                        Visible    = undefined,         //{bool}    - make visible by default (if has no Type - visible by default)
                        SubContent = [],                //{Array} of Lure.Content Settings
                        Dialog     = false,             //{bool} - make dialog absolute window with dialog wrapper
                        DialogWrapper = true,           //{bool} - show dialog  wrapper bg
                        DialogBlur = null,              //{string, jQuery, HTMLElement} target background for blur when dialog
                        DialogAnimation = null,         //{string} - css animation name
                        Show       = null,              //{function} - show action
                        Hide       = null,              //{function} - hide action
                        Shower     = function(){this.Content.style.display = '';},       //custom show handler [calls before .Show]
                        Hider      = function(){this.Content.style.display = 'none';},   //custom hide handler [calls before .Hide]
                        BeforeShow = function(){},      //{function} - calls before .Shower and .Show
                        Refresh    = function(data, i){
                            if (this.Controller)
                                this.Controller.Refresh(data, i)
                        },                              //{function} - refresh content, may be call on page resize for example
                        Sorting    = false,             //{object}   - sort controls by field like 'field' -> '{css|HTMLElement}'  ex.: { count: '.head .count'}
                        Filtering  = false,             //{object}   - like sorting, but fast filter textbox would be
                        OnClick    = null,              //{function} - this.Content.onclick event
                        Controller = null,              //{object} contoller settings(Templator or TreeBuilder)
                        Control    = null,              //{object} (help upper)


                        Props      = function(){},      //{function}  - recomented for extra fields  for Lure.Content (this.Extrafield =...)
                        Methods    = function(){},      //{function}  - recomented for extra methods for Lure.Content (this.ExtraMethod = function(){...} )
                        GetSet     = {},                //{function}  - recomenter for extra getters and setters for Lure.Content
                        AfterBuild = function(){},      //{function} - calls after Lure.Content init
                        Disabled   = false,             //debugging,
                        Parent     = null               //link to parent Lure.Content of SubContent
                    })

        {
            if (Disabled)
                return;
            let $this = this;
            this.isContent = true;
            this.isActive = true;
            if (Name  === 'Tooltipchek')
                ;//debugger;

            this.Parent = Parent;
            if (Parent !== null){
                this.Target = Global? Lure.Select(Target) : Lure.Select(Target, this.Parent.Content);
                if (this.Target === null)
                    this.Target = this.Parent.Content;
            }
            else if (Target !== null){
                this.Target = Lure.Select(Target);
            }
            // debugger;
            ////
            if (Content === null){
                this.Content = this.Target;
                construct.call($this);
            }else{
                if (Content.match(/<[^>]+>/) === null) {//if not dom string
                    console.log('get load');
                    Lure.GetFileText(Content).then(x => {
                        // debugger;
                        //     console.log('x', x);
                        MakeContent.call($this, x);
                        construct.call($this);
                    });
                }else {
                    MakeContent.call($this, Content);
                    construct.call($this);
                }


            }
            function MakeContent(Content){
                if (Controller === null || Array.isArray(Controller.Data))
                {
                    this.Content = Lure.CreateElementFromString(Content);
                }
                else if (Controller !== null && !Array.isArray(Controller.Data))
                {
                    /*Content = Content.replace(/<[^>]+>([^<]*{{([^#}]+)}}[^<]*)<[^>]+>/g, function (match, group) {
                     let newGroup = group.replace(/{{[^#}]+}}/g, function (match) {
                     return match.replace(match, `<span>${match}</span>`);
                     });
                     return  match.replace(group, newGroup);
                     });*/
                    Content = Content.replace(/>[^>]*({{[^#}]+}})[^>]*</g, function (match, group) {
                        /*let newGroup = group.replace(/{{[^#}]+}}/g, function (match) {
                         return match.replace(match, `<span>${match}</span>`);
                         });*/
                        const x = match.replace(/{{[^#}]+}}/g, function (matche) {
                            return `<span>${matche}</span>`
                        });
                        return x;// match.replace(group, `<span>${group}</span>`);
                    });
                    this.Content = Lure.CreateElementFromString(Content);
                }
                //this._Content = Content;
                this.Target.appendChild(this.Content);
            }

            /////
            if (this.Content === null || this.Target === null)
            {
                this.isContent = false;
                return;
            }




            //### CONSTRUCTION
            if (CSS !== ''){
                let node = document.createElement('style');
                node.innerHTML = CSS;
                document.body.appendChild(node);
            }
            function construct(){
                this.Type = Type;
                this.Name = Name;
                this.AllContents = Lure.ContentList;


                //### METHODS
                /**
                 * @param {object} Data
                 * @param {int} index
                 */
                this.Refresh = Refresh.bind(this);
                /**
                 *
                 * @param {selector|HTMLElement} s
                 * @returns {HTMLElement}
                 * @constructor
                 */
                this.Select = function(s){
                    return Lure.Select(s, $this.Content)
                };
                /**
                 *
                 * @param {selector|HTMLElement} s
                 * @returns {NodeList}
                 * @constructor
                 */
                this.SelectAll = function(s){
                    return Lure.SelectAll(s, $this.Content)
                };
                /**
                 *
                 * @param {string}stringName
                 * @constructor
                 * @returns {Lure.Content}
                 */
                this.GetParent = function(stringName='root'){
                    let content = $this;
                    while (content.Parent !== null && content.Name !== stringName)
                        content = content.Parent;
                    return content;
                };
                /**
                 *
                 * @param {string}stringName
                 * @constructor
                 * @returns {Lure.Content}
                 */
                this.GetContent = function (stringName='root') {
                    let parent = this.GetParent(stringName);
                    if (parent.Name === stringName)
                        return parent;
                    // let root = parent;
                    let found = parent;
                    if (stringName === 'root')
                        return found;
                    let searcher0 = function (content) {
                        if (content.isContent && content.__private.ContentNames)

                            for( let i = 0; i < content.__private.ContentNames.length; i++){
                                let name = content.__private.ContentNames[i];
                                if (name === stringName)
                                    return content[name];
                                found = searcher(content[name])
                            }
                        return found;
                    };
                    let searcher = function (content) {
                        // debugger;
                        for(let key in content){
                            if (key !== "Parent" && !!content[key] && content[key].isContent){

                                if (content[key].Name === stringName)
                                    return content[key];
                                found = searcher(content[key]);
                            }

                        }
                        return found;
                    };
                    return searcher(found);

                };
                /**
                 *
                 * @param {HTMLElement|string} HTMLElement
                 * @returns {number|Number}
                 * @constructor
                 */
                this.GetIndex = function (HTMLElement) {
                    HTMLElement = $this.Select(HTMLElement);
                    return Array.prototype.slice.call( HTMLElement.parentElement.children ).indexOf(HTMLElement);
                };
                /**
                 *
                 * @param {string} eventName
                 * @param {string} selector
                 * @param {function} func
                 * @constructor
                 */
                this.AddEventListener = function (eventName, selector, func) {
                    Lure.AddEventListenerGlobal(eventName,selector,func, $this.Content, $this);
                };
                /**
                 *
                 * @param {string|HTMLElement} buttonTutorStarter
                 * @constructor
                 */
                this.AddTutor = function (buttonTutorStarter) {
                    $this.MonsieurTutor = new MonsieurTutor($this.Select(buttonTutorStarter), $this.Content);
                };
                //private
                this._SortBy = function(f, data, isSorted = false){
                    if (data.length < 2)
                        return;
                    console.log('sort by', f);
                    data.sort(function (a, b) {
                        if      ((a[f] < b[f]) && $this._Sorting[f].Sorted)
                            return 1;
                        else if ((a[f] > b[f]) && $this._Sorting[f].Sorted)
                            return -1;
                        else if ((a[f] < b[f]) && !$this._Sorting[f].Sorted)
                            return -1;
                        else if ((a[f] > b[f]) && !$this._Sorting[f].Sorted)
                            return 1;
                        return 0;
                    });
                    $this._Sorting[f].Sorted = !$this._Sorting[f].Sorted;
                    for (let kf in $this._Sorting){
                        if ($this._Sorting.hasOwnProperty(kf) && kf !== '_sorter'){
                            $this._Sorting[kf].Target.classList.remove('mt-sorting-up');
                            $this._Sorting[kf].Target.classList.remove('mt-sorting-down');
                            if (f !==kf)
                                $this._Sorting[kf].Sorted = false;
                        }
                    }
                    $this._Sorting[f].Target.classList.add($this._Sorting[f].Sorted ? 'mt-sorting-down':'mt-sorting-up');
                    $this.Refresh();
                };
                this._FilterBy = function () {
                    let p = performance.now();
                    let filters = 0;
                    let _d = $this._Filter._DataDefault.slice(0);
                    for (let f in $this._Filter){
                        if ($this._Filter.hasOwnProperty(f) && $this._Filter[f].Filter && $this._Filter[f].Filter !==''){
                            _d = _d.filter(x=>x[f].toString().toLowerCase().indexOf($this._Filter[f].Filter) > -1);
                            filters++;
                        }
                    }
                    console.log(_d);
                    if (filters === 0)
                    {
                        if ($this._Sorting._sorter){
                            $this._Sorting[$this._Sorting._sorter].Sorted = !$this._Sorting[$this._Sorting._sorter].Sorted;
                            $this._SortBy($this._Sorting._sorter, $this.Controller._Data);
                        }
                        $this.Controller.Refresh();
                    }
                    else
                    {
                        if ($this._Sorting._sorter){
                            $this._Sorting[$this._Sorting._sorter].Sorted = !$this._Sorting[$this._Sorting._sorter].Sorted;
                            $this._SortBy($this._Sorting._sorter, _d);
                        }
                        $this.Controller.PageSize = $this._PageSize;
                        $this.Controller._PageCursor = 0;
                        $this.Controller._Rebuilder(_d);

                    }

                    mr.PerformanceNow(p, 'FilterBy')
                };

                //extra properties
                Props.call(this);
                //extra getters/setters
                for(let k in GetSet){
                    Object.defineProperty($this, k, Object.getOwnPropertyDescriptor(GetSet, k));
                }
                //extra methods
                Methods.call(this);
                //--
                this.Show = function(e) {
                    this.isActive = true;
                    if (this.Control)
                        this.Control.Active();
                    let style = window.getComputedStyle($this.Content);
                    let duration = eval(style.transitionDuration.replace('ms', '*1').replace('s', '*1000'));
                    let durationAni = eval(style.animationDuration.replace('ms', '*1').replace('s', '*1000'));
                    if (duration < durationAni)
                        duration = durationAni;
                    duration++;
                    if ($this.Type !== "Untyped" && !$this.isVisible)
                    {
                        Lure.ContentList[$this.Type].forEach((item) =>
                        {
                            if ((item) !== $this && item.isActive)
                                item.Hide();
                        });
                    }
                    if (Dialog){
                        Lure._DialogCount++;
                        $this.Content.classList.add('lure-dialog');
                        //    console.log('DialogWrapper', DialogWrapper);
                        if (DialogWrapper){
                            $this.DialogWrapper = Lure.CreateElementFromString('<div class="dialog-wrapper">');
                            document.body.appendChild($this.DialogWrapper);
                            $this.DialogWrapper.onclick = $this.Hide.bind($this);

                            let zIndexWrapper = parseInt(window.getComputedStyle($this.DialogWrapper).zIndex);
                            let zIndexContent = parseInt(window.getComputedStyle($this.Content).zIndex);
                            if (Number.isNaN(zIndexContent) || zIndexContent < zIndexWrapper)
                                $this.Content.style.zIndex = zIndexWrapper+1;
                        }

                        if (DialogBlur)
                        {
                            $this.DialogWrapper.style.background = 'none';
                            Lure.Select(DialogBlur).classList.add('lure-blur');
                        }
                        if (DialogAnimation){
                            $this.Content.classList.add(DialogAnimation);
                        }
                    }
                    BeforeShow.call($this, e);
                    Shower.call($this, e);
                    $this.Content.style.display = '';
                    clearTimeout($this.__private.ToggleTimer);
                    //this.Content.addEventListener('transitionend', Show.bind($this, e));
                    if (Show !== null) {
                        $this.__private.ToggleTimer = setTimeout(function() {
                            Show.call($this, e);
                        },duration);
                    }
                };
                this.Hide = function(e) {
                    this.isActive = false;
                    if (this.Control)
                        this.Control.Disactive();
                    let style = window.getComputedStyle($this.Content);
                    let duration = eval(style.transitionDuration.replace('ms', '*1').replace('s', '*1000'));
                    let durationAni = eval(style.animationDuration.replace('ms', '*1').replace('s', '*1000'));
                    if (duration < durationAni)
                        duration = durationAni;
                    duration++;
                    if (Dialog)
                    {
                        Lure._DialogCount--;
                        if ($this.DialogWrapper)
                            $this.DialogWrapper.remove();
                        if (DialogBlur  && Lure._DialogCount < 1)
                            Lure.Select(DialogBlur).classList.remove('lure-blur');
                    }

                    Hider.call($this, e);
                    clearTimeout($this.__private.ToggleTimer);
                    if (Hide !== null)
                        $this.__private.ToggleTimer = setTimeout(function () {
                            Hide.call($this, e);
                        }, duration);

                };
                this.Toggle = function(e){
                    if ($this.isVisible)
                        $this.Hide(e);
                    else
                        $this.Show(e);
                };

                this.__private = {};
                this.__private.ToggleTimer = null;
                this.Control = new Lure.Plugin.Content.Control(Control, $this);
                this.Content.onclick = OnClick? OnClick.bind($this) : null;
                //SubContent
                if (Array.isArray(SubContent)){
                    for (let i = 0; i < SubContent.length; i++){
                        {
                            if (!SubContent[i].Parent)
                                SubContent[i].Parent = $this;
                            //  $this.__private.ContentNames.push(SubContent[i].Name);
                            $this[SubContent[i].Name] = new Lure.Content( SubContent[i] );
                        }
                    }
                }
                else {
                    for (let cname in SubContent){
                        SubContent[cname].Parent = $this;
                        SubContent[cname].Name = cname;
                        //       $this.__private.ContentNames.push(cname);
                        $this[cname] = new Lure.Content(SubContent[cname]);
                    }
                }
                //title
                this.TitleContent = Lure.Select(Title, this.Content);

                if ( (Type === "Untyped" && Visible !== false) && !Dialog)
                    Visible = true;
                else if ( (Type !== "Untyped" && Visible !== true) || ( Dialog && Visible !== true) )
                    Visible = false;
                //if (Typed) Content is Visible
                if (Visible){
                    this.Content.style.display = '';
                    if (this.Control)
                        this.Control.Active();
                }
                else { //not undefined
                    this.isActive = false;
                    this.Content.style.display = 'none';
                }
                if (Controller){
                    if (Controller.isController){
                        this.Controller = Controller;
                        this.Controller.Parent = this;
                    }
                    else{
                        if (!Controller.Target)
                            Controller.Target = this.Content;
                        if (!Controller.Type)
                            Controller.Type = "Templator";
                        Controller.Parent = this;
                        this.Controller = new Lure.Plugin.Content.Controller[Controller.Type](Controller);
                    }
                    if (this.Controller.isHasEditable)
                    {
                        Lure._EditablesEventListenerRun($this.Content);
                    }
                }

                if (Sorting){
                    $this._Sorting = {};
                    $this._Sorting._sorter = null;
                    for (let f in Sorting){
                        if (Sorting.hasOwnProperty(f) && f !== '_sorter'){
                            $this._Sorting[f] = {
                                Target: $this.Select(Sorting[f]),
                                Sorted: false,
                            };
                            $this._Sorting[f].Target.classList.add('mt-sorting');
                            $this._Sorting[f].Target.addEventListener('click', function () {
                                $this._Sorting._sorter = f;
                                $this._SortBy(f, $this.Controller._Data);
                            })
                        }
                    }
                    console.info('mt-sortable', $this._Sorting);
                }
                if (Filtering){
                    $this._Filter = {};
                    $this._Filter._DataDefault = $this.Controller._Data.slice(0);
                    for (let f in Filtering){
                        if (Filtering.hasOwnProperty(f) && f !== '_format'){
                            $this._Filter[f] = {
                                Target: $this.Select(Filtering[f]),
                                Filter: '',
                            };
                            $this._Filter[f].Target.classList.add('mt-filtering');
                            $this._Filter[f].Target.innerHTML = '<input type="text" class="mt-filtering-input">';
                            $this._Filter[f].Target.querySelector('.mt-filtering-input').addEventListener('keyup', function (e) {
                                //$this._SortBy(f);
                                $this._Filter[f].Filter = e.target.value.toLowerCase();
                                $this._FilterBy();

                            })
                        }
                    }
                }
                if (!Lure.ContentList[$this.Type]) //if list is empty, create it, else just add
                    Lure.ContentList[$this.Type] = [];
                Lure.ContentList[$this.Type].push(this);

                //close button
                Array.from(this.Content.children).forEach(function(item){
                    if (item.classList.contains("close"))
                        item.onclick = function (e) {
                            $this.Hide(e);
                        }
                });

                setTimeout(function () {
                    AfterBuild.call($this);
                }, 1);
            }

        }
        get isVisible(){
            return Lure.isVisible(this.Content);
        }
        get Title(){
            return this.TitleContent.innerHTML;
        }
        set Title(t){
            this.TitleContent.innerHTML = t;
        }
        get Data(){
            if (this.Controller)
                return this.Controller.Data;
            return null;
        }
        set Data(data){
            if (this.Controller)
                this.Controller.Data = data;
        }
        get Items(){
            if (this.Controller)
                return this.Controller.Items;
            return null;
        }
        RefreshOne(i){
            if (this.Controller)
                this.Controller.RefreshOne(i);
        }
        Remove(i, removeData){
            if (this.Controller)
                this.Controller.Remove(i, removeData);
        }
        Add(itemData, extraclass = false, isPrepend = false, addData = true){
            if (this.Controller)
                this.Controller.Add(itemData, extraclass, isPrepend, addData);
        }

        /**
         *
         * @param {object} itemData
         * @param {int} index
         * @constructor
         */
        Edit(itemData, index){
            if (this.Controller)
                this.Controller.Edit(itemData, index);
        }
        Dispose(){
            this.Content.remove();
            this.Control.Disactive();
            delete this.Controller;
            delete this.Control;
        }
    },
    Control: class LureControl{
        constructor(control, owner){
            if (control === null)
                return;
            if (control.length > 0) //if control list not empty
            {
                let controls = this;
                for (let i = 0; i < control.length; i++)
                {
                    if (!control[i].Name)
                        control[i].Name = "unnamed_" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
                    controls[control[i].Name] = {
                        Content: Lure.SelectAll(control[i].Target),
                        _Content: control[i].Target,
                        Type: control[i].Type ? control[i].Type : "Untyped",
                        isGlobal: control[i].Global,
                        OnClick: control[i].OnClick ? control[i].OnClick : owner.Show,
                        OnChange: control[i].OnChange,
                        Active: function(){
                            Lure.SelectAll(control[i].Target).forEach(function (item) {
                                item.classList.add('active');
                            })
                        },
                        Disactive: function(){
                            Lure.SelectAll(control[i].Target).forEach(function (item) {
                                item.classList.remove('active');
                            });
                        }

                    };
                    //onclick
                    controls[control[i].Name].Content.forEach(function (item) {
                        item.classList.add('pointer');
                    });
                    if (control[i].Global){

                        Lure.AddEventListenerGlobal('click', control[i].Target, function (e) {
                            Lure.SelectAll(control[i].Target).forEach(function (item) {
                                item.classList.remove('active');
                            });
                            e.target.classList.add('active');
                            if (controls[control[i].Name].OnClick)
                                controls[control[i].Name].OnClick.call(owner, e);
                        });
                    }
                    else{
                        controls[control[i].Name].Content.forEach(function (item) {
                            item.onclick = function (e) {
                                Lure.ContentList[owner.Type].forEach((item) =>
                                {
                                    if ((item) !== owner)
                                    {
                                        if (item.Control)
                                            item.Control.Disactive();
                                    }
                                });
                                //console.log('remover', e);
                                controls[control[i].Name].Content.forEach(function (item) {
                                    item.classList.remove('active');
                                });
                                e.currentTarget.classList.add('active');
                                controls[control[i].Name].OnClick.call(owner, e);
                            };

                        })
                    }

                    if (control[i].OnChange)
                    {
                        if (control[i].Global){
                            Lure.AddEventListenerGlobal('change', control[i].Target, function (e) {
                                control[i].OnChange.call(owner, e);
                            } )
                        }
                        else{
                            controls[control[i].Name].Content.forEach(function (item) {
                                item.onchange = function (e) {
                                    control[i].OnChange.call(owner, e);
                                };
                            })
                        }
                    }
                }
            }
        }
        Active(type = "Untyped"){
            for (let k in this)
                if (this[k].Type === type)
                    this[k].Content.forEach(function (item) {
                        item.classList.add('active')
                    })
        }
        Disactive(type = "Untyped"){
            for (let k in this)
                if (this[k].Type === type)
                {
                    this[k].Content.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    if (this[k].isGlobal)
                        Lure.SelectAll(this[k]._Content).forEach(function(item){
                            item.classList.remove('active');
                        })
                }

        }
    },
    Controller: {
        Templator: class Templator{
            constructor(
                {
                    Target = null,                              //{HTMLelement}
                    Data = [],                                  // {object}, {array} - if object Templator would be refresh, if array - rebuild
                    ListElement = ".list_element",              //{string} - css selector or dom string
                    //ListElementOnClick = null,                //{function} -
                    EmptyMessage = "",
                    EmptyHide = false,      //{bool} - Templator.Content would be hidden if Data.length = 0
                    //DataType = "untyped",  //--BAD EXPERIENCE-- ODO when refresh one of typed Templator, would be refreshed/added/removed all of same type Templators (exclude untyped ofcourse)

                    PageSize = -1,
                    DataCount = -1,         //if > 0 PageGet is requied!!!
                    PageGet = null,         //{function} - requied if DataCount > 0

                    ShowAllButton = true,

                    LineSave = function(line, property, newValue, callback=()=>{}){setTimeout(()=>{callback()}, 500)},            // callback would remove editable-waiting css class;
                    LineAdd = function(dataObject, callback=()=>{}){setTimeout(()=>{ callback()}, 500)},                     // callback would remove editable-waiting css class;
                    EditModeSwitch = null,     //checkbox, which toggle to edit mode
                    DataSaveAll = function(){},//TODO

                    //Sortable = false, //sort data columns

                    NoAnimation = false,    //TODO
                    NoBuild = false,

                    BeforeBuild = function(){},
                    AfterBuild = function(){},
                    AfterAdd = function(){},
                    Parent = null           //Lure.Content, which owns this Controller

                } = {})
            {
                //### DEFINES
                let $this = this;
                this.isController = true;
                if (Parent !== null)
                    this.Content = Lure.Select(Target, Parent.Content);
                else
                    this.Content = Lure.Select(Target);
                this.Target = this.Content;
                this._Data = Data;
                this.EmptyMessage = EmptyMessage;
                this.ListElement = "";

                this.BeforeBuild = BeforeBuild.bind(this);
                this.AfterBuild = AfterBuild.bind(this);
                this.AfterAdd = AfterAdd.bind(this);
                this.Parent = Parent;
                //paginating
                this.PageSize = PageSize;
                this._PageSize = PageSize;
                this._DataCount = DataCount > 0 ? DataCount : this._Data.length ;
                this._PageCursor = 0;
                this._PageGet = PageGet;

                //server handling
                this.LineAdd = LineAdd;
                this.LineSave = LineSave;
                this.Type = null; // Refresh or ItemList

                //settings
                this.isShowAllButton = ShowAllButton;
                this.isNoAnimaton = NoAnimation;
                this.isEmptyHide = EmptyHide;

                //fields to refresh (for refresh type)
                let Dictionary = [];
                this._Dictionary = Dictionary;
                const Refresher = function () {
                    //TODO refresh only changes
                    if (!$this._Data)
                        $this._Data = {};
                    for (let i = 0; i < Dictionary.length; i++)
                    {

                        for (let j = 0; j < Dictionary[i].fields.length; j++)
                        {
                            let isAttribute = Dictionary[i].fields[j].Target.indexOf('attributes') > -1;
                            let NewValue = Dictionary[i].fields[j].BuildValue($this._Data);
                            if (isAttribute)
                            {

                                Dictionary[i].obj.attributes[Dictionary[i].fields[j].Target.split(".")[1]].value = NewValue;
                            }
                            else {
                                Dictionary[i].obj[Dictionary[i].fields[j].Target] = Dictionary[i].fields[j].BuildValue($this._Data);
                            }

                        }
                    }
                };
                this._Rebuilder = function (data = $this._Data) {
                    let lines = "";
                    //$this.Content.style.display = '';
                    if ($this._PageCursor === 0 )
                        $this.Content.querySelectorAll('.mt-line, .mt-paginator, .mt-empty').forEach(function(item) {item.remove();});
                    //pagination check
                    let NextCount;
                    //let line;
                    let Limit = data.length;
                    $this._DataCount = DataCount > 0 ? DataCount : Limit ;
                    if ($this.PageSize > 0)
                    {
                        //  debugger;
                        $this._DataCount = $this._DataCount > 0 ? $this._DataCount : data.length ;
                        let paginator = $this.Content.querySelector('.mt-paginator');
                        if (paginator !== null)
                            paginator.remove();
                        Limit = parseInt($this._PageCursor) + parseInt($this.PageSize);
                        if (Limit > $this._DataCount && $this._DataCount > 0)
                            Limit = $this._DataCount;
                        //how much will be load in next step
                        NextCount = $this._DataCount - Limit;
                        if (NextCount > $this.PageSize)
                            NextCount = $this.PageSize;
                    }
                    if ($this.Type === "ItemList" && data.length === 0 && $this.EmptyMessage !== "" && !$this.isEmptyHide)
                    {
                        let tag = $this.ListElement.match(/\s?([\w]+) /)[0].replace(/\s/g, "");
                        let empty = document.createElement(tag);
                        empty.classList.add('mt-empty');
                        empty.innerHTML = $this.EmptyMessage;
                        $this.Content.appendChild(empty);
                        return;
                    }
                    else if ($this.Type === "ItemList" && data.length === 0 && $this.isEmptyHide){
                        $this.Content.style.display = 'none';
                        return;
                    }
                    else if (data.length === 0) {
                        return;
                    }
                    //linebuilding
                    for (let i = $this._PageCursor; i < Limit; i++)
                        lines += $this._LineBuilder(data[i], i, data.length);
                    //appending
                    //   debugger;
                    if ($this.Content.children.length < 1)
                    {
                        $this.Content.innerHTML = lines;
                    }
                    else{
                        lines = Lure.CreateElementsFromString(lines, $this.Content.tagName);
                        if (lines !== null)
                            lines.forEach(function (item) {
                                $this.Content.appendChild(item);
                            });
                    }
                    /*{
                     lines += $this._LineBuilder(data[i], i, data.length);
                     //if should to save changed class list after rebuild
                     if (data[i] && data[i].$classlist)
                     {
                     line = $(line);
                     line.attr('class', data[i].$classlist);
                     lines +=line[0].outerHTML;
                     }
                     else{
                     lines += line;
                     }
                     }*/
                    //save cursor index
                    if ($this.PageSize > 0)
                        $this._PageCursor = Limit;
                    //PAGINATION BUILD
                    //limit data case
                    if ($this.PageSize > 0 && $this._PageCursor < $this._DataCount){
                        let also;
                        let showAll = `<span>  (Не загружено ${($this._DataCount- $this._PageCursor)}) </span>`;
                        if ($this.isShowAllButton)
                        {
                            showAll = `<span> или </span><span class="mt-btn-nextAll dotted pointer"> Все ( ${($this._DataCount - $this._PageCursor)} )</span>`;
                        }
                        let isTable = $this.Content.tagName === 'table' || $this.Content.tagName === 'thead' || $this.Content.tagName === 'tbody';
                        if (isTable)
                        {
                            let colspan = $this.Content.querySelector("tr:first-child th").length + 1;

                            also = `<tr class="mt-paginator"><td colspan="${colspan}" class="element block-head"><span class="tpltr-next dotted pointer">Показать еще ${NextCount}</span>${showAll}</td></tr>`;
                            also = Lure.CreateElementFromString(also, $this.Content.tagName);
                        }
                        else {
                            also = Lure.CreateElementFromString(`<div class='mt-paginator'><span class="mt-btn-next dotted pointer">Показать еще ${NextCount}</span>${showAll}</div>`);

                        }
                        let btnNext = also.querySelector('.mt-btn-next');
                        //console.log('btnNext', btnNext);
                        btnNext.onclick = function(){
                            if ($this._PageCursor >= data.length)
                                $this._PageGet($this._PageCursor, $this.PageSize, BuildWithIt);
                            else
                                Build();

                        };
                        let btnNextAll = also.querySelector('.mt-btn-nextAll');
                        btnNextAll.onclick = function(){
                            $this.PageSize = $this._DataCount;
                            if ($this._PageGet !== null)
                                $this._PageGet($this._PageCursor, ($this._DataCount - $this._PageCursor), BuildWithIt);
                            else
                                Build();
                        };
                        $this.Content.appendChild(also);

                    }

                };
                const Build = function () {
                    $this.BeforeBuild();

                    if ($this.Type === "Refresh")
                        Refresher();
                    else if ($this.Type === "ItemList"/* && $this._Data.length > 0*/)
                        $this._Rebuilder();


                    $this.AfterBuild();
                };
                const BuildWithIt = function (data) {
                    for (let i = 0; i < data.length; i++)
                        $this._Data.push(data[i]);
                    Build();
                };
                // = Rebuild1er;

                //#### METHODS
                this.FieldAdd = function (element) {
                    let elemAttributes = element.attributes;
                    let fields = [];
                    let WhatFields = -1; // 0-att only, 1-innerHTML only, 2-both
                    //find fields in attributes
                    for (let i = 0; i < elemAttributes.length; i++)
                    {
                        if (elemAttributes[i].value.indexOf("{{") > -1)
                        {
                            if (elemAttributes[i].name !== 'value')
                                fields.push({
                                    Target: 'attributes.'+elemAttributes[i].name,
                                    BuildValue: Lure.Compile(elemAttributes[i].value)
                                });
                            else {
                                fields.push({
                                    Target: elemAttributes[i].name,
                                    BuildValue: Lure.Compile(elemAttributes[i].value)
                                });
                            }
                            WhatFields = 0;
                        }
                    }
                    //innerHTML check
                    if (element.childNodes.length < 2)
                    {
                        if (element.innerHTML.indexOf("{{") > -1)
                        {
                            fields.push({
                                Target: "innerHTML",
                                BuildValue: Lure.Compile(element.innerHTML)
                            });
                            WhatFields = WhatFields !==0 ? 1:2; //1 if no att, 2 if att exists

                        }

                    }
                    if (WhatFields > -1)
                    {
                        Dictionary.push( {
                            obj: element,
                            fields: fields
                        } );
                    }
                };
                this.Refresh = function(data = null, index = null){
                    $this.PageSize = $this._PageSize;
                    $this._PageCursor = 0;
                    if (data !== null)
                        $this._Data = data;
                    $this.PageCursor = 0;
                    if (index === null)
                        Build();
                    else
                        $this.RefreshOne(index);
                };
                this.RefreshOne = function (i) {
                    let newItem = Lure.CreateElementFromString($this._LineBuilder($this._Data[i], i, $this._Data.length), $this.Content.tagName);
                    let itemOld = $this.Items[i];
                    $this.Items[i].parentNode.replaceChild(newItem, itemOld);
                };
                this.Add = function(item, extraclass = false, isPrepend = false, addData = true){
                    if ($this._Data.length === 0 && $this.Content.querySelector(".mt-empty") !== null)
                        $this.Content.querySelector(".mt-empty").remove();
                    let fragment = document.createDocumentFragment();
                    let elem = document.createElement($this.Content.tagName);
                    let i;
                    if (!isPrepend)
                    {
                        i = $this._Data.length;
                        if (!addData)
                            i--;
                        elem.innerHTML = $this._LineBuilder(item, i, i+1);
                        while (elem.childNodes[0]) {
                            fragment.appendChild(elem.childNodes[0]);
                        }
                        if (extraclass)
                            fragment.children[0].classList.add(extraclass);
                        if (addData)
                            $this._Data.push(item);
                        $this.Content.appendChild(fragment);
                    }
                    else{
                        i = 0;
                        //change data-line attributes
                        $this.Items.forEach(function (item) {
                            console.log(item);
                            console.log(item.dataset['line']);
                            item.dataset['line'] =  parseInt( item.dataset['line'] ) + 1;
                        });
                        //TODO rendered indexes not changings

                        elem.innerHTML =  $this._LineBuilder(item, 0, $this._Data.length+1);
                        while (elem.childNodes[0]) {
                            fragment.appendChild(elem.childNodes[0]);
                        }
                        if (extraclass)
                            fragment.children[0].classList.add(extraclass);
                        if (addData)
                            $this._Data.unshift(item);
                        $this.Content.prepend(fragment);
                    }
                    //server saver
                    if ($this.LineAdd !== null)
                    {
                        $this.LineAdd(item, function () { //remove extraclass callback
                            let x = $this.Content.querySelector('.'+extraclass);
                            if (x)
                                x.classList.remove(extraclass);
                        });
                    }
                    $this.AfterAdd(item, i);
                };
                this.Edit = function (itemData, i){
                    console.log('edit itemData', i, itemData);
                    Array.from($this.Items).filter(x => parseInt(x.dataset['line'])===i)[0].classList.add('editable-waiting');
                    $this.LineSave(i, '$this', itemData,
                        function () {
                            $this._Data[i] = itemData;
                            $this.RefreshOne(i);
                        });

                };
                /**
                 *
                 * @param {int} index
                 * @param {bool} removeData
                 * @constructor
                 */
                this.Remove = function(index, removeData = true){
                    //TODO rendered indexes not changings
                    $this.Content.querySelector(`.mt-line[data-line="${index}"]`).remove();
                    for (let j = index; j < $this.Items.length; j++){
                        $this.Items[j].dataset['line'] =  parseInt( $this.Items[j].dataset['line'] ) - 1;
                        $this.Items[j].querySelectorAll('[data-line]').forEach(function (item) {
                            item.dataset['line'] = parseInt( item.dataset['line'] ) - 1;
                        })
                    }
                    if (removeData)
                        $this._Data.splice(index, 1);
                    if ($this._Data.length === 0)
                        $this.Refresh();
                };
                this.SwitchToEditMode = function () {
                    Lure.Editable.EditMode = true;
                    Lure.SelectAll('.editable', $this.Content).forEach(function (item) {
                        // console.log(item);
                        Lure.Editable.AddEdits(item);
                    });
                };

                //### CONSTRUCTOR
                if ( Array.isArray(this._Data) ){
                    this.Type = "ItemList";
                    const isListElementCssSelector = ListElement.match(/^[a-zA-Z0-9.,\-_ *#]+$/g) !== null;
                    if (isListElementCssSelector){
                        let element = this.Content.querySelector(ListElement);
                        element.classList.add('mt-line');
                        ListElement = element.outerHTML;
                        element.remove();
                    }
                    else{
                        let list_element = ListElement.match(/<[^>]+>/)[0];
                        let list_elementClassed;
                        let pos = list_element.indexOf('class="');
                        if (pos < 0)
                        {
                            list_elementClassed = list_element.substr(0,list_element.length - 1) + ' class="mt-line"' + list_element.substr(list_element.length-1);
                        }
                        else
                        {
                            pos = list_element.indexOf('"', pos+8);
                            list_elementClassed = list_element.substr(0,pos) + " mt-line" + list_element.substr(pos);
                        }
                        ListElement = ListElement.replace(list_element, list_elementClassed);
                    }
                    //add data-line attribute
                    ListElement = ListElement.replace(/<[\s\S]+?(>)/, function (a, b) {
                        return a.replace(b, ' data-line="{{i}}">')
                    });
                    this.ListElement = ListElement;
                    this._LineBuilder = Lure.Compile(ListElement, true);
                    if (ListElement.match(/<[^>]+class=['"][\w\d\s-]*(editable)[\w\d\s-]*['"][^>]*>([^<]*)<[^>]*>/) !== null)
                    {
                        this.isHasEditable = true;
                        if (EditModeSwitch !== null)
                            Lure.Select(EditModeSwitch).addEventListener('change', function (e) {
                                if ( e.currentTarget.checked ){
                                    $this.SwitchToEditMode();
                                }
                                else{
                                    Lure.Editable.EditMode = false;
                                    document.body.click();
                                }
                            });
                    }
                    this.Content.MonsieurController = this;
                    this.Content.classList.add('mt-content');

                }
                else {
                    this.Type = "Refresh";
                    let AllChildren = Array.prototype.slice.call( this.Content.querySelectorAll('*:not(g):not(path):not(clipPath):not(text):not(br)'));
                    AllChildren.push( this.Content);
                    AllChildren.forEach(function (item) {
                        $this.FieldAdd(item);
                    })
                }
                Lure.TemplatorList.push(this);
                if (!NoBuild)
                    Build();
            }
            get Data(){
                return this._Data;
            }
            set Data(data){
                this._Data = data;
            }
            get Items(){
                return this.Content.querySelectorAll('.mt-line');
            }
        },
        TreeBuilder: class TreeBuilder{
            constructor(
                {
                    Target = null,                          //{string, HTMLElement}
                    Data = [],
                    ListElement = null,
                    Drop = false,                       //{bool}   - horisontal menu with drop down subtrees;
                    SubSelector = null,                 //{string} - cssselector of element, where put branches
                    SubSelectorHandler = function(){},  //{function} - click handle on SubSelector Element (hide/show branch for exaple)

                    BeforeBuild = function(){},
                    AfterBuild = function(){},

                    Parent = null               //Lure.Content, which owns this Controller
                }
            )
            {
                //### DEFINES
                this.isController = true;
                this.Content = Lure.Select(Target);
                this.Target = this.Content;
                this.Parent = Parent;
                this._Data = Data;
                this.SubSelector = SubSelector;
                this.SubSelectorHandler = SubSelectorHandler.bind(this);
                this.BeforeBuild = BeforeBuild.bind(this);
                this.AfterBuild = AfterBuild.bind(this);
                let SubTreeClass = Drop ? 'mtb-sub_tree dropable':'mtb-sub_tree';
                let Lvl = 0;
                let Branch = ListElement === null ? this.Content.innerHTML : ListElement;
                if (this.SubSelector === null){
                    this.SubSelector = '.mtb-sub_tree';
                    Branch = Branch.replace(/^([\s\S]*)(<\/\w+>)$/, function (match, html, entag) {
                        entag = `<div class="${SubTreeClass}"></div>${entag}`;
                        return html+entag
                    })
                }
                this.LineBuilder = Lure.Compile(Branch, true);
                let $this = this;

                let Index = 0;          //unque serial number of branch

                let BuildElement = function(obj, key, indexJ) {
                    Index++;
                    let extra = {
                        $lvl: Lvl,
                        $key: key,
                        $index: Index,
                        $j: indexJ
                    };
                    let line = Lure.CreateElementFromString($this.LineBuilder(obj, Index, null, extra));
                    line.classList.add('mtb-branch');
                    for (let key in obj)
                    {
                        let ObjItem = obj[key];
                        if (Array.isArray(ObjItem))
                        {
                            Lvl++;
                            for (let i = 0; i < ObjItem.length; i++)
                            {
                                if ($this.SubSelector === null)
                                {
                                    line.appendChild(  BuildElement(ObjItem[i], key, i) );
                                }
                                else
                                {
                                    line.classList.add('mtb-has_tree');
                                    if (Drop)
                                        line.classList.add('dropable');
                                    let sub = line.querySelector($this.SubSelector);
                                    sub.appendChild(  BuildElement(ObjItem[i], key, i) );
                                }
                            }
                            Lvl--;
                        }
                    }
                    return line;
                };
                let Build = function () {
                    $this.BeforeBuild();
                    if (Array.isArray($this._Data))
                    {
                        $this.Content.innerHTML = '';
                        Lvl++;
                        for (let j = 0; j < $this._Data.length; j++)
                            $this.Content.appendChild(  BuildElement($this._Data[j], "root", 0) );
                        Lvl--;
                    }
                    else{
                        $this.Content.appendChild(BuildElement($this._Data, "root", 0));
                    }
                    Lvl = 0;
                    Index = 0;
                    $this.AfterBuild();

                };

                Build(this._Data);

                //### METHODS
                this.Refresh = function (data=$this._Data) {
                    $this._Data = data;
                    Build();
                }

            }
            get Data(){
                return this._Data;
            }
            set Data(data){
                this._Data = data;
            }
        }
    }
};
//register plugin
Lure.Content = Lure.Plugin.Content.Content;






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

