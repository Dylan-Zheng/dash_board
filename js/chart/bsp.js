data_url = "/data/dota/freezeinfor.csv";
main_data= undefined;
bspObj = undefined;
class bsp extends chart{
    key_x = undefined;
    key_y = undefined;

    setScaleFnX(){
        //x scale
        let key_x = this.key_x;
        this.scaleFn.x = d3.scaleLinear()
            .domain([0, d3.max(this.data, function(data){return +data[key_x]})])
            .range([0, this.svg_area.width - this.padding.left - this.padding.right]);
        //.padding(0.2);
        return this.scaleFn.x;
    }

    setScaleFnY(){
        //y scale
        let key_y = this.key_y;
        this.scaleFn.y = d3.scaleLinear()
            .domain([0, d3.max(this.data, function(data){return +data[key_y]})])
            .range([this.svg_area.height -this.padding.top - this.padding.botton, 0]);
        return this.scaleFn.y;
    }

    setKey_x(key_x){
        this.key_x = key_x;
        this.setScaleFnX();
    }

    setKey_y(key_y){
        this.key_y = key_y;
        this.setScaleFnY();
    }

    draw_xy_axis(){
        let x = 0, y =0;

        // X-axis
        var x_axis = d3.axisBottom()
            .scale(this.scaleFn.x);
        x = this.padding.left, y = this.svg_area.height -this.padding.top;
        this.svg.append("g")
            .attr("transform", "translate(" + x + "," + y + ")")
            .call(x_axis)

        // Y-axis
        var y_axis = d3.axisLeft()
            .scale(this.scaleFn.y);
        x =  this.padding.left, y = this.padding.top;
        this.svg.append("g")
            .attr("transform", "translate(" +  x + "," + y + ")")
            .call(y_axis);
    }

    draw_data(){
        let key_x = this.key_x, key_y = this.key_y, scaleFn = this.scaleFn;
        this.svg.selectAll(".dot")
            .data(this.data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return scaleFn.x(d[key_x])})
            .attr("cy", function(d) { return scaleFn.y(d[key_y])})
            .attr("transform", "translate(" +  this.padding.left + "," + this.padding.top + ")")
            .attr("fill", "blue")
            .attr("r", 3);
    }


}

// d3.csv(data_url, function(data){
//     selectAddOption(data.columns)
//     main_data = data;
//     bspObj = new bsp(d3.select("#bsp_chart"), main_data);
//     selectEvnt(bspObj);
//     bspObj.setKey_x("assists");
//     bspObj.setKey_y("deaths");
//     bspObj.show();
// })

// function selectAddOption(table_header){
//     for(let i = 0; i < table_header.length; i++){
//         $(".bar_select").append("<option value='"+table_header[i]+"'>"+ table_header[i] +"</option>");
//     }
// }
// function selectEvnt (chart){
//     $(".bar_select").change(function(){
//         let x =$("#key_x").val();
//         let y =$("#key_y").val();
//         chart.setKey_x(x);
//         chart.setKey_y(y);
//         chart.show();
//     });
// }

