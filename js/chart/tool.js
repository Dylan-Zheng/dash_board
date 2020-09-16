function correlation(x,y){
    let {min, pow, sqrt, floor} = Math;
    let sum_x = 0, sum_y = 0;
    let mean_x = 0, mean_y = 0;
    let sum_dxdy = 0, sum_dx2 = 0, sum_dy2 = 0;
    let length = min(x.length, y.length)

    for(let i = 0; i < length; i++){
        sum_x += +x[i];
        sum_y += +y[i];
    }
    mean_x = sum_x / length;
    mean_y = sum_y / length;

    for (let i =0; i < length; i++){
        let dx = x[i]-mean_x, dy = y[i] - mean_y;
        sum_dxdy += dx * dy;
        sum_dx2 += pow(dx, 2);
        sum_dy2 += pow(dy, 2);
    }

    let step1 = sqrt(sum_dx2) * sqrt(sum_dy2);
    let step2 = step1 == 0 ? 0 : (sum_dxdy / step1);

    return floor(step2 * 1000) / 1000;
}

function getColXYAsArr(data, x, y){
    let arr = {x : new Array(), y : new Array()};
    for (let i = 0; i < data.length; i++){
        arr.x.push(data[i][x]);
        arr.y.push(data[i][y]);
    }
    return arr;
}

function getCorrlationMatrix(data, cols){
    var m = [];
    for(let x in cols){
        for(let y in cols){
            var arr = getColXYAsArr(data, cols[x], cols[y]);
            m.push({
                x: +x +1,
                y: +y +1,
                name_x: cols[x],
                name_y: cols[y],
                r: correlation(arr.x, arr.y)
            });
        }
    }
    return m;
}

function getAbsColsSumArr(corr, cols){
    var arr = new Array(cols.length);
    for (let i in cols){
        arr[i] = {n: cols[i], v: 0}
    }
    for (let i in corr){
        let x = corr[i].x - 1;
        arr[x].v += Math.abs(+corr[i].r);
    }
    arr.sort(function(a, b){return b.v - a.v; })
    return arr;
}

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = 0; i < n; i++) {
        for (j = 0; j < m; j++) {
            c.push({x: a[i], i: i, y: b[j], j: j});
        }
    }
    return c;
}

function selectAddOption(select, table_header){
    for(let i = 0; i < table_header.length; i++){
        select.append("<option value='"+table_header[i]+"'>"+ table_header[i] +"</option>");
    }
}


function chartLink(c1, c2, fn_name, data){
    c1[fn_name](data);
    c2[fn_name](data);
}

addSelect  = function (component_id, template_id, data, changeEventFn) {
    let template = $(template_id).html();
    let html_text = Mustache.render(template, data);
    let elem = $(html_text).find('select').change(changeEventFn);
    $(component_id).append(elem);
    return html_text;
};

rebuildComponent  = function (component, template_id, data) {
    $(component).empty();
    let template = $(template_id).html();
    let html_text = Mustache.render(template, data);
    $(component).html(html_text);
    return html_text;
};


