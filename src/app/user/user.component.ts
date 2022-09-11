import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { ajax } from 'jquery';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import 'DataTables.net';
//import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  modalRef!: BsModalRef;
  constructor(public modalService: BsModalService) {}

  openModal(template: TemplateRef<any>) {
    console.log(template);
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered',
    });
  }

  ngOnInit(): void {
    loadTable();
  }

  addRow() {
    if (
      $('#inName').val() == '' ||
      $('#inLastName').val() == '' ||
      $('#inBirth').val() == '' ||
      $('#inAge').val() == '' ||
      $('#inSex').val() == 'กรุณาเลือกเพศ'
    ) {
      //toastr.error('โปรดกรอกข้อมูลให้ครบถ้วน');
      console.log('alert');
    } else {
      var today = new Date();
      let formattedDate =
        String(today.getDate()).padStart(2, '0') +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        (today.getFullYear() + 543);
      var birthD = String($('#inBirth').val());
      const str = birthD.split('-');
      var formatBirth = str[0] + '-' + str[1] + '-' + (Number(str[2]) + 543); // DD-MM-YYYY(พ.ศ.)
      // mode add
      if ($('#donebtn').data('mode') != 'edit') {
        var jsonObj = new Object();
        jsonObj = {
          userName: $('#inName').val(),
          userLastName: $('#inLastName').val(),
          userFullName: $('#inName').val() + ' ' + $('#inLastName').val(),
          userBirth: $('#inBirth').val(),
          userFormatBirth: formatBirth,
          userAge: $('#inAge').val(),
          userSex: $('#inSex').val(),
          userDate: formattedDate, //today
        };
        console.log(jsonObj);
        callAjaxManowService('/manowctrl/insertUser', jsonObj, 'POST');
        loadTable();
        //toastr.success('เพิ่มข้อมูลสำเร็จ');
      }

      // mode edit
      else {
        var index = $("#donebtn").data("index");
        var table = $('#tbdDemo').DataTable();
        var rowData = table.row( index ).data();
        //UPDATE ROW
        var newData = new Object();

        newData = {
          userCode : rowData.userCode,
          userName : $("#inName").val(),
          userLastName : $("#inLastName").val(),
          userFullName : $("#inName").val() + " " + $("#inLastName").val(),
          userBirth : $("#inBirth").val(),
          userFormatBirth : formatBirth,
          userAge : $("#inAge").val(),
          userSex : $("#inSex").val(),
          userDate : formattedDate,
        };
        
        callAjaxManowService("/manowctrl/updateUserById", newData, "PUT");
        loadTable();
        //Clear mode
        $("#donebtn").data("mode","");
        // toastr.success('แก้ไขข้อมูลสำเร็จ');
      }

      // close modal & clear form after done
      this.modalRef.hide();
      clearForm();
    }
  }

  loadTable() {
    $('#myInput').val('');
    var result = callAjaxManowService('/manowctrl/getAllUser', '', 'GET');
    tbdDemoDataTable(result);
    $('#searchbtn').data('mode', '');
  }

  search() {
    $('#searchbtn').data('mode', 'search');
    //console.log($("#searchbtn").data("mode") +"<<search");
    var input = $('#myInput').val();
    var url = '/manowctrl/searchUserByName?NAME=' + input;
    var result = callAjaxManowService(url, '', 'GET');
    tbdDemoDataTable(result);
  }

  calAge() {
    var date = $('#inBirth').val();
    console.log(date);
    var birthday = +new Date(String(date)); // ทำให้วันเดือนปีกลายเป็นตัวเลข
    var age = Math.floor((Date.now() - birthday) / 31557600000); // 1 year = 31,557,600,000 ms
    $('#inAge').val(age);
  }
}

$(document).on('click', '.openModalBtn', function () {
  console.log('click');
  //openModal();

  // var rowData = table.row( index ).data();
});

function openModal() {
  console.log('function');
  $('#demoModal').modal('show');
}
function loadTable() {
  const result = callAjaxManowService('/manowctrl/getAllUser', '', 'GET');
  tbdDemoDataTable(result);
}

function callAjaxManowService(uri: string, json: any, type: string) {
  uri = 'http://localhost:8778' + uri;
  var result;
  ajax({
    url: uri,
    type: type,
    contentType: 'application/json;charset=utf-8',
    data: JSON.stringify(json),
    async: false,
    success: function (data, _textStatus, _jqXHR) {
      result = data;
    },
    error: function (jqXHR, _status, _error) {
      console.error(jqXHR);
      result = {};
    },
  });

  return result;
}

