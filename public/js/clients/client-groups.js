$(document).ready(function () {
    renderTabBasedOnState();
    getClients();
    getGroups();
    setHistorySearchState();
});

class GroupList {
    constructor() {
        this.groupList = [];
        this.jqueryDataList;
    }
    getGroupList() {
        return this.groupList;
    }
    getJqueryDataList() {
        return this.jqueryDataList;
    }
    setGroupList(groupList) {
        this.groupList = groupList;
        return this;
    }
    setJqueryDataList(jqueryEl) {
        this.jqueryDataList = jqueryEl;
        return this;
    }
}
let groupLists = new GroupList();

function renderTabBasedOnState() {
    if (localStorage.getItem('initGroups') === '1') {
        localStorage.removeItem('initGroups');
        $('#groups-tab').click();
    } else {
        $('#clients-tab').click();
    }
}

(function addToGroupEvent() {
    $('#save-to-group').on('click', function () {
        const divsEl = $('.modal-body-clients ul div');
        let objArr = [];
        const groupID = $('#groupsChoice').val();
        divsEl.each(function (el) {
            if ($(this).find('input').is(':checked')) {
                const currClientID = $(this).find('li').attr('data-id');
                const currClientGroupArr = [groupID, currClientID, new Date().toISOString().slice(0, 19).replace('T', ' '), new Date().toISOString().slice(0, 19).replace('T', ' ')];
                objArr.push(currClientGroupArr);
            }
        });
        if (objArr.length === 0) {
            notification('Трябва да бъде избрано поне 1 ИД', 'error');
        } else {
            $.ajax({
                url: '/api/clients-group',
                method: 'POST',
                data: {
                    objArr
                },
                dataType: 'json',
                success: function (data) {
                    notification('Успешно добавен  клиент в групата', 'success');
                    setTimeout(function () {
                        location.reload();
                    }, 1000);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    notification(jqXhr.responseJSON.message, 'error');
                }
            })
        }
    });
}());

(function createGroupEvent() {
    $('#create-group').on('click', function () {
        if (validateGroupName() === 200) {
            const groupName = $('#group-name').val();
            $.ajax({
                url: '/api/group',
                method: 'POST',
                data: {
                    groupName
                },
                dataType: 'json',
                success: function (data) {
                    notification('Успешно създадена група', 'success');
                    setTimeout(function () {
                        localStorage.setItem('initGroups', 1);
                        location.reload();
                    }, 1000);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    if (jqXhr.status === 409 && jqXhr.responseJSON.message === 'Duplicate entry!') {
                        notification(`Вече има създадена група с име ${groupName}`, 'error');
                    }
                }
            });
        };
    });
}());

