data_url = "/data/dota/freezeinfor.csv";
main_data= undefined;
bspObj = undefined;
class cm extends chart{

    keys = [];
    keys_head = [];
    corr_matrix = undefined;
    paddingInner = .1;
    tiptool = undefined;
    extent = undefined;


    setKeys(keys){
        this.keys = keys;
        let kh = this.keys_head;
        this.corr_matrix = getCorrlationMatrix(this.data, this.keys)
        this.keys.forEach(function(k){kh.push(k[0])});
        this.setScaleFnX();
        this.setScaleFnY();
    }

    setScaleFnX(){
        //x scale
        this.scaleFn.x = d3.scaleBand()
            .range([0, this.svg_area.width - this.padding.left - this.padding.right])
            .paddingInner(this.paddingInner)
            .domain(d3.range(1, this.keys.length+1));

        return this.scaleFn.x;
    }

    setScaleFnY(){
        //y scale
        this.scaleFn.y = d3.scaleBand()
            .range([this.svg_area.height - this.padding.top - this.padding.botton, 0])
            .paddingInner(this.paddingInner)
            .domain(d3.range(1, this.keys.length+1));

        return this.scaleFn.y;
    }

    draw_xy_axis(){
        let x = 0, y =0;
        let kh = this.keys_head;

        // X-axis
        var x_axis = d3.axisBottom(this.scaleFn.x)
            .tickFormat(function(d, i){ return kh[i]; })
            .scale(this.scaleFn.x);
        x = this.padding.left, y = this.svg_area.height -this.padding.top;
        this.svg.append("g")
            .attr("class", "cm_axis x")
            .attr("transform", "translate(" + x + "," + y + ")")
            .call(x_axis)

        // Y-axis
        var y_axis = d3.axisLeft(this.scaleFn.y)
            .tickFormat(function(d, i){ return kh[i]; })
            .scale(this.scaleFn.y);
        x =  this.padding.left, y = this.padding.top;
        this.svg.append("g")
            .attr("class", "cm_axis y")
            .attr("transform", "translate(" +  x + "," + y + ")")
            .call(y_axis);
    }

    draw_data(){
        this.extent = d3.extent(
            this.corr_matrix.map(function(d){ return d.r; }).filter(function(d){ return d <= 1.00; })
        )
        let cscaleFn = chroma.scale(["red", "white", "mediumpurple"])
            .domain([this.extent[0], 0, this.extent[1]]);
        let scaleFn = this.scaleFn;
        let x =  this.padding.left, y = this.padding.top;
        this.svg.selectAll("rect")
                .data(this.corr_matrix)
            .enter().append("rect")
            .attr("class", "cm_rect selected")
            .attr("x", function(d){ return scaleFn.x(d.x); })
            .attr("y", function(d){ return scaleFn.y(d.y); })
            .attr("transform", "translate(" +  x + "," + y + ")")
            .attr("width", this.scaleFn.x.bandwidth())
            .attr("height", this.scaleFn.y.bandwidth())
            .style("fill", function(d){ return cscaleFn(d.r); })
            .style("opacity", 1e-6)
            .transition()
            .style("opacity", 1);
    }

    clear() {
        super.clear();
        d3.select(this.legend_div_id).selectAll("*").remove();
    }

    showLegend(legend_div_id, legend_top, legend_height){
        let svg_area = this.svg_area;
        let padding = this.padding;
        this.legend_div_id = legend_div_id;

        let legend_svg = d3.select(legend_div_id).append("svg")
            .attr("width", svg_area.width)
            .attr("height", legend_height + legend_top)
            .append("g")
            .attr("transform", "translate(" + padding.left + ", " + legend_top + ")");

        let defs = legend_svg.append("defs");

        let gradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        let stops = [
            {offset: 0, color: "red", value: this.extent[0]},
            {offset: .5, color: "white", value: 0},
            {offset: 1, color: "mediumpurple", value: this.extent[1]}
            ];

        gradient.selectAll("stop")
            .data(stops)
            .enter().append("stop")
            .attr("offset", function(d){ return (100 * d.offset) + "%"; })
            .attr("stop-color", function(d){ return d.color; });

        legend_svg.append("rect")
            .attr("width", svg_area.width -(padding.left + padding.right))
            .attr("height", legend_height)
            .style("fill", "url(#linear-gradient)");

        legend_svg.selectAll("text")
            .data(stops)
            .enter().append("text")
            .attr("x", function(d){ return (svg_area.width - padding.left - padding.right) * d.offset; })
            .attr("dy", -3)
            .style("text-anchor", function(d, i){ return i == 0 ? "start" : i == 1 ? "middle" : "end"; })
            .text(function(d, i){ return d.value.toFixed(2); })
    }

