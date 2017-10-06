/////////////////////////////
////    client side     ////
///////////////////////////

function getData (parameters) {
    $.get('/api/dashboard',parameters, function(data) {
        let rows;
        $.each(data, function(index, item) {
            let mortgage = item.industries['Mortgage & Banking'];
            let insu = item.industries['Insurance'];

            let color = 'lgreen';

            let mIndex = parseInt(mortgage.index, 10);
            let iIndex = parseInt(insu.index, 10);

            let mColor = (mIndex > 100 && mIndex <= 125) ? 'lgreen' :
                        (mIndex > 125 && mIndex <= 150) ? 'mgreen' :
                        (mIndex > 150) ? 'dgreen' : 'red';

            let iColor = (iIndex > 100 && iIndex <= 125) ? 'lgreen' :
                        (iIndex > 125 && iIndex <= 150) ? 'mgreen' :
                        (iIndex > 150) ? 'dgreen' : 'red';

            // .css("background-color", "yellow")
            let row = '<tr>';
            row += '<td>' + item.segment + '</td>';
            row += '<td class=' + mColor + '>' + parseInt(mortgage.index, 10) + '</td>';
            // row += '<td>' + mortgage.z_score + '</td>';
            row += '<td class=' + mColor + '>' + mortgage.total_impressions + '</td>';
            row += '<td class=' + iColor + '>' + parseInt(insu.index, 10) + '</td>';
            // row += '<td>' + insu.z_score + '</td>';
            row += '<td class=' + iColor + '>' + insu.total_impressions + '</td>';
            rows += row + '<tr>';
        });
        $('.results tbody').html(rows);
    });
}

function getCheckBox () {
    let sList = "";
    $('.form input[type=checkbox]').each(function () {
        let sThisVal = (this.checked ? this.name : "0");
        sList += (sList=="" ? sThisVal : "," + sThisVal);
    });
    console.log (sList);
}

function getRange() {
    let range = $('input[name=range]:checked', '.form').val();
    let params = {};
    switch(range) {
        case 'ytd':
            params.startDate = '01/01/17';
            params.endDate = '10/02/17';
            break;
        case 'py':
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        case 'pym':
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        case 'pm':
            params.startDate = '09/02/17';
            params.endDate = '10/02/17';
            break;
        case 'mtd':
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        // case 'pw':
        //     params.startDate = '11/01/16';
        //     params.endDate = '10/02/17';
        //     break;
        case 'p30d':
            params.startDate = '09/02/17';
            params.endDate = '10/02/17';
            break;
        case 'p60d':
            params.startDate = '08/02/17';
            params.endDate = '10/02/17';
            break;
        default:
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
    }
    return params;
}

function getCalData(parameters) {
    let start = new Date(parameters.startDate);
    let end = new Date(parameters.endDate);

    let startMonth = (start.getMonth() + 1) < 10 ? '0' + (start.getMonth() + 1) : (start.getMonth() + 1);
    let endMonth = (end.getMonth() + 1) < 10 ? '0' + (end.getMonth() + 1) : (end.getMonth() + 1);

    return {
        start : start.getFullYear() +  '-' + startMonth,
        end : end.getFullYear() +  '-' + endMonth
    };
}

$(function(){
    $(document).ready(function() {
        let parameters = getRange();
        let cal = getCalData(parameters);
        $('#start').val(cal.start);
        $('#end').val(cal.end);

        getData(parameters);
    });
});


$('.form .submit').click(function() {
    let parameters = getRange();
    let cal = getCalData(parameters);

    $('#start').val(cal.start);
    $('#end').val(cal.end);

    getCheckBox();

    getData(parameters);
});