function tbdDemoDataTable(data: any) {
  var table = $('#tbdDemo').DataTable({
    destroy: true,
    searching: false,
    paging: true,
    autoWidth: false,
    responsive: true,
    ordering: false,
    data: data,
    columns: [
      {
        //class: "lb-txt-center",
        render: function (data, type, row, meta) {
          return Number(meta.row) + 1;
        },
      },
      {
        data: 'userCode',
        //class : "lb-txt-center",
      },
      {
        data: 'userFullName',
        //class : "lb-txt-center",
        render: function (data, type, row, meta) {
          var fullName: any = row.userName + ' ' + row.userLastName;
          return fullName;
        },
      },
      {
        data: 'userFormatBirth',
        //class : "lb-txt-center",
        render: function (data, type, row, meta) {
          if ($('#searchbtn').data('mode') != 'search') {
            var date = formatDate(row.userBirth);
          } else {
            var date = formatSearch(new Date(row.userBirth));
          }
          return date;
        },
      },
      {
        data: 'userAge',
        //class : "lb-txt-center",
      },
      {
        data: 'userSex',
        //class : "lb-txt-center",
      },
      {
        data: 'userDate',
        //class : "lb-txt-center",
        render: function (data, type, row, meta) {
          if ($('#searchbtn').data('mode') != 'search') {
            var date = formatDate(row.updatedDate);
          } else {
            var date = formatSearch(new Date(row.updatedDate));
          }
          return date;
        },
      },
      {
        data: 'userName',
        //class : "lb-txt-center",
      },
      {
        width: '15%',
        data: 'userID',
        defaultContent: '',
        //class : "lb-txt-center",
        render: function (data, type, row, meta) {
          return (
            '<button type="button" class="btn btn-info editBtn" data-editindex="'+meta.row +'" style="margin:10px;padding:5px 10px" id="editbtn">แก้ไข</button> <button type="button" class="btn btn-danger deleteBtn" data-deleteindex="' +
            meta.row +
            '" style="padding:5px 15px">ลบ</button>'
          );
        },
      },
    ],
  });

  table
    .on('order.dt search.dt', function () {
      table
        .column(0, {
          search: 'applied',
          order: 'applied',
        })
        .nodes()
        .each(function (cell: any, i) {
          cell.innerHTML = i + 1; // รีวาดเฉพาะช่องนั้นใหม่
        });
    })
    .draw();

  $(document).on('click', '.editBtn', function () {
    //console.log('edit');
    var index = $(this).data('editindex');
    //console.log(index);
    // เรียกปุ่ม id addbtn
    document.getElementById('addbtn')?.click();

    $('#donebtn').data('mode', 'edit');
    $('#donebtn').data('index', index);
    // console.log($("#donebtn").data("index"));
    //console.log($("#searchbtn").data("mode"));
    var table = $('#tbdDemo').DataTable();
    var rowData = table.row(index).data();
    //console.log("editRow>>",rowData.userBirth);
    //console.log(new Date(rowData.userBirth));
    var userBirth = formatSearch(new Date(rowData.userBirth));
    //console.log(userBirth)
    //console.log(rowData);
    $('#inName').val(rowData.userName);
    $('#inLastName').val(rowData.userLastName);
    if ($('#searchbtn').data('mode') != 'search') {
      $('#inBirth').val(rowData.userBirth);
    } else {
      var user = formatSearchEdit(new Date(rowData.userBirth));

      $('#inBirth').val(user);
    }
    $('#inAge').val(rowData.userAge);
    $('#inSex').val(rowData.userSex);
  });

  $(document).on('click', '.deleteBtn', function () {
    //console.log('delete');
    var index = $(this).data('deleteindex');
    //console.log(index)
    deleteRow(index);
  });
}

function deleteRow(index: any) {
  if (confirm('คุณต้องการลบข้อมูลใช่หรือไม่')) {
    var table = $('#tbdDemo').DataTable();
    var rowData = table.row(index).data();
    //console.log(rowData)
    callAjaxManowService(
      '/manowctrl/deleteUserById',
      rowData.userCode,
      'DELETE'
    );
    loadTable();
    //toastr.success('ลบข้อมูลสำเร็จ');
  }
}

function formatDate(date: any) {
  var fDate = date;
  const str = fDate.split('-');
  var format = str[2] + '-' + str[1] + '-' + (Number(str[0]) + 543);
  return format;
}

function formatSearch(date: Date) {
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  return (
    '' +
    (day <= 9 ? '0' + day : day) +
    '-' +
    (month <= 9 ? '0' + month : month) +
    '-' +
    (year + 543)
  );
}

function formatSearchEdit(date: any) {
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return (
    '' +
    year +
    '-' +
    (month <= 9 ? '0' + month : month) +
    '-' +
    (day <= 9 ? '0' + day : day)
  );
}

function clearForm() {
  $('#inName').val('');
  $('#inLastName').val('');
  $('#inBirth').val('');
  $('#inAge').val('');
  $('#inSex').val('กรุณาเลือกเพศ');
}
