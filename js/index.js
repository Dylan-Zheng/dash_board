let data_url = "/data/dota/freezeinfor.csv";
let main_data = undefined;
let table_header = undefined

let bspObj = undefined;
$(document).ready(function () {

    $('.modal').modal();
    $('select').formSelect();
    $("#body_container").html($("#body_template").html());


    $("#loadBtn").on('click', function () {
        $("#body_container").empty();
        $("#body_container").append($("#body_template").html());

        let new_title = $('#title').val();
        let new_data_url = $('#data_url').val() == "" ? undefined : $('#data_url').val();

        //re-new title
        $("head title").text(new_title == "" ? "DashBoard": new_title+" DashBoard")
        $('#nav_title').text(new_title == "" ? "DashBoard": new_title+" DashBoard");


        //loading data.
        data_url = new_data_url == undefined ? "/data/dota/freezeinfor.csv": new_data_url;
        d3.csv(data_url, function(data){
            $('.modal').modal();
            $('select').formSelect();
            $("body").css("overflow","visible");

            //save data
            main_data = data;
            table_header = data.columns;

            //Todo: setup chart

            //bsp - create obj
            let bspObj = new bsp("#svg_chart-1", main_data, "#chart-1" );
            let bspObj_s= new bsp("#svg_chart-1_s", main_data)
            //bsp - select add option
            selectAddOption($("#chart-1 select"), table_header);
            //bsp - select event
            $("#chart-1 select").change(function(){
                let keys = new Array();
                $("#chart-1 select").each((i, elem)=>{
                    let val = $(elem).val()
                    if(val != ""){
                        keys.push(val)
                    }
                })
                if(keys.length == 2){
                    chartLink(bspObj, bspObj_s, "setKey_x", keys[0]);
                    chartLink(bspObj, bspObj_s, "setKey_y", keys[1]);
                    chartLink(bspObj, bspObj_s, "show");
                }else{
                    chartLink(bspObj, bspObj_s, "clear");
                }
            })

            //bc - create obj
            let bcObj = new bc("#svg_chart-2", main_data, "#chart-2" );
            let bcObj_s = new bc("#svg_chart-2_s", main_data )
            //bc - set select
            selectAddOption($("#chart-2 .c2select"), table_header);

            //create range slider
            let slider = document.getElementById('range_slider');
            noUiSlider.create(slider, {
                start: [0, main_data.length],
                connect: true,
                step: 1,
                orientation: 'horizontal', // 'horizontal' or 'vertical'
                range: {
                    'min': 0,
                    'max': main_data.length
                },
                format: {
                    to: function ( value ) {
                        return Math.ceil(value);
                    },
                    from: function ( value ) {
                        return Math.ceil(value);
                    }
                }
            });
            //bc - change event fn
            function bc_change_event(){
                let keys = new Array();
                $("#chart-2 .c2select").each((i, elem)=>{
                    let val = $(elem).val()
                    if(val != ""){
                        keys.push(val)
                    }
                })
                if(keys.length == 2){
                    chartLink(bcObj, bcObj_s, "setKey_x", keys[0]);
                    chartLink(bcObj, bcObj_s, "setKey_y", keys[1]);
                    chartLink(bcObj, bcObj_s, "setRange", {
                        f:slider.noUiSlider.get()[0],
                        t:slider.noUiSlider.get()[1],
                        s:$("#chart-2 #filter_text").val()
                    });
                    chartLink(bcObj, bcObj_s, "setMethod", $("#method").val());
                    chartLink(bcObj, bcObj_s, "setScaleFnX");
                    chartLink(bcObj, bcObj_s, "setScaleFnY");
                    chartLink(bcObj, bcObj_s, "show");
                }else{
                    chartLink(bcObj, bcObj_s, "clear");
                }
            };
            //bc - select event
            $("#chart-2 .c2select").on("change", bc_change_event);
            $("#method").on("change", bc_change_event);
            $(".setFilterBtn").on("click", bc_change_event)
            $(".clearFilterBtn").on("click", ()=>{
                $("#chart-2 #filter_text").val("");
                bc_change_event();
            })
            slider.noUiSlider.on("change", bc_change_event);



            $("#chart-3").modal('open');
            if($("#svg_chart-3_s").width() > $("#svg_chart-3_s").height()){
                $("#svg_chart-3_s").width($("#svg_chart-3_s").height())
            }else{
                $("#svg_chart-3_s").height($("#svg_chart-3_s").width())
            }
            $("#chart-3").modal('open');
            if($("#svg_chart-3").width() > $("#svg_chart-3").height()){
                $("#svg_chart-3").width($("#svg_chart-3").height())
            }else{
                $("#svg_chart-3").height($("#svg_chart-3").width())
            }
            $("#chart-3").modal('close');

            //cm - create obj
            let cmObj = new cm("#svg_chart-3", main_data, "#chart-3" );
            let cmObj_s = new cm("#svg_chart-3_s", main_data )

            //cm - select event
            let cmObj_selects_counter = 0;
            $("#chart-3 .addColBtn").on("click", function(){
                data = {value: table_header};
                addSelect("#chart-3 .select-list", "#select-list-template", data,
                    //Todo: select event;
                    function (elem){
                        let keys = [];
                        if($(this).val() == "{[]}"){
                            $(this).remove();
                            cmObj_selects_counter -= 1;
                        }
                        $("#chart-3 select").each((i, elem)=>{
                            let val = $(elem).val()
                            if(val != ""){
                                keys.push(val)
                            }
                        })
                        if(keys.length == cmObj_selects_counter && keys.length != 0){
                            // chartLink(cmObj, cmObj_s, "clear");
                            chartLink(cmObj, cmObj_s, "setKeys", keys);
                            chartLink(cmObj, cmObj_s, "show");
                            cmObj.showLegend("#svg_chart-3_l_d", 15, 15)
                            cmObj.setTiptool("#svg_chart-3_d");
                        }else if(keys.length == 0){
                            chartLink(cmObj, cmObj_s, "clear");
                        }
                    });
                cmObj_selects_counter += 1;
            })


            //sm - svg_chart-4_s resize
            if($("#svg_chart-4_s").width() > $("#svg_chart-4_s").height()){
                $("#svg_chart-4_s").width($("#svg_chart-4_s").height())
            }else{
                $("#svg_chart-4_s").height($("#svg_chart-4_s").width())
            }
            $("#chart-4").modal('open');
            if($("#svg_chart-4").width() > $("#svg_chart-4").height()){
                $("#svg_chart-4").width($("#svg_chart-4").height())
            }else{
                $("#svg_chart-4").height($("#svg_chart-4").width())
            }
            $("#chart-4").modal('close');
            //sm - create obj
            let smObj = new sm("#svg_chart-4", main_data, "#chart-4")
            let smObj_s = new sm("#svg_chart-4_s", main_data)
            smObj_s.small = true;
            smObj_s.padding = 15;
            //sm - select event
            let smObj_selects_counter = 0;
            $("#chart-4 .addColBtn").on("click", function(){
                data = {value: table_header};
                addSelect("#chart-4 .select-list", "#select-list-template", data,
                    //Todo: select event;
                    function (elem){
                        let keys = [];
                        if($(this).val() == "{[]}"){
                            $(this).remove();
                            smObj_selects_counter -= 1;
                        }
                        $("#chart-4 select").each((i, elem)=>{
                            let val = $(elem).val()
                            if(val != ""){
                                keys.push(val)
                            }
                        })
                        if(keys.length == smObj_selects_counter && keys.length != 0){
                            chartLink(smObj, smObj_s, "clearData");
                            chartLink(smObj, smObj_s, "setSize", smObj_selects_counter);
                            chartLink(smObj, smObj_s, "setplot");
                            chartLink(smObj, smObj_s, "setKeys", keys);
                            chartLink(smObj, smObj_s, "show");
                        }else if(keys.length == 0){
                            chartLink(smObj, smObj_s, "clear");
                        }
                    });
                smObj_selects_counter += 1;
            })


            //pc - obj create
            let pcObj = new pc("#svg_chart-5", main_data, "#chart-5")
            let pcObj_s = new pc("#svg_chart-5_s", main_data)
            //sm - select event
            let pcObj_selects_counter = 0;
            $("#chart-5 .addColBtn").on("click", function(){
                data = {value: table_header};
                addSelect("#chart-5 .select-list", "#select-list-template", data,
                    //Todo: select event;
                    function (elem){
                        let keys = [];
                        if($(this).val() == "{[]}"){
                            $(this).remove();
                            pcObj_selects_counter -= 1;
                        }
                        $("#chart-5 select").each((i, elem)=>{
                            let val = $(elem).val()
                            if(val != ""){
                                keys.push(val)
                            }
                        })
                        if(keys.length == pcObj_selects_counter && keys.length != 0){
                            chartLink(pcObj, pcObj_s, "re_constructor");
                            chartLink(pcObj, pcObj_s, "setKeys", keys);
                            chartLink(pcObj, pcObj_s, "setFn");
                            chartLink(pcObj, pcObj_s, "show");
                            chartLink(pcObj, pcObj_s, "setbrush");

                        }else if(keys.length == 0){
                            chartLink(pcObj, pcObj_s, "clear");
                        }
                    });
                pcObj_selects_counter += 1;
            })
        })

    })

});


