Lure.Plugin.Chart = {
    Core: '',
    Chart: class LureChart{
        constructor(
            Target = null,      //where render chart
            {
                Type = 'Line',  //Line Bar Pie
                Title = '',
                Labels = {
                    Rotation: 'auto',
                    Data: []
                },
                Grid = {},
                Series = [],
                Tooltip = {
                    Template: null,
                },
                AxisY = {
                    Scale: ['auto', 'auto', 'auto'],
                    Visible: true,
                },
                Height = 400,
                SeriesOptions = {},
            }={},
        ){
           // let pp = new Lure.Diagnostics.Perf(false);
            /// <DEFAULTS>
            //const Colors = ['red', 'green', 'blue'];
            const ColorsDefault = ['red', 'green', 'cornflowerblue', 'purple', 'palevioletred', 'orange', 'tomato', 'darkblue'];
            const TemplateDefault = {
                Line: 'Name: {{Name}}<br>Value: {{Value}}',
                Pie: 'Name: {{Name}}<br>Value: {{Value}}'
            };
            /// </DEFAULTS>
            ///
            Lure.Chart.Count++;
            let chart = this;
            this.Content = Lure.Select(Target);
            this.Content.classList.add('mt-chart'); // mt
            this.Content.style.position = 'relative';

            this.isGraph = true;


            let Prepared = [];
            let Buffer = {
                Legend: '',

                AxisX: '',
                AxisY: '',
                Grid: '',
                Svg: '',

                Height: 0,
                Width: 0,
                Abscissa: null,
                SeriesPoints: [],

                SeriesCount:{
                    Line: 0,
                    Bar: 0,
                    Pie: 0,
                    Ring: 0,
                },
                SeriesBar: 0,

                ParametersAxisX: null,
            };
            this._Series = Series;

            this.Options = {
                Type: Type? Type.toLowerCase(): 'line',
                Title: Title? Title: '',
                Legend: {
                    Visible: true,
                },
                Labels: {
                    Visible: (typeof Labels.Visible === 'undefined' || Labels.Visible),
                    Rotation: Labels.Rotation? Labels.Rotation: 'auto',
                    Data: Labels.Data? Labels.Data: [],
                    Font: {
                        Family: 'sans-serif',
                        Size: '0.8rem',
                    }
                },
                Grid: {
                    Visible: (typeof Grid.Visible === 'undefined' || Grid.Visible),
                },
                Series: null,
                SeriesOptions: {
                    BarStack: false,
                    BarGradient: true,

                    PieStack: false,
                    PieType: 'pie'
                },
                AxisY: {
                    Font: {
                        Family: 'sans-serif',
                        Size: '0.8rem',
                    },
                    Scale: AxisY.Scale? ([Lure.isNumeric(AxisY.Scale[0])? AxisY.Scale[0]:'auto', Lure.isNumeric(AxisY.Scale[1])? AxisY.Scale[1]:'auto', Lure.isNumeric(AxisY.Scale[2])? AxisY.Scale[2]:'auto']):['auto', 'auto', 'auto'],
                    Visible: (typeof AxisY.Visible === 'undefined' || AxisY.Visible),

                },
                Padding: 0,
                Tooltip: {
                    Template: null, //Tooltip.Template?Tooltip.Template : TemplateDefault.Line
                }
            };
            this.Block = (function () {
                this.Content.innerHTML = `<div class="mt-chart col">
                                        <div class="mt-chart-caption">
                                          <div class='mt-chart-title'>${Title}</div>
                                          <div class="mt-chart-legend row"></div>
                                        </div>
                                        <div class="mt-chart-kek row flex-100">
                                          <div class="mt-chart-y row"></div>
                                          <div class="col flex-100">
                                            <div class="mt-chart-area row flex-100">
                                              <svg class="mt-chart-svg"></svg>
                                              <div class="mt-chart-grid" style=" position: absolute;"></div>
                                            </div>
                                            <div class="mt-chart-x row"></div>
                                           </div>
                                        </div>
                                      </div>`;
                const _Legend     = this.Content.querySelector('.mt-chart-legend');
                const _AxisX      = this.Content.querySelector('.mt-chart-x');
                const _AxisY      = this.Content.querySelector('.mt-chart-y');
                const _ChartArea  = this.Content.querySelector('.mt-chart-area');
                const _Grid       = this.Content.querySelector('.mt-chart-grid');
                const _Svg        = this.Content.querySelector('.mt-chart-svg');
                return {
                    get Legend(){
                        return _Legend;
                    },
                    set Legend(v){
                        _Legend.innerHTML = v;
                    },
                    get AxisX(){
                        return _AxisX;
                    },
                    set AxisX(v){
                        _AxisX.innerHTML = v;
                    },
                    get AxisY(){
                        return _AxisY;
                    },
                    set AxisY(v){
                        _AxisY.innerHTML = v;
                    },
                    get ChartArea(){
                        return _ChartArea;
                    },
                    set ChartArea(v){
                        _ChartArea.innerHTML = v;
                    },
                    get Grid(){
                        return _Grid;
                    },
                    set Grid(v){
                        _Grid.innerHTML = v;
                    },
                    get Svg(){
                        return _Svg;
                    },
                    set Svg(v){
                        _Svg.innerHTML = v;
                    },
                }
            }.bind(this))();
            /*********/
            const Builder = {
                Legend(){

                },
                AxisX: function(){
                    if (!chart.Options.Labels.Visible)
                    {
                        this.Block.AxisX = '';
                        return;
                    }
                    let labels = chart.Options.Labels.Data;
                    //const style = `transform: rotate(${Buffer.AxisXParams.Angle}deg); margin-top: ${Buffer.AxisXParams.MarginTop}px; width: ${Buffer.AxisXParams.Width}px; margin-left: ${Buffer.AxisXParams.MarginLeft}px;`;
                    const style = `transform: translate(${Buffer.AxisXParams.MarginLeft}px) rotate(${Buffer.AxisXParams.Angle}deg); margin-top: ${Buffer.AxisXParams.MarginTop}px ; width: ${Buffer.AxisXParams.Width}px;`;
                    let a = '';
                    for (let i = 0 ; i < labels.length; i++){
                        a += `<div class="mt-chart-label mt-chart-label__x" style="font-family: ${chart.Options.Labels.Font.Family}; font-size: ${chart.Options.Labels.Font.Size}"><span style="${style}">${labels[i]}</span></div>`
                    }
                    //console.log(`AxisX forecastHeight: ${Math.round(h/4+ (Math.sqrt(Math.pow(wFact, 2) - Math.pow(w, 2))))}`);
                    Buffer.AxisX = a;
                    this.Block.AxisX = a;
                    this.Block.AxisX.style.borderTop = '1px #111 solid';
                }.bind(this),
                AxisY: function () {
                    !this.Options.Labels.Visible
                    return '';

                }.bind(this),


                Make3Legend(Serie, i){
                    return `<div class="mt-chart-legend__item row">
                          <input class="mt-legend-checkbox" type="checkbox" checked="checked" id="legcheck${Serie.Name}${i}">
                          <div class="mt-legend-icon" style="background-color: ${Serie.Color}"></div>
                          <label class="mt-legend-label" for="legcheck${Serie.Name}${i}">${Serie.Name}</label>
                        </div>`;
                },
                MakeAxisY(){
                    /*if (!scale)
                     return '';
                     let caption = '';
                     if (i>0)
                     caption = `<div class="mt-chart-axis-caption"><div style="transform: rotate(-90deg)">${name}</div></div>`;
                     let a = '';
                     for (let j = 0; j< scale.length; j++){
                     a += `<div class="mt-chart-label mt-chart-label__y"><span>${scale[j]}</span></div>`;
                     }
                     return `<div class="mt-chart-axis__y row" ${(i>0)? ('style="color: '+color+'; font-weight: bold;"'):''} data-line="${i}">${caption}<div class="mt-chart-labels col">${a}</div></div>`;*/
                    let i = 0;
                    if (!chart.Options.AxisY.Visible){
                        i = 1;
                        if (chart._ScaleY.Scales.length < 2)
                            return '';
                    }
                    let AxisYStyle = `font-family: ${chart.Options.Labels.Font.Family}; font-size: ${chart.Options.Labels.Font.Size};`;
                    let accum = '';
                    for (i; i <chart._ScaleY.Scales.length; i++){
                        let index = chart._ScaleY.Dict.indexOf(i);//.filter(x=>x===i && x !==0)[0];
                        let scale = chart._ScaleY.Scales[i];
                        let caption = '';
                        //let a = '';
                        if (i>0)
                            caption = `<div class="mt-chart-axis-caption"><div style="transform: rotate(-90deg)">${chart.Options.Series[index].Title}</div></div>`;
                        let a = '';
                        for (let j = 0; j< scale.length; j++){
                            a += `<div class="mt-chart-label mt-chart-label__y"><span>${scale[j]}</span></div>`;
                        }
                        if (i>0)
                            AxisYStyle += ` color: ${chart.Options.Series[index].Color}; font-weight: bold;`;
                        accum += `<div class="mt-chart-axis__y row" style="${AxisYStyle}" data-line="${i}">${caption}<div class="mt-chart-labels col">${a}</div></div>`;

                    }
                    return accum;
                },
                MakeAxisX(){
                    if (!chart.Options.Labels.Visible)
                        return '';
                    let labels = chart.Options.Labels.Data;

                    //const style = `transform: rotate(${Buffer.AxisXParams.Angle}deg); margin-top: ${Buffer.AxisXParams.MarginTop}px; width: ${Buffer.AxisXParams.Width}px; margin-left: ${Buffer.AxisXParams.MarginLeft}px;`;
                    const style = `transform: translate(${Buffer.AxisXParams.MarginLeft}px) rotate(${Buffer.AxisXParams.Angle}deg); margin-top: ${Buffer.AxisXParams.MarginTop}px ; width: ${Buffer.AxisXParams.Width}px;`;
                    let a = '';
                    for (let i = 0 ; i < labels.length; i++){
                        a += `<div class="mt-chart-label mt-chart-label__x" style="font-family: ${chart.Options.Labels.Font.Family}; font-size: ${chart.Options.Labels.Font.Size}"><span style="${style}">${labels[i]}</span></div>`
                    }
                    //console.log(`AxisX forecastHeight: ${Math.round(h/4+ (Math.sqrt(Math.pow(wFact, 2) - Math.pow(w, 2))))}`);
                    return a;
                },
                MakeGrid(a,b){
                    if (!chart.Options.Grid.Visible)
                        return '';
                    return Lure.Chart.GetGrid(chart.Options.Labels.Data.length, chart._ScaleY.Scales[0].length-1, chart.Options.Padding);
                },
                MakeGraph(serie, i){
                    let index = chart._ScaleY.Dict[i];
                    let scale = chart._ScaleY.Scales[index];
                    let mm = chart._ScaleY.MinMax[index];
                    let DataOrdinata = Lure.Chart.GetOrdinata(serie.Data, scale, mm, chart.Height);
                    let DataAbscissa = Lure.Chart.GetAbscissa(chart.Options.Labels.Data, chart.Width);
                    let points = Lure.Chart.GetPoints(DataAbscissa, DataOrdinata);
                    return Lure.Chart.GetPath(points, chart.Options.Series[i].Type, i, chart.Options.Series[i].Color, chart.Options.Series[i].Width);
                },
                CalcAxi6sX(){
                    let c = Lure.CreateElementFromString(`<div class="mt-chart-label mt-chart-label__x"><span>${chart.Options.Labels.Data[0]}</span></div>`);
                    //let pp = performance.now();
                    let size = Lure.GetInlineSize(c, getComputedStyle(Lure.Select('span')).fontSize);

                    let w = chart.Width/chart.Options.Labels.Data.length;
                    chart.Options.Padding = w/2;
                    chart.Block.AxisX.style.paddingLeft = w/2+'px';
                    let h = size.height;
                    let wFact = size.width;
                    let angle;

                    if (chart.Options.Labels.Rotation !== 'auto'){
                        angle = parseFloat(chart.Options.Labels.Rotation);
                    }
                    else{
                        let cos = (w-h)/(wFact+h);
                        if (cos < 0.1)
                            cos = 0;
                        if (cos > 1)
                            cos = 1;
                        angle = (-90*(1-cos));
                    }
                    //Lure.Perf(pp, '--calcx--');
                    return {
                        Height: Math.round(h/4+ (Math.sqrt(Math.pow(wFact, 2) - Math.pow(w, 2)))),
                        Width: wFact,
                        MarginTop:  (wFact>w)? ((Math.sqrt(Math.pow(wFact, 2) - Math.pow(w, 2))) - h) : 0,
                        MarginLeft: (wFact>w)? (-w/2):(-wFact/2),
                        Angle: angle,
                    }

                }
            };

            const Init = {
                Tooltip: function () {
                    if (Tooltip.Template)
                    {
                        this.Options.Tooltip.Template = Tooltip.Template;
                        return;
                    }
                    if (this.Options.Type === 'line' || this.Options.Type === 'bar'){
                        this.Options.Tooltip.Template = TemplateDefault.Line;
                        return;
                    }
                    if (this.Options.Type === 'pie' || this.Options.Type === 'ring'){
                        this.Options.Tooltip.Template = TemplateDefault.Pie;
                        return;
                    }

                    //Tooltip.Template?Tooltip.Template : TemplateDefault.Line
                }.bind(this),
                Series: function(){
                    let Se = [];
                    if (this.Options.Series !== null){

                        return;
                    }
                    for (let i = 0; i < this._Series.length; i++){
                        let ep = {};
                        ep.Name    = this._Series[i].Name ? this._Series[i].Name                : 'Unnamed';
                        ep.Title   = this._Series[i].Title? this._Series[i].Title               : ep.Name;
                        ep.Color   = this._Series[i].Color? this._Series[i].Color: ColorsDefault[i]?ColorsDefault[i]:'#000';
                        ep.Width   = this._Series[i].Width? this._Series[i].Width               : 2;

                        ep.Data    = this._Series[i].Data;

                        ep.Type    = this._Series[i].Type ? this._Series[i].Type.toLowerCase()  : (Type?Type.toLowerCase():'line');
                        //debugger;
                        if (ep.Type === 'pie' || ep.Type === 'ring'){
                            ep.Colors = this._Series[i].Colors? this._Series[i].Colors: ColorsDefault;
                            ep.Width   = this._Series[i].Width? this._Series[i].Width               : 30;
                            ep.Labels  = this._Series[i].Labels? this._Series[i].Labels: (this.Options.Labels.Data?this.Options.Labels.Data: false);

                        }


                        ep.Line    = i;
                        ep.isVisible = (typeof this._Series[i].Visible === 'undefined' || this._Series[i].Visible); //true by default
                        ep.OwnAxis = this._Series[i].OwnAxis;
                        //ep.OwnAxis = Lure.Chart.CheckOwnAxis(ep);


                        ep.Point   = this._Series[i].Point;
                        ep.Point   = Lure.Chart.GetSeriePointOptions(ep);

                        Buffer.Legend += Lure.Chart.MakeLegend(ep, i);
                        Buffer.SeriesCount[ep.Type.capitalize()]++;
                        Se.push(ep);
                    }
                    this.Options.Series = Se;
                }.bind(this),
                AxisY: function () {
                    if (this.Width === LastRender.Width)
                        return;
                    let count = this.Options.AxisY.Visible? 1:0;
                    let len = 0;
                    let width = 0;
                    for (let i = 0; i < this.Options.Series.length; i++){
                        //check special Scales
                        if (this.Options.Series[i].isVisible && this.Options.Series[i].OwnAxis){
                            let len = 0;
                            for (let j = 0; j < this.Options.Series[i].Data.length; j++){
                                let w = Lure.GetTextWidth(this.Options.Series[i].Data[j], this.Options.AxisY.Font.Family, this.Options.AxisY.Font.Size);
                                if (w > len)
                                    len = this.Options.Series[i].Data[j];
                            }
                            let lenmax = Lure.GetTextWidth(this.Options.Series[i].OwnAxis[1], this.Options.AxisY.Font.Family, this.Options.AxisY.Font.Size);
                            if (lenmax > len)
                                len = lenmax;
                            //debugger;
                            //width += Lure.GetTextWidth('i'.repeat(len), this.Options.AxisY.Font.Family, this.Options.AxisY.Font.Size);
                            width += len + 8;  //8px = (7px) :before.width  + (1px) border
                            let wCapti = Lure.GetTextWidth(this.Options.Series[i].Title, this.Options.AxisY.Font.Family, this.Options.AxisY.Font.Size);
                            width += wCapti > 30 ? 30: wCapti;
                        }
                        //check default scale
                        else if (this.Options.Series[i].isVisible && !Array.isArray(this.Options.Series[i].OwnAxis)){
                            for (let j = 0; j < this.Options.Series[i].Data.length; j++){
                                let w = Lure.GetTextWidth(this.Options.Series[i].Data[j], this.Options.AxisY.Font.Family, this.Options.AxisY.Font.Size);
                                if (w > len)
                                    len = this.Options.Series[i].Data[j];
                            }
                        }
                    }
                    width += len + 10 +7;
                    Buffer.AxisYWidth = width;
                   // console.log('->Init.AxisY:',width);
                }.bind(this),
                AxisX: function () {
                    if (this.Width === LastRender.Width)
                        return;
                    if (!this.Options.Labels.Visible){
                        Buffer.AxisXParams = {
                            Height: 0,
                            Width: 0,
                            MarginTop:  0,
                            MarginLeft: 0,
                            Angle: 0,
                        };
                        return;
                    }

                    let maxWidth = 0;
                    for (let i = 0; i < this.Options.Labels.Data.length; i++){
                        let w = Lure.GetTextWidth(this.Options.Labels.Data[i], this.Options.AxisY.Font.Family, this.Options.AxisY.Font.Size);
                        if (w > maxWidth)
                            maxWidth = w;
                    }
                    let w = (this.Content.clientWidth - Buffer.AxisYWidth) / this.Options.Labels.Data.length;
                    w = (this.Content.clientWidth - Buffer.AxisYWidth - w/2) / this.Options.Labels.Data.length;
                    //debugger;
                    this.Options.Padding = w/2;
                    this.Block.AxisX.style.paddingLeft = w/2+'px';
                    let h = 0; //TODO hardcode fix
                    let wFact = maxWidth;
                    let angle;

                    if (this.Options.Labels.Rotation !== 'auto'){
                        angle = parseFloat(this.Options.Labels.Rotation);
                    }
                    else{
                        let cos = (w)/(wFact);
                        if (cos < 0.15)
                            cos = 0;
                        if (cos > 1)
                            cos = 1;
                        //angle = (-90*(1-cos));
                        //console.log('w',this.Width, w, wFact,cos);
                        angle = -(Math.acos(cos)*180/Math.PI).toFixed(2);
                       /* if (angle >0 )
                            angle = -angle;*/
                        //console.log('angleold', (-90*(1-cos)));
                        //console.log('anglenew', h, parseFloat(getComputedStyle(this.Block.AxisX).lineHeight));
                    }
                    //Lure.Perf(pp, '--calcx--');
                    Buffer.AxisXParams = {
                        Height: Math.round((Math.sqrt(Math.pow(wFact, 2) - Math.pow(w, 2)))) + parseFloat(getComputedStyle(this.Block.AxisX).lineHeight),
                        Width: wFact,
                        MarginTop:  (wFact>w)? ((Math.sqrt(Math.pow(wFact, 2) - Math.pow(w, 2))) - h) : 0,
                        MarginLeft: (wFact>w)? (-w/2):(-(wFact)/2),
                        Angle: angle,
                    }



                }.bind(this),
                ScaleY: function () {
                    this._ScaleY = Lure.Chart.GetScaleY(this.Options.Series, (this.Height-Buffer.AxisXParams.Height), this);
                    return;
                    if (ctx.Type === 'pie'){
                        return [];
                    }
                    let min = series[0].Data[0];
                    let max = series[0].Data[0];
                    let isAutoScale = true;
                    let isAutoStep = true;
                    if (ctx.Options.AxisY.Scale[0] !== 'auto' && ctx.Options.AxisY.Scale[1] !== 'auto')
                    {
                        isAutoScale = false;
                        min = ctx.Options.AxisY.Scale[0];
                        max = ctx.Options.AxisY.Scale[1];
                    }
                    if (ctx.Options.AxisY.Scale[2] !== 'auto')
                        isAutoStep = false;
                    let mm = [ [series[0].Data[0],series[0].Data[0]] ];
                    let index = 0;
                    let scales = [];

                    let sc = {
                        Scales: [],
                        Dict: [],
                        MinMax: null
                    };
                    for (let i = 0; i < series.length; i++){
                        sc.Dict[i] = 0;
                        if (series[i].OwnAxis){
                            index++;
                            if (typeof series[i].OwnAxis[0] !== 'undefined')
                                mm.push(series[i].OwnAxis);
                            else
                                mm.push([series[i].Data[0],series[i].Data[0]]);
                            sc.Dict[i] = index;
                        }
                        for (let j = 0; j < series[i].Data.length; j++){
                            if (isAutoScale){
                                if (series[i].Data[j] < min)
                                    min = series[i].Data[j];
                                if (series[i].Data[j] > max)
                                    max = series[i].Data[j];
                            }
                            if (series[i].OwnAxis && typeof series[i].OwnAxis[0] === 'undefined'){
                                if (series[i].Data[j] < mm[index][0])
                                    mm[index][0] = series[i].Data[j];
                                if (series[i].Data[j] > mm[index][1])
                                    mm[index][1] = series[i].Data[j];
                            }
                        }
                    }
                    mm[0] = [min, max];
                    sc.MinMax = mm;
                    for (let i = 0; i < mm.length; i++){
                        let order = mm[i][1].toString().length;
                        let step;
                        if (i===0 && !isAutoStep){
                            step = ctx.Options.AxisY.Scale[2];
                        }
                        else{
                            step = mm[i][2]? mm[i][2] : ( (mm[i][1]-mm[i][0] )*40 /height / (Math.pow(10, order-1))/5 ).toFixed(1) * Math.pow(10, order-1)*5;
                        }
                        let s = mm[i][0];
                        let scale = [];
                        if (order < 3 || true){
                            //debugger;
                            while (s <= mm[i][1] + ctx.Options.Series[i].Width/2){
                                scale.push(s);
                                s += step;
                            }
                            scale.push(s);
                            sc.Scales.push(scale);
                        }
                    }
                    return sc;
                }.bind(this)
            };
            /**
             *
             * @returns {string}
             * @constructor
             */


            let LastRender = {
                Width: 0,
                Height: 0,
                DataLength: 0,

            };


            this.__GetPathLine = function (serie, line) {
                if (!Buffer.Abscissa || Buffer.Width !== this.Width)
                    Buffer.Abscissa = Lure.Chart.GetAbscissa(chart.Options.Labels.Data, this.Width);
                let index = this._ScaleY.Dict[line];
                let scale = this._ScaleY.Scales[index];
                let mm = chart._ScaleY.MinMax[index];
                //debugger;
                let DataOrdinata = Lure.Chart.GetOrdinata(serie.Data, scale, mm, chart.Height);
                let points = Lure.Chart.GetPoints(Buffer.Abscissa, DataOrdinata, this.Options.Padding);
                Buffer.SeriesPoints[line] = points;

                const n = points.length;

                let xs = [];        //x
                let ys = [];        //y
                let dys = [];       //dx
                let dxs = [];       //dy
                let ds = [];        //derivative
                let ms = [];        //desired slope (m) at each point using Fritsch-Carlson method
                for(let i = 0; i < n; i++) {
                    xs[i] = points[i][0];
                    ys[i] = points[i][1];
                }
                // Calculate deltas and derivative
                for(let i = 0; i < n - 1; i++) {
                    dys[i] = ys[i + 1] - ys[i];
                    dxs[i] = xs[i + 1] - xs[i];
                    ds[i] = dys[i] / dxs[i];
                }
                // Determine desired slope (m) at each point using Fritsch-Carlson method
                // See: http://math.stackexchange.com/questions/45218/implementation-of-monotone-cubic-interpolation
                ms[0] = ds[0];
                ms[n - 1] = ds[n - 2];
                for(let i = 1; i < n - 1; i++) {
                    if(ds[i] === 0 || ds[i - 1] === 0 || (ds[i - 1] > 0) !== (ds[i] > 0)) {
                        ms[i] = 0;
                    } else {
                        ms[i] = 3 * (dxs[i - 1] + dxs[i]) / (
                            (2 * dxs[i] + dxs[i - 1]) / ds[i - 1] +
                            (dxs[i] + 2 * dxs[i - 1]) / ds[i]);
                        if(!isFinite(ms[i])) {
                            ms[i] = 0;
                        }
                    }
                }
                let d = `M ${xs[0]},${ys[0]}`;
                let dots = '<g class="mt-chart-dots">';
                for(let i = 0; i < n - 1; i++) {
                    d += ` C ${xs[i] + dxs[i] / 3},${ys[i] + ms[i] * dxs[i] / 3} ${xs[i + 1] - dxs[i] / 3},${ys[i + 1] - ms[i + 1] * dxs[i] / 3} ${xs[i + 1]},${ys[i + 1]}`;
                    if (serie.Point.Visible)
                        dots += Lure.Chart.GetPathLineDot(xs[i] , ys[i], line, i, serie.Color, serie.Point.Radius );
                }
                if (serie.Point.Visible)
                    dots += Lure.Chart.GetPathLineDot(xs[n-1] , ys[n-1], line, n-1, serie.Color, serie.Point.Radius );
                dots += '</g>';
                return `<g class="mt-chart-serie" data-type="Line"><path data-line="${line}" d="${d}" fill="none" stroke="${serie.Color}" stroke-width="${serie.Width}"></path> ${dots}</g>`;

            }.bind(this);
            this.__GetPathBar = function (serie, line) {
                if (!Buffer.Abscissa || Buffer.Width !== this.Width)
                    Buffer.Abscissa = Lure.Chart.GetAbscissa(chart.Options.Labels.Data, this.Width);
                let index = this._ScaleY.Dict[line];
                let scale = this._ScaleY.Scales[index];
                let mm = chart._ScaleY.MinMax[index];
                //debugger;
                let DataOrdinata = Lure.Chart.GetOrdinata(serie.Data, scale, mm, chart.Height);
                let points = Lure.Chart.GetPoints(Buffer.Abscissa, DataOrdinata, this.Options.Padding);
                Buffer.SeriesPoints[line] = points;
                let height = this.Height;

                let deilmit = 1;
                if (!this.Options.SeriesOptions.BarStack)
                    deilmit = Buffer.SeriesCount.Bar * 0.8;
                let wd = this.Width/this.Options.Labels.Data.length/2 / deilmit;        //serie.Width;
                let margin = ((wd*1.2) * (Buffer.SeriesBar)) - (  (wd*1.2) *Buffer.SeriesCount.Bar /2 - (wd*1.2)/2) ;

               // debugger;

                let bricks = '<g class="mt-chart-serie" data-type="Bar">';
                let GradientId = '';
                if (this.Options.SeriesOptions.BarGradient){
                    GradientId = `lc-gradient-${Lure.Chart.Count}`;
                    bricks += `<linearGradient id="${GradientId}"  x1="0" y1="0%"><stop offset="0%" stop-color="rgba(0,0,0,0.2)"/><stop offset="33%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="rgba(0,0,0,0.3)"/></linearGradient>`;
                }
                // let d = `M ${points[0][0]}  ${points[0][1]}`;
                let dots = '';
                for (let i = 0; i < points.length; i++){
                    let d =`M ${margin+points[i][0]-wd/2} ${height} L ${(margin+points[i][0]+wd/2)} ${height} ${(margin+points[i][0]+wd/2)} ${points[i][1]} ${margin+points[i][0]-wd/2} ${points[i][1]}Z`;
                    // debugger;
                    bricks += `<g class="lc-bar-elem"><path class="lc-bar-elem" data-line="${line}" data-item="${i}" d="${d}" fill="${serie.Color}" stroke="#000" stroke-width="0"></path>`;
                    if (this.Options.SeriesOptions.BarGradient)
                        bricks += `<path class="lc-bar-elem-gradient"  data-line="${line}" data-item="${i}" d="${d}" fill="url(#${GradientId})" ></path>`;
                    bricks += `<path class="mt-chart-tooltipable" data-type="bar" data-line="${line}" data-item="${i}" d="${d}" fill="#fff" fill-opacity="0" stroke="#fff" stroke-width="0"></path>`;
                    bricks +='</g>';
                    //dots += Lure.Chart.GetPathLineDot(points[i][0] , points[i][1], line, i, serie.Color, serie.Point.Radius );
                }
                bricks += dots+'</g>';
                Buffer.SeriesBar++;
                return bricks;
            }.bind(this);
            this.__GetSvgCasual = function () {
                let lines = '';
                let bars  = '';
                for (let i = 0; i < this.Options.Series.length; i++){
                    if (!this.Options.Series[i].isVisible)
                        continue;
                    switch (this.Options.Series[i].Type){
                        case 'line':
                            lines += this.__GetPathLine(this.Options.Series[i], i);
                            break;
                        case 'bar':
                            bars += this.__GetPathBar(this.Options.Series[i], i);
                            break;
                    }
                }
                return bars+lines;
            }.bind(this);
            this.__GetSvgPie = function () {
                let sectors = '';
                let d = this.Height< this.Width? this.Height*0.9:this.Width*0.9;
                //r= r/4;
                //let wd = 2*r;
                for (let i = 0; i < this.Options.Series.length; i++){
                    let sum = 0;
                    let anglestart = -45;
                    let r = d/4 * (this.Options.Series.length-i)/(Buffer.SeriesCount.Pie+Buffer.SeriesCount.Ring);
                    let wd = 2*r;
                    if (this.Options.Series[i].Type === 'ring'){
                        wd = this.Options.Series[i].Width;
                        r = r*2 - wd/2;

                    }
                    for (let j = 0; j < this.Options.Series[i].Data.length; j++){
                        sum += this.Options.Series[i].Data[j];
                    }
                    for (let j = 0; j < this.Options.Series[i].Data.length; j++){
                        let angle = this.Options.Series[i].Data[j]/sum * 360;
                        //debugger;
                        sectors += `<g>`;
                        sectors += `<path d="${Lure.Chart.PieArc(this.Width/2, this.Height/2, r, anglestart, anglestart+angle)}" fill="none" stroke="${this.Options.Series[i].Colors[j]}" stroke-width="${wd}" stroke-opacity="1"></path>`;
                        sectors += `<path class="mt-chart-tooltipable" data-type="pie" data-line="${i}" data-item="${j}" d="${Lure.Chart.PieArc(this.Width/2, this.Height/2, r, anglestart, anglestart+angle)}" fill="none" stroke="#fff" stroke-width="${wd}" stroke-opacity="0"></path>`;
                        sectors += `</g>`;
                        anglestart += angle;
                        //debugger;
                    }
                }
                //debugger;
                return sectors;
            }.bind(this);





            function Refresh(){
                Buffer.SeriesBar = 0;

                //-1. check Tooltip Temptale
                //Init.Tooltip();
               // //pp.Perf('Check-Tooltip');
                //0. build legend

                Init.Series();
                //pp.Perf('Init-Series');

                this.Block.Legend = Buffer.Legend;
                //pp.Perf('Render-Legend');

                //1. Init Y width

                Init.AxisY();
                //pp.Perf('Init-AxisY');
                //2. Init X height, and build AxisX cuz we have Y width.
                //Buffer.ParametersAxisX = Builder.CalcAxisX();
                Init.AxisX();
                Builder.AxisX();
                //pp.Perf('Init-AxisX');
                //3. Init scales Y axis

                Init.ScaleY();
                //this._ScaleY = Lure.Chart.GetScaleY(this.Options.Series, (this.Height-Buffer.ParametersAxisX.Height), this);
                //this._ScaleY = Lure.Chart.GetScaleY(this.Options.Series, (this.Height-Buffer.AxisXParams.Height), this);
                //pp.Perf('Init-AxisYScales');


                //this.Block.AxisX = Builder.MakeAxisX();
                //this.Block.AxisX.style.height = Buffer.AxisXParams.Height+'px';


                this.Block.Grid  = Builder.MakeGrid();
                //pp.Perf('Render-Grid');

                this.Block.AxisY = Builder.MakeAxisY();
                //pp.Perf('Render-AxisY');
                if (this.Options.Type === 'line' || this.Options.Type === 'bar')
                    this.Block.Svg   = chart.__GetSvgCasual();
                if (this.Options.Type === 'pie' || this.Options.Type === 'ring')
                    this.Block.Svg   = chart.__GetSvgPie();
                this.Block.AxisY.style.height = this.Height+'px';
                //pp.Perf('Render-Svg');

                let lines = Lure.SelectAll('.mt-chart-serie[data-type="Line"] path', this.Content);
                LastRender.Height = this.Height;
                LastRender.Width = this.Width;
                lines.forEach(function (item) {
                    const dash = item.getTotalLength();
                    item.style.strokeDasharray = dash;
                    item.style.strokeDashoffset = dash;
                });
                //pp.Perf('Animations-add');
                //pp.Elapsed('-elapsed-');
            }


            /********************************************************************************/
            /*******/
            /*<tooltips>*/
            Init.Tooltip();
            this.Tooltip = new Lure.Content({
                Name: 'Tooltipchek',
                Target: this.Block.ChartArea,
                Content: `<div class="mt-chart-tooltip">
                        <div class="val">${this.Options.Tooltip.Template}</div>
                      </div>`,
                Visible: false,
                Controller: {
                    Data: {},
                },
                BeforeShow: function (a,b) {

                },
                Prop: function () {
                    this._Timer = null;
                    this._Timer2 = null;
                },
                Shower: function () {
                    clearTimeout(this._Timer);
                    clearTimeout(this._Timer2);
                    this.Content.style.display = '';
                    this.Content.style.opacity = '1';
                },
                Hider: function () {
                    clearTimeout(this._Timer);
                    this._Timer = setTimeout(
                        function () {
                            this.Content.style.opacity = '0';
                            this._Timer2 = setTimeout(function () {
                                this.Content.style.display = 'none';
                            }.bind(this), 200)

                        }.bind(this), 800);
                },
                Show: function (options) {
                    clearTimeout(this._Timer);
                    this.Data.Name = options.data[0];
                    this.Data.Value = options.data[1];
                    this.Refresh();
                    this.Content.style.left = (options.pos[0] + 7)+"px";
                    this.Content.style.top = (options.pos[1] - this.Content.clientHeight - 7)+"px";
                    this.Content.style.backgroundColor = options.color;
                    //this._Timer = setTimeout(this.Hide, 2000);
                },
                Methods: function () {
                    this.Do = function (e) {
                        let tag = e.currentTarget.dataset['type'];
                        switch (tag){
                            case 'line':
                                this.DoCircle(e);
                                break;
                            case 'bar':
                                this.DoBar(e);
                                break;
                            case 'pie':
                                this.DoPie(e);
                                break;

                        }


                    }.bind(this);
                    this.DoCircle = function (e) {
                        let circle = e.currentTarget;
                        let i = parseInt(circle.dataset['line']);
                        let j = parseInt(circle.dataset['item']);
                        let color = circle.attributes['stroke'].value;
                        //console.log(` parseInt(circle.attributes['r'].value`,  parseInt(circle.attributes['r'].value) );
                        let width = parseInt(circle.attributes['stroke-width'].value);
                        circle.attributes['fill'].value = color;
                        circle.attributes['r'].value = parseInt(circle.attributes['r'].value) + width;
                        circle.attributes['stroke'].value = "#fff";


                        //console.log('', i, j, Buffer.SeriesPoints[i][j], [e.offsetX, e.offsetY]);
                        let o = {
                            data: [Series[i].Name, Series[i].Data[j]],
                            color: color,
                            pos: Buffer.SeriesPoints[i][j]  //[e.offsetX, e.offsetY]
                        };
                        this.Show(o);
                    }.bind(this);
                    this.DoBar = function (e) {
                        let bar = e.currentTarget;
                        bar.setAttribute('fill-opacity', 0.2);
                        let i = parseInt(bar.dataset['line']);
                        let j = parseInt(bar.dataset['item']);
                        // bar.attributes['stroke-width'].value = 2;
                        //console.log('', i, j, Buffer.SeriesPoints[i][j], [e.offsetX, e.offsetY]);
                        let o = {
                            data: [chart.Options.Series[i].Name, chart.Options.Series[i].Data[j]],
                            color: chart.Options.Series[i].Color,
                            pos: Buffer.SeriesPoints[i][j]  //[e.offsetX, e.offsetY]
                        };
                        this.Show(o);
                    }.bind(this);
                    this.DoPie = function (e) {
                        let bar = e.currentTarget;
                        bar.setAttribute('stroke-opacity', 0.2);
                        let i = parseInt(bar.dataset['line']);
                        let j = parseInt(bar.dataset['item']);
                        // bar.attributes['stroke-width'].value = 2;
                        //console.log('', i, j, Buffer.SeriesPoints[i][j], [e.offsetX, e.offsetY]);
                        let o = {
                            data: [chart.Options.Series[i].Labels? chart.Options.Series[i].Labels[j]: chart.Options.Series[i].Name, chart.Options.Series[i].Data[j]],
                            color: chart.Options.Series[i].Colors[j],
                            pos: [e.offsetX, e.offsetY]
                        };
                        this.Show(o);
                    }.bind(this);

                    this.Undo = function (e) {
                        let tag = e.currentTarget.dataset['type'];
                        switch (tag){
                            case 'line':
                                this.UndoCircle(e);
                                break;
                            case 'bar':
                                this.UndoBar(e);
                                break;
                            case 'pie':
                                this.UndoPie(e);
                                break;
                        }
                    };
                    this.UndoCircle = function (e) {
                        let circle = e.currentTarget;
                        let width = parseInt(circle.attributes['stroke-width'].value);
                        circle.attributes['stroke'].value = circle.attributes['fill'].value;
                        circle.attributes['fill'].value = "#fff";
                        circle.attributes['r'].value -= width;
                        this.Hide();
                    };
                    this.UndoBar = function (e) {
                        let bar = e.currentTarget;
                        bar.setAttribute('fill-opacity', 0);
                        this.Hide();
                    };
                    this.UndoPie = function (e) {
                        let pie = e.currentTarget;
                        pie.setAttribute('stroke-opacity', 0);
                        this.Hide();
                    }

                },
                AfterBuild: function () {

                }
            });
            Lure.AddEventListenerGlobal('mouseover', '.mt-chart-point, .mt-chart-tooltipable', function (e) {
                this.Tooltip.Do(e);
            }, this.Content, this);
            Lure.AddEventListenerGlobal('mouseout', '.mt-chart-point, .mt-chart-tooltipable' , function (e) {
                chart.Tooltip.Undo(e);           }, this.Content);
            /*</tooltips>*/

            this.TestB = function () {
                let per = performance.now();
               // Builder();
                Lure.Perf(per, 'builder');
            };
            /*
            this._TimerRefresh = null;
            this._IntervalResponse = setInterval(function () {
                if (this.Width !== LastRender.Width || this.Height !== LastRender.Height){
                    clearTimeout(this._TimerRefresh);
                    console.log('[changed]');
                    LastRender.Height = this.Height;
                    LastRender.Width = this.Width;
                    this._TimerRefresh = setTimeout(function () {
                        console.log('[redraw]');
                        Refresh.call(this);


                    }.bind(this) ,200);
                }
            }.bind(this), 200);
            */
            this.Buffer = Buffer;

            // Init


            this.Width;   //just init
            //this.Heigth;   //just init
            //pp.Perf('Constructor');
            Refresh.call(this);
            //Refresh.call(this);
            //**  API  **//

            this.Refresh = function () {
                Refresh.call(this);
            }.bind(this);
        }
        get Height(){
            return this.Block.Svg.clientHeight;
        }
        get Width(){
            return this.Block.Svg.clientWidth - this.Options.Padding;
        }
        /*statics*/
        static GetSeriePointOptions(serie, isGraph){
            let p = serie.Point ? serie.Point : {};
            p.Visible = (typeof p.Visible === 'undefined' || p.Visible);
            p.Radius = p.Radius? p.Radius : (4+serie.Width/4);
            if (Number.isNaN(p.Radius))
                debugger;
            return p;
        }
        static GetScaleY(series, height, ctx){
            if (ctx.Type === 'pie'){
                return [];
            }
            let min = series[0].Data[0];
            let max = series[0].Data[0];
            let isAutoScale = true;
            let isAutoStep = true;
            if (ctx.Options.AxisY.Scale[0] !== 'auto' && ctx.Options.AxisY.Scale[1] !== 'auto')
            {
                isAutoScale = false;
                min = ctx.Options.AxisY.Scale[0];
                max = ctx.Options.AxisY.Scale[1];
            }
            if (ctx.Options.AxisY.Scale[2] !== 'auto')
                isAutoStep = false;
            let mm = [ [series[0].Data[0],series[0].Data[0]] ];
            let index = 0;
            let scales = [];

            let sc = {
                Scales: [],
                Dict: [],
                MinMax: null
            };
            for (let i = 0; i < series.length; i++){
                sc.Dict[i] = 0;
                if (series[i].OwnAxis){
                    index++;
                    if (typeof series[i].OwnAxis[0] !== 'undefined')
                        mm.push(series[i].OwnAxis);
                    else
                        mm.push([series[i].Data[0],series[i].Data[0]]);
                    sc.Dict[i] = index;
                }
                for (let j = 0; j < series[i].Data.length; j++){
                    if (isAutoScale){
                        if (series[i].Data[j] < min)
                            min = series[i].Data[j];
                        if (series[i].Data[j] > max)
                            max = series[i].Data[j];
                    }
                    if (series[i].OwnAxis && typeof series[i].OwnAxis[0] === 'undefined'){
                        if (series[i].Data[j] < mm[index][0])
                            mm[index][0] = series[i].Data[j];
                        if (series[i].Data[j] > mm[index][1])
                            mm[index][1] = series[i].Data[j];
                    }
                }
            }
            mm[0] = [min, max];
            sc.MinMax = mm;
            for (let i = 0; i < mm.length; i++){
                let order = mm[i][1].toString().length;
                let step;
                if (i===0 && !isAutoStep){
                    step = ctx.Options.AxisY.Scale[2];
                }
                else{
                    step = mm[i][2]? mm[i][2] : ( (mm[i][1]-mm[i][0] )*40 /height / (Math.pow(10, order-1))/5 ).toFixed(1) * Math.pow(10, order-1)*5;
                }
                let s = mm[i][0];
                let scale = [];
                if (order < 3 || true){
                    //debugger;
                    while (s <= mm[i][1] + ctx.Options.Series[i].Width/2){
                        scale.push(s);
                        s += step;
                    }
                    scale.push(s);
                    sc.Scales.push(scale);
                }
            }
            return sc;
        }

        static GetAbscissa(labels, width){
            const stepX = width / (labels.length);
            return labels.map(function(a,i){return i*stepX});
        }
        static GetOrdinata(serie, scale, mm, height){
            let min = mm[0];
            let max = mm[1];
            const scaleCoefficient = scale[scale.length-1] / max;
            let ordinata = [];
            for (let j= 0; j < serie.length; j++){
                ordinata.push( height - (  (serie[j] - min) * height/(max-min)/scaleCoefficient )  );
            }
            //console.log('Y', Y);
            //console.log('ordinate', ordinate);
            //console.log(`min=${min} max=${max}`, height);
            //ordinata.push(ordinate);
            //console.log('ordinata', ordinata);
            return ordinata;



        }
        static GetPoints(X,Y, padding = 0){
            let points = [];
            //let length = X.length >= Y.length ? X.length:Y.length;
            for (let i = 0; i < Y.length; i++){
                points.push([X[i] + padding, Y[i]]);
            }
            return points;
        }
        static aGetPath(points, type, line, color, width){
            switch (type){
                case 'line':
                    return Lure.Chart.GetPathLine(points, line, color, width);
                case 'bar':
                    return Lure.Chart.GetPathBar(points, line, color, width);
                case 'pie':
                    return '';
            }
        }
        static aGetPathLine(points, line, color, width, isDots=true){
            const n = points.length;

            let xs = [];        //x
            let ys = [];        //y
            let dys = [];       //dx
            let dxs = [];       //dy
            let ds = [];        //derivative
            let ms = [];        //desired slope (m) at each point using Fritsch-Carlson method
            for(let i = 0; i < n; i++) {
                xs[i] = points[i][0];
                ys[i] = points[i][1];
            }
            // Calculate deltas and derivative
            for(let i = 0; i < n - 1; i++) {
                dys[i] = ys[i + 1] - ys[i];
                dxs[i] = xs[i + 1] - xs[i];
                ds[i] = dys[i] / dxs[i];
            }
            // Determine desired slope (m) at each point using Fritsch-Carlson method
            // See: http://math.stackexchange.com/questions/45218/implementation-of-monotone-cubic-interpolation
            ms[0] = ds[0];
            ms[n - 1] = ds[n - 2];
            for(let i = 1; i < n - 1; i++) {
                if(ds[i] === 0 || ds[i - 1] === 0 || (ds[i - 1] > 0) !== (ds[i] > 0)) {
                    ms[i] = 0;
                } else {
                    ms[i] = 3 * (dxs[i - 1] + dxs[i]) / (
                        (2 * dxs[i] + dxs[i - 1]) / ds[i - 1] +
                        (dxs[i] + 2 * dxs[i - 1]) / ds[i]);
                    if(!isFinite(ms[i])) {
                        ms[i] = 0;
                    }
                }
            }
            let d = `M ${xs[0]},${ys[0]}`;
            let dots = '<g class="mt-chart-dots">';
            for(let i = 0; i < n - 1; i++) {
                //console.log(d);
                d += ` C ${xs[i] + dxs[i] / 3},${ys[i] + ms[i] * dxs[i] / 3} ${xs[i + 1] - dxs[i] / 3},${ys[i + 1] - ms[i + 1] * dxs[i] / 3} ${xs[i + 1]},${ys[i + 1]}`;
                if (isDots)
                    dots += Lure.Chart.GetPathLineDot(xs[i] , ys[i], line, i, color, width );
            }
            dots += '</g>';
            //return d;
            //console.log(d);
            return `<g class="mt-chart-serie"><path data-line="${line}" d="${d}" fill="none" stroke="${color}" stroke-width="${width}"></path> ${dots}</g>`;
        }
        static GetPathLineDot(x,y, i,j, color, width){
            return `<circle class="mt-chart-point" data-type="line" data-line="${i}" data-item="${j}" cx="${x}" cy="${y}" r="${width}" stroke="${color}" stroke-width="2" fill="#fff" ></circle>`

        }
        static aGetPathBar(points, line, color, width){
            const wd = 30;
            console.log('GetPathBar', points);
            // return '';
            let p = `<path data-line="${line}" d=${0} fill="${color}" stroke="${color}" stroke-width="${width}"></path>`;
            // let d = `M ${points[0][0]}  ${points[0][1]}`;
            let dots = '';
            for (let i = 0; i < points.length; i++){
                let d =`M ${points[i][0]} ${points[i][1]} L ${points[i][0]} ${points[i][1]}`;
                //dots += Lure.Chart.GetPatwehLineDot(points[i][0] , points[i][1], line, i, color, width );
            }
            // debugger;
            return do2ts;
        }



        static PolarToCartesius(centerX, centerY, radius, angleInDegrees) {
            let angleInRadians = (angleInDegrees-0) * Math.PI / 180;

            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        }
        static PieArc(x, y, radius, startAngle, endAngle){
            //debugger;
            let start = Lure.Chart.PolarToCartesius(x, y, radius, endAngle);
            let end = Lure.Chart.PolarToCartesius(x, y, radius, startAngle);

            let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

            let d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
            ].join(" ");

            return d;
        }
        static CheckOwnAxis(ep){
            if (!ep.OwnAxis)
                return false;
            if (Array.isArray(ep.OwnAxis)){
                let min = false;
                let max = false;
                if (ep.OwnAxis[0] !== 'auto' || typeof ep.OwnAxis[0] !== 'undefined')
                    min = ep.Data[0];
                if (ep.OwnAxis[1] !== 'auto' || typeof ep.OwnAxis[1] !== 'undefined')
                    max = ep.Data[1];
                if (!min && !max)
                    return ep.OwnAxis;

                for (let i =0; i< ep.Data.length; i++){
                    if (ep.Data[i] < min)
                        min = ep.Data[i];
                    if (ep.Data[i] > max)
                        max = ep.Data[i];
                }
            }
        }
        /*builder*/
        static MakeLegend(Serie, i){
            let id = `lc-legeng_ch${Lure.Chart.Count}`;
            return `<div class="mt-chart-legend__item row">
                          <input class="mt-legend-checkbox" type="checkbox" ${Serie.isVisible? 'checked="cheched"':''} id="${id}">
                          <div class="mt-legend-icon" style="background-color: ${Serie.Color}"></div>
                          <label class="mt-legend-label" for="${id}">${Serie.Name}</label>
                        </div>`;
        }
        static GetGrid(sizeX, sizeY, padding=0){
            let grid = ``;
            for (let i = 0; i < sizeY; i++){
                grid += `<div class="mt-chart__grid-line row flex-100 flex-between" >`;
                for (let j = 0; j < sizeX; j++) {
                    if (j === 0)
                        grid += `<div class='mt-chart__grid-item flex-100' style="width: ${padding}px; max-width: ${padding}px"></div>`;
                    grid += `<div class='mt-chart__grid-item flex-100'></div>`;
                }
                grid += `</div>`;
            }
            grid += ``;
            return grid;
        }
    }
};

Lure.Chart = Lure.Plugin.Chart.Chart;
Lure.Chart.Count = 0;


Lure._GenerateString = function (prefix='') {
    let gen = prefix+(Math.random().toString(36)+Math.random().toString(36)+Math.random().toString(36)).replace("0.", '').replace(/[\d]+/, '').substring(0,1);
    if (Lure.Select(`#${gen}`)){
        gen = Lure._GenerateString(prefix);
    }
    return gen;
};






















