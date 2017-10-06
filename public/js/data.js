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

$(function(){
    $(document).ready(function() {
        let parameters = { startDate: '11/01/16', endDate : '10/02/17' };

        $('#start').val("2016-11");
        $('#end').val("2017-10");

        getData(parameters);
    });
});
