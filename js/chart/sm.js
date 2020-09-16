data_url = "/data/dota/freezeinfor.csv";
main_data= undefined;
bspObj = undefined;
class sm extends chart{

    size = 0;
    keys = [];
    corr_matrix = undefined;
    cm_cols_sum_arr = undefined
    attr2Domain = {};
    padding = 100;
    plot = {}
    small = false;


    setSize(size){
        this.size = size;
    }


    setplot(){
        this.plot.size = (this.svg_area.height - this.padding) / this.size;
        this.plot.padding = this.padding/this.size;
    }

    setKeys(keys){
        let data = this.data;
        this.corr_matrix = getCorrlationMatrix(this.data, keys);
        this.cm_cols_sum_arr = getAbsColsSumArr(this.corr_matrix, keys);
        for(let i = 0; i < this.size; i ++){
            this.keys.push(this.cm_cols_sum_arr[i].n);
        }
        let k = this.keys;
        for(let i in this.keys){
            let min = d3.min(this.data, function(data){return +data[k[i]]}),
                max = d3.max(this.data, function(data){return +data[k[i]]})
            this.attr2Domain[this.keys[i]] = [min, max];
        }

        this.setScaleFnX();
        this.setScaleFnY();
    }

    setScaleFnX(){
        this.scaleFn.x = d3.scaleLinear()
            .rangeRound([this.plot.padding / 2, this.plot.size - this.plot.padding / 2])
        return this.scaleFn.x;
    }

    setScaleFnY(){
        this.scaleFn.y = d3.scaleLinear()
                .rangeRound([this.plot.size - this.plot.padding / 2, this.plot.padding / 2]);
        return this.scaleFn.y;
    }

    draw_xy_axis(){

        let n = this.keys.length,
            scaleFn = this.scaleFn,
            plot = this.plot,
            attr2Domain = this.attr2Domain;

        let xAxis = d3.axisBottom()
            .scale(scaleFn.x)
            .ticks(3);
        let yAxis = d3.axisRight()
            .scale(scaleFn.y)
            .ticks(3);

        let small = this.small;

        xAxis.tickSize(plot.size * n);
        yAxis.tickSize(-plot.size * n);

        this.svg.selectAll(".x.sm_axis")
            .data(this.keys)
            .enter().append("g")
            .attr("class", "x sm_axis")
            .attr("transform", function (d, i) {
                return "translate(" + (n - i - 1) * plot.size + ",0)";
            })
            .each(function (d) {
                if (small) return;
                scaleFn.x.domain(attr2Domain[d]);
                d3.select(this).call(xAxis);
            });

        this.svg.selectAll(".y.sm_axis")
            .data(this.keys)
            .enter().append("g")
            .attr("class", "y sm_axis")
            .attr("transform", function (d, i) {
                return "translate("+ plot.size * n + "," + i *  plot.size + ")";
            })
            .each(function (d) {
                if (small) return;
                scaleFn.y.domain(attr2Domain[d]);
                d3.select(this).call(yAxis);
            });
    }


    draw_data(){
        let plot = this.plot,
            scaleFn = this.scaleFn,
            attr2Domain = this.attr2Domain,
            data = this.data,
            small = this.small,
            n = this.keys.length;
        var cell = this.svg.selectAll(".sm_cell")
            .data(cross(this.keys, this.keys))
            .enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + (n - d.i - 1) * plot.size + "," + d.j * plot.size + ")";
            });

        cell.filter(function (d) {
            return d.i === d.j;
        })
            .append("text")
            .attr("x", plot.padding)
            .attr("y", plot.padding)
            .attr("dy", ".71em")
            .style("fill", "black")
            .text(function (d) {
                if(small) return;
                return d.x;
            });

        cell.each(function(p){
            let cell = d3.select(this);
            scaleFn.x.domain(attr2Domain[p.x]);
            scaleFn.y.domain(attr2Domain[p.y]);

            cell.append("rect")
                .attr("class", "sm_frame")
                .attr("x", plot.padding / 2)
                .attr("y", plot.padding / 2)
                .attr("width", plot.size - plot.padding)
                .style("pointer-events", "none")
                .attr("height", plot.size - plot.padding);

            var circles = cell.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) {
                    return scaleFn.x(d[p.x]);
                })
                .attr("cy", function (d) {
                    return scaleFn.y(d[p.y]);
                })
                .attr("r", 2)
                .style("fill", function (d) {
                    return "#2daeff";
                });
        });
    }

    clearData(){
        this.size = 0;
        this.keys = [];
        this.corr_matrix = undefined;
        this.cm_cols_sum_arr = undefined
        this.attr2Domain = {};
        this.plot = {}
    }

}

// d3.csv(data_url, function(data){
//     main_data = data;
//     c = new sm(d3.select("#sm_chart"), main_data);
//     c.setplot();
//     // c.plot.padding = 20
//     // c.plot.size = 230
//     c.setKeys(["assists", "deaths", "gpm", "herodamage", "last_hits", "towerdamage", "xpm", "denies", "totalgold", "totalxp"]);
//     c.show();
// })