    setTiptool(svg_d_id){
        this.tiptool = this.tiptool == undefined ? d3.select("body").append("div").attr("class", "cm_tiptool").style("display", "none") : this.tiptool;
        let padding = this.padding;
        let scaleFn = this.scaleFn;
        this.svg.selectAll(".cm_rect")
            .on("mouseover", function(d){
                d3.select(".cm_tiptool")
                    .style("display", "block")
                    .html(d.name_x + ", " + d.name_y + ": " + d.r.toFixed(2));
                var row_pos = scaleFn.y(d.y);
                var col_pos = scaleFn.x(d.x);
                var tip_pos = d3.select(".cm_tiptool").node().getBoundingClientRect();
                var tip_width = tip_pos.width;
                var tip_height = tip_pos.height;
                var chart_div_pos = d3.select(svg_d_id).node().getBoundingClientRect();
                var chart_div_left = chart_div_pos.left;
                var chart_div_top = chart_div_pos.top;
                var left = chart_div_left + col_pos + padding.left + (scaleFn.x.bandwidth() / 2) - (tip_width / 2);
                var top = chart_div_top + row_pos + padding.top - tip_height - 5;

                d3.select(".cm_tiptool")
                    .style("left", left + "px")
                    .style("top", top + "px");

                d3.select(".cm_axis.x .tick:nth-of-type(" + d.x + ") text")
                    .classed("selected", true)
                    .text(d.name_x);
                d3.select(".cm_axis.y .tick:nth-of-type(" + d.y + ") text")
                    .classed("selected", true)
                    .text(d.name_y);
                d3.select(".cm_axis.x .tick:nth-of-type(" + d.x + ") line")
                    .classed("selected", true);
                d3.select(".cm_axis.y .tick:nth-of-type(" + d.y + ") line")
                    .classed("selected", true);

            })
            .on("mouseout", function(d){
                d3.select(".cm_tiptool").style("display", "none");
                d3.select(".cm_axis.x .tick:nth-of-type(" + d.x + ") text")
                    .classed("selected", false)
                    .text(d.name_x[0]);
                d3.select(".cm_axis.y .tick:nth-of-type(" + d.y + ") text")
                    .classed("selected", false)
                    .text(d.name_y[0]);
                d3.select(".cm_axis.x .tick:nth-of-type(" + d.x + ") line")
                    .classed("selected", false);
                d3.select(".cm_axis.y .tick:nth-of-type(" + d.y + ") line")
                    .classed("selected", false);
            });
    }
}

// d3.csv(data_url, function(data){
//     main_data = data;
//     selectAddOption(data.columns);
//     c = new cm(d3.select("#cm_chart"), main_data);
//     selectEvnt(c);
//     c.setKeys(["assists", "deaths", "gpm", "herodamage", "last_hits", "towerdamage", "xpm", "denies", "totalgold", "totalxp"]);
//     c.show();
//     c.showLegend();
//     c.setTiptool();
// })

// function selectAddOption(table_header){
//     for(let i = 0; i < table_header.length; i++){
//         $(".bar_select").append("<option value='"+table_header[i]+"'>"+ table_header[i] +"</option>");
//     }
// }

// function selectEvnt (chart){
//     $(".bar_select").change(function(){
//         let arr = [];
//         $(".bar_select").each(function (i, o) {
//             arr.push($(o).val());
//         })
//         chart.setKeys(arr);
//         chart.show();
//         c.showLegend();
//         c.setTiptool();
//     });
// }
