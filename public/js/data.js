/////////////////////////////
////    client side     ////
///////////////////////////

function getData (parameters) {
    $.get('/api/dashboard',parameters, function(data) {
        let rows;
        $.each(data, function(index, item) {
            let mortgage = item.industries['Mortgage & Banking'];
            let insu = item.industries['Insurance'];

            let row = '<tr>';
            row += '<td>' + item.segment + '</td>';
            row += '<td>' + mortgage.index + '</td>';
            row += '<td>' + mortgage.z_score + '</td>';
            row += '<td>' + mortgage.total_impressions + '</td>';
            row += '<td>' + insu.index + '</td>';
            row += '<td>' + insu.z_score + '</td>';
            row += '<td>' + insu.total_impressions + '</td>';
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
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        case 'mtd':
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        case 'pw':
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        case 'p30d':
            params.startDate = '11/01/16';
            params.endDate = '10/02/17';
            break;
        case 'p60d':
            params.startDate = '11/01/16';
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

    return {
        start : start.getFullYear() +  '-' + start.getMonth(),
        end : end.getFullYear() +  '-' + end.getMonth()
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


$('.form #test1').click(function() {
    console.log(event)
    console.log( "Handler for .click() called." );

    console.log();

    getRange();

    getCheckBox();
    // $('#myForm input').on('change', function() {
    // });

});