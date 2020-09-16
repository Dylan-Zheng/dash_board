data_url = "/data/dota/freezeinfor.csv";
main_data= undefined;
bspObj = undefined;
class pc extends chart{

    line = undefined;
    axis = undefined;
    keys = [];
    dragging = {};
    background;
    foreground;
    svg_adjusted;

    position;
    path;
    brush;


    constructor(svg, data, modal_id){
        super(svg, data, modal_id);
        this.svg_area.widthwp = this.svg_area.width - this.padding.left - this.padding.right;
        this.svg_area.heightwp = this.svg_area.height - this.padding.top - this.padding.botton;
        this.svg_adjusted = this.svg.append("g")
            .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");
        this.line = d3.line();
        this.axis = d3.axisLeft();

    }

    setKeys(keys){
        let data = this.data;
        this.corr_matrix = getCorrlationMatrix(this.data, keys);
        this.cm_cols_sum_arr = getAbsColsSumArr(this.corr_matrix, keys);
        for(let i = 0; i < keys.length; i ++){
            this.keys.push(this.cm_cols_sum_arr[i].n);
        }
        this.setScaleFnX();
        this.setScaleFnY();
    }

    setScaleFnX(){
        this.scaleFn.x = d3.scalePoint().range([0, this.svg_area.widthwp]).padding(1);
        this.scaleFn.x.domain(this.keys)
    }

    setScaleFnY(){
        this.scaleFn.y ={};
        let keys = this.keys;
        for(let i in this.keys){
            this.scaleFn.y[keys[i]] = d3.scaleLinear()
                .domain(d3.extent(this.data, function(d) { return +d[keys[i]]; }))
                .range([this.svg_area.heightwp, 0]);
        }
    }

    draw_xy_axis(){
        let scaleFn = this.scaleFn;
        let axis = this.axis;
        let g = this.svg_adjusted.selectAll(".dimension")
            .data(this.keys)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + scaleFn.x(d) + ")"; });

        g.append("g")
            .attr("class", "pc_axis")
            .each(function(d) { d3.select(this).call(axis.scale(scaleFn.y[d])); })
            .append("text")
                .style("text-anchor", "middle")
                .style("fill", "#000000")
                .attr("y", -9)
                .text(function(d) { return d; });
    }


    draw_data(){
        this.background = this.svg_adjusted.append("g")
            .attr("class", "pc_background")
            .selectAll("path")
            .data(this.data)
            .enter().append("path")
            .attr("d", this.path);

        this.foreground = this.svg_adjusted.append("g")
            .attr("class", "pc_foreground")
            .selectAll("path")
            .data(this.data)
            .enter().append("path")
            .attr("d", this.path);
    }

    setFn(){
        let dragging = this.dragging;
        let position = this.position;
        let scaleFn = this.scaleFn;
        let line = this.line;
        let keys = this.keys;

        this.path = function path(d) {
            return line(keys.map(function(p) { return [scaleFn.x(p), scaleFn.y[p](d[p])]; }));
        }
    }

    setbrush(){
        let scaleFn = this.scaleFn,
            svg_area = this.svg_area,
            foreground = this.foreground,
            brush = this.brush,
            svg = this.svg,
            out = this.out,
            data = this.data,
            keys = this.keys;


        this.brush = brush = function (){
            let actives = [];
            svg.selectAll(".brush")
                .filter(function (d) {
                    scaleFn.y[d].brushSelectionValue = d3.brushSelection(this);
                    return d3.brushSelection(this);
                })
                .each(function (d) {
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this).map(scaleFn.y[d].invert)
                    });
                });
            let selected = [];
            foreground.style("display", function(d) {
                let isActive = actives.every(function(active) {
                    let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
                    return result;
                });
                if(isActive) selected.push(d);
                return (isActive) ? null : "none";
            });
        }

        let g = this.svg.selectAll(".dimension");

        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(scaleFn.y[d].brush = d3.brushY()
                    .extent([[-10,0], [10, svg_area.heightwp]])
                    .on("brush", brush)
                    .on("end", brush)
                )
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    }

    re_constructor(){
        this.clear();
        this.keys = [];
        this.dragging = {};
        this.background = undefined;
        this.foreground = undefined;
        this.position = undefined;
        this.path = undefined;
        this.brush = undefined;
        this.svg_adjusted = this.svg.append("g")
            .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");
        this.line = d3.line();
        this.axis = d3.axisLeft();
    }

    show(){
        this.draw_data();
        this.draw_xy_axis();
    }

}


// d3.csv(data_url, function(data){
//     main_data = data;
//     c = new pc(d3.select("#pc_chart"), main_data);
//     c.setKeys(["assists", "deaths", "gpm", "herodamage", "last_hits", "towerdamage", "xpm", "denies", "totalgold", "totalxp"]);
//     c.setFn();
//     c.show();
//     c.setbrush();
// })


