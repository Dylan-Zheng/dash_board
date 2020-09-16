class bc extends chart{
    METHOD = {
        key_x: undefined,
        key_y: undefined,
        SUM:function (data, key_x, key_y){
            let sum_data = new Array();
            let result = new Array();
            let repeat_count = new Array();
            let index = 0;
            for(let i = 0; i < data.length; i++) {
                let a =data[i][key_x], b =data[i][key_y];
                if (sum_data[a] == undefined){
                    let arr = new Array();
                    sum_data[a] = index;
                    arr[key_x] = a;
                    arr[key_y] = 0
                    arr[key_y] = parseInt(b);
                    result.push(arr);
                    repeat_count[a] = 1;
                    index ++;
                }else{
                    repeat_count[a] ++;
                    result[sum_data[a]][key_y] += parseInt(b);;
                }
            }
            // result is a array has object like this {Categorize: value, 2.Measure : value}
            return {data: result, repeat_count: repeat_count};
        },
        AVG: function (data, key_x, key_y ){
            let result = this.SUM(data, key_x, key_y);
            let repeat_count = result.repeat_count
            let sum_data = result.data;
            for(let i = 0;  i < sum_data.length; i++){
                sum_data[i][key_y] /= repeat_count[sum_data[i][key_x]];
            }
            return {data: sum_data, repeat_count: repeat_count};
        },
        MAX: function (data, key_x, key_y){
            let dic = this.__repeat_key_x_dic(data, key_x, key_y);
            let result = new Array();
            let repeat_count = new Array();
            let keys = Object.keys(dic);
            for (let i = 0; i < keys.length; i++){
                let max = 0
                if(dic[keys[i]].length > 0){
                    max = d3.max(dic[keys[i]]);
                }
                let arr = new Array();
                arr[key_x] = keys[i];
                arr[key_y] = 0;
                arr[key_y] = max;
                result.push(arr)
                repeat_count[keys[i]] = dic[keys[i]].length;
            }
            return {data: result, repeat_count: repeat_count}
        },
        MIN: function (data, key_x, key_y){
            let dic = this.__repeat_key_x_dic(data, key_x, key_y);
            let result = new Array();
            let repeat_count = new Array();
            let keys = Object.keys(dic);
            for (let i = 0; i < keys.length; i++){
                let min = 0
                if(dic[keys[i]].length > 0){
                    min = d3.min(dic[keys[i]]);
                }
                let arr = [];
                arr[key_x] = keys[i];
                arr[key_y] = 0;
                arr[key_y] = min;
                result.push(arr)
                repeat_count[keys[i]] = dic[keys[i]].length;
            }
            return {data: result, repeat_count: repeat_count}
        },
        MED: function(data, key_x, key_y) {
            let dic = this.__repeat_key_x_dic(data, key_x, key_y);
            let result = new Array();
            let repeat_count = new Array();
            let keys = Object.keys(dic);
            for(let i = 0; i < keys.length; i++){
                let med = 0;
                if(dic[keys[i]].length > 0){
                    med = this.__med_of_array(dic[keys[i]]);
                }
                let arr = [];
                arr[key_x] = keys[i];
                arr[key_y] = 0;
                arr[key_y] = med;
                result.push(arr)
                repeat_count[keys[i]] = dic[keys[i]].length;
            }
            return {data: result, repeat_count: repeat_count};
        },

        __med_of_array: function (array){
            array.sort(function(a, b) {
                return a - b;
            });
            var mid = array.length / 2;
            return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
        },
        __repeat_key_x_dic : function (data, key_x, key_y){
            //dic is {key_x: array of key_y}
            let dic = new Array();
            for (let i = 0; i < data.length; i++){
                let xk = data[i][key_x], yk = parseInt(data[i][key_y]);
                if (dic[xk] == undefined){
                    dic[xk] = new Array();
                    dic[xk].push(yk);
                }else{
                    dic[xk].push(yk)
                }
            }
            return dic;
        }
    }

    key_x = undefined;
    key_y = undefined;
    colors = d3.schemeCategory20c;
    range = [0, 0]
    sub_data = {};

    setKey_x(key_x){
        this.key_x = key_x;
    }
    setKey_y(key_y){
        this.key_y = key_y;
    }
    setRange(r) {
        this.range[0] = r.f;
        this.range[1] = r.t;
        let filter_str = r.s
        let key_x = this.key_x;
        let filter_keys = undefined;
        this.sub_data = this.data.slice(this.range[0], this.range[1]);

        if (filter_str == "") {
            return this.sub_data;
        }else{
            let filter_keys = filter_str.split(",")
            this.sub_data = this.sub_data.filter(function(elem1){
                for ( let index in filter_keys){
                    if (elem1[key_x] == filter_keys[index]){
                        return true;
                    }
                }
            })
        }
        return this.sub_data;
    }

    setMethod(method_name){
        return this.sub_data = this.METHOD[method_name](this.sub_data, this.key_x, this.key_y).data;
    }

    setScaleFnX() {
        let key_x = this.key_x;
        let x_domain_name = d3.map(this.sub_data, function(d){return d[key_x]}).keys();
        let xs = d3.scaleBand ()
        //set domain array
            .domain(x_domain_name)
            .range([0, this.svg_area.width - this.padding.left - this.padding.right])
            .padding(0.2);
        this.scaleFn.x = xs;
        return xs;
    }

    setScaleFnY() {
        let key_y = this.key_y;
        //y scale
        let ys = d3.scaleLinear()
            .domain([0, d3.max(this.sub_data, function(sub_data){return +sub_data[key_y]})])
            .range([this.svg_area.height - this.padding.top - this.padding.botton, 0]);
        this.scaleFn.y = ys;
        return ys;
    }

    draw_xy_axis() {
        let x = 0, y =0,
            scaleFn = this.scaleFn;
        // X-axis
        let x_axis = d3.axisBottom()
            .scale(scaleFn.x);
        x = this.padding.left, y = this.svg_area.height - this.padding.top;
        this.svg.append("g")
            .attr("transform", "translate(" + x + "," + y + ")")
            .call(x_axis)
        // Y-axis
        let y_axis = d3.axisLeft()
            .scale(this.scaleFn.y);
        x =  this.padding.left, y  = this.padding.top;
        this.svg.append("g")
            .attr("transform", "translate(" +  x + "," + y + ")")
            .call(y_axis);
    }

    draw_data() {
        let x = this.padding.left, y = this.padding.top;
        let svg_area = this.svg_area,
            padding = this.padding,
            scaleFn = this.scaleFn,
            key_x = this.key_x,
            key_y = this.key_y,
            colors = this.colors;

        //create html group element. under html svg element, svg id is chart.
        let barGroup = this.svg.append("g")
            .attr("transform", "translate(" + x + "," + y + ")");

        //create rect under g element.
        barGroup.selectAll("rect").data(this.sub_data).enter()
            .append("rect")
            .attr("width", scaleFn.x.bandwidth())
            .attr("height", function (d, i){
                return svg_area.height - padding.top -padding.botton - scaleFn.y(d[key_y]);
            })
            .attr("x", function (d,i){
                return scaleFn.x(d[key_x]);
            })
            .attr("y", function (d,i){
                return scaleFn.y(d[key_y]);
            }).attr("fill", function (d,i){
            return colors[0];
            //set Event function for every rect.
        }).on("mouseover", function(d) {
            d3.select(this)
                .attr("fill", colors[2]);
        }).on("mouseout", function(d, i) {
            d3.select(this).
            attr("fill", function() {
                return "" + colors[0] + "";
            });
        });
    }


}