function getGroups() {
    $.ajax({
        url: '/api/groups',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data && data != undefined) {
                groupLists.setGroupList(data);
                visualizeGroupsDataTable(data);
                visualizeGroupNamesDataListings(data);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function visualizeGroupsDataTable(data) {
    for (let i = 0; i < data.length; i += 1) {
        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        currRow
            .append($('<td>' + `<a href="#" class="group-modal" data-toggle="modal" data-id="${data[i]['id']}" data-name="${data[i]['name']}" data-target="#GroupModal">${data[i]['id']}</a>` + '</td>'))
            .append($('<td>' + `<a href="#" class="group-modal" data-toggle="modal" data-id="${data[i]['id']}" data-name="${data[i]['name']}" data-target="#GroupModal">${data[i]['name']}</a>` + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#groupsTbody'));
    }
    //DESC order 
    dataTable = $('#groups-table').DataTable({
        stateSave: true,
        "order": [
            [0, "asc"]
        ]
    });

    $('.group-modal').on('click', function (ev) {
        const groupID = ev.target.getAttribute('data-id');
        const groupName = ev.target.getAttribute('data-name');
        $('#GroupLongTitle').text(`Група: ${groupName}`);

        $.ajax({
            url: `/api/clients-in-group/${groupID}`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                updateGroupModalText(data);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });


}

function setHistorySearchState() {
    try {
        const historySearchClientName = JSON.parse(localStorage.getItem('DataTables_clients-table_/users/groups')).columns[0].search.search;
        if (historySearchClientName) {
            $('#client_name').val(historySearchClientName);
        }
    } catch (e) {
        console.log(e);
    }
    try {
        const historySearchClientGroup = JSON.parse(localStorage.getItem('DataTables_groups-table_/users/groups')).columns[1].search.search;
        if (historySearchClientGroup) {
            $('#group_name').val(historySearchClientGroup);
        }
    } catch (e) {
        console.log(e);
    }
}

function getClients() {
    $.ajax({
        url: '/api/groups-clients',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data && data != undefined) {
                visualizeClientsDataTable(data);
                visualizeClientNamesDataListings(data);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function visualizeClientNamesDataListings(data) {
    let namesDataListing = $('<datalist id="client_names" >');
    let clNames = [];
    for (let obj of data) {
        clNames.push(obj.name);
    }
    const filteredNames = clNames.filter((v, i, a) => a.indexOf(v) === i);
    for (let name of filteredNames) {
        let currName = $(`<option>${name}</option>`);
        currName.appendTo(namesDataListing);
    }
    namesDataListing.append('</datalist>');
    $('#client_name').append(namesDataListing);
}

function visualizeGroupNamesDataListings(data) {
    let namesDataListing = $('<datalist id="group_names" >');
    let jqueryDataList = $(`<select name="groupsChoice" id="groupsChoice">`);
    /*   for (let obj of data) {
          groupNames.push(obj.name);
          groupNames.push(obj.id);
      }
      const filteredNames = groupNames.filter((v, i, a) => a.indexOf(v) === i); */
    for (let obj of data) {
        let currName = $(`<option value="${obj.name}">${obj.name}</option>`);
        //  jQuery variable bug
        $(`<option value="${obj.id}">${obj.name}</option>`).appendTo(jqueryDataList);
        currName.appendTo(namesDataListing);
    }
    jqueryDataList.append('</select>')
    groupLists.setJqueryDataList(jqueryDataList);
    namesDataListing.append('</datalist>');
    $('#group_name').append(namesDataListing);
    $('#chooseGroupLabel').after(groupLists.getJqueryDataList());
}

function visualizeClientsDataTable(data) {
    for (let i = 0; i < data.length; i += 1) {
        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        currRow
            .append($('<td>' + `<a href="#" class="client-name" data-toggle="modal" data-target="#ClientsGroupModal">${data[i]['name']}</a>` + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#tBodyClients'));
    }
    $('#tBodyClients').addClass('text-center');
    $('#clients-table > thead').addClass('text-center');
    //DESC order 
    dataTable = $('#clients-table').DataTable({
        stateSave: true,
        "order": [
            [0, "asc"]
        ]
    });

    $('.client-name').on('click', function (ev) {
        const currClient = ev.target.innerText;
        $('#ClientsGroupLongTitle').text(`Клиент: ${currClient}`);

        $.ajax({
            url: `/api/clients-groups/${currClient}`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                updateClientsGroupText(data);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });
};

function updateClientsGroupText(data) {
    $('.modal-body-clients').empty();
    const ul = $('<ul class="list-group">')
    for (let i = 0; i < data.length; i += 1) {
        const erp = data[i].erp_type == 1 ? 'EVN' : data[i].erp_type == 2 ? 'ЧЕЗ' : 'ЕнергоПРО';
        const meteringType = data[i].metering_type == 2 ? 'СТП' : 'Почасови';
        const currItem = $(`<div class="custom-control custom-checkbox my-3">
        <li data-id="${data[i].id}" class="list-group-item mr-auto">ИД: ${data[i].ident_code}, Тип: ${meteringType}, EРП: ${erp}</li>
        <input type="checkbox" class="custom-control-input" id="${data[i].id}">
        <label class="custom-control-label" for="${data[i].id}"></label>
    </div>`)
        currItem.appendTo(ul);
    }
    ul.append('</ul>');
    ul.appendTo('.modal-body-clients');
}

function updateGroupModalText(data) {
    $('.modal-body-groups').empty();
    const ul = $('<ul class="list-group-clients">')
    for (let i = 0; i < data.length; i += 1) {
        const erp = data[i].erp_type == 1 ? 'EVN' : data[i].erp_type == 2 ? 'ЧЕЗ' : 'ЕнергоПРО';
        const meteringType = data[i].metering_type == 2 ? 'СТП' : 'Почасови';
        const currItem = $(`<div class="my-3" data-id="${data[i].id}">
        <li data-id="${data[i].id}" class="list-group-item mr-auto">ИД: ${data[i].ident_code}, Тип: ${meteringType}, EРП: ${erp} <i class="ml-3 fas fa-2x fa-trash-alt"></i></li>
    </div>`)
        currItem.appendTo(ul);
    }
    ul.append('</ul>');
    ul.appendTo('.modal-body-groups');

    $('.fa-trash-alt').on('click', function (ev) {
        const groupClientsID = ev.target.parentElement.parentElement.getAttribute('data-id');
        //  Delete id from group_clients
        $.ajax({
            url: `/api/clients-groups/${groupClientsID}`,
            method: 'DELETE',
            dataType: 'json',
            success: function (data) {
                notification('Успешно изтрит запис!', 'success');
                ev.target.parentElement.parentElement.remove();
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    })

}

function redrawDataTable(data) {
    dataTable.clear().destroy();
    visualizeClientsDataTable(data);
}
(function filterClientsByName() {
    $('#client_name').on('change', () => {
        const clientNameVal = $('#client_name').val();
        const table = $('#clients-table').DataTable();
        table.column(0).search(clientNameVal).draw();
    })
}());

(function filterGroupsByName() {
    $('#group_name').on('change', () => {
        const name = $('#group_name').val();
        const table = $('#groups-table').DataTable();
        table.column(1).search(name).draw();
    })
}());

function validateGroupName() {
    if ($('#group-name').val() == '') {
        notification('Името на групата не може да е празно!', 'error');
        throw 'Невалидно име на група';
    } else {
        return 200;
    }
}