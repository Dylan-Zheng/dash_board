class chart{
    svg = undefined;
    data = undefined;
    svg_area = {width: 0, height: 0};
    padding = {top:50, right:50, botton:50, left:50 }
    scaleFn = {x: undefined, y: undefined};

    constructor(svg_id, data, modal_id){
        this.svg = d3.select(svg_id);
        this.data = data;
        if(modal_id == undefined || modal_id == null){
            this.svg_area.width = $(svg_id).outerWidth();
            this.svg_area.height = $(svg_id).outerHeight();
        }else{
            $(modal_id).modal('open');
            this.svg_area.width = $(svg_id).outerWidth();
            this.svg_area.height = $(svg_id).outerHeight();
            $(modal_id).modal('close');
        }
    }

    setScaleFnX(){
    }

    setScaleFnY(){
    }

    draw_xy_axis(){
    }

    draw_data(){
    }

    clear(){
        this.svg.selectAll("*").remove();
    }

    show(){
        this.clear();
        this.draw_xy_axis();
        this.draw_data();
    }


}
