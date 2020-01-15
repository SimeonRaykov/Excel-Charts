$(document).ready(function () {
    $.ajax({
        url: `http://localhost:3000/api/getAllClients`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

});

function callback(data) {
    let clientsContainer = $('.container .clients');
    for (let el in data) {
        let id = data[el]['id'];
        let ident_code = data[el]['ident_code'];
        let name = data[el]['client_name'];
        let currElement = $(`<div> <a href=clients/hour-reading/${id}>${ident_code}</a> </div>`)
        clientsContainer.append(currElement);
    }
}