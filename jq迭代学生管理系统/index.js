var nowPage = 1;
var pageSize = 10;
var allPage = 1;
var tableData = [];
// 绑定事件
function bindEvent() {
    $('.menu').on('click', 'dd', function (e) {
        $('.active').removeClass('active');
        $(this).addClass('active');
        var id = $(this).data('id');
        $('.content-box').fadeOut()
        $('#' + id).fadeIn();
    });
    $('#student-add-btn').click(function (e) {
        e.preventDefault();
        var formData = formatData($('#student-add-form').serializeArray());
        // 拿取用户填写的学生信息
        var data = formData.data;
        if (formData.status == 'success') {
            // 把数据传给后台进行保存处理
            transferData('/api/student/addStudent', data, function () {
                alert('新增学生成功');
                $('.menu dd[data-id=student-list]').click();
                getTableData();
            })
        }
    });
    $('#tbody').on('click', '.edit', function () {
        var index = $(this).parents('tr').index();
        var data = tableData[index];
        $('.modal').slideDown()
        renderEditForm(data);
    }).on('click', '.delete', function () {
        var index = $(this).parents('tr').index();
        var isDel = confirm('确认删除');
        if (isDel) {
            transferData('/api/student/delBySno', {
                sNo: tableData[index].sNo
            }, function () {
                alert('删除成功');
                var val = $('#search-inp').val();
                if (val) {
                    nowPage = 1;
                    searchTableData(val)
                } else {
                    getTableData();
                }
            });
        }
    });
    $('#student-edit-btn').click(function (e) {
        e.preventDefault();
        var formData = formatData($('#student-edit-form').serializeArray());
        if (formData.status == 'success') {
            // 更新数据
            transferData('/api/student/updateStudent', formData.data, function () {
                alert('修改成功');
                $('.modal').slideUp();
                var val = $('#search-inp').val();
                if (val) {
                    searchTableData(val)
                } else {
                    getTableData();
                }
            })
        } else {
            alert(formData.msg)
        }
    });
    $('.modal').click(function (e) {
        if (e.target == this) {
            $(this).slideUp()
        }
        // $(this).slideUp()
    });
    // $('.modal-content').click(function (e) {
    //     e.stopPropagation()
    // })

    $('#search-btn').click(function () {
        clearTimeout(timer)
        var val = $('#search-inp').val();
        if (val) {
            nowPage = 1;
            searchTableData(val)
        } else {
            getTableData();
        }
    });
    var timer = null;
    $('#search-inp').on('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            $('#search-btn').click();
        }, 500)
    })
}
// 获取搜索的表格数据
function searchTableData(val) {
    transferData('/api/student/searchStudent', {
        sex: $('#search-form')[0].sex.value,
        search: val,
        page: nowPage,
        size: pageSize
    }, function (data) {
        console.log(data);
        tableData = data.searchList;
        allPage = Math.ceil(data.cont / pageSize);
        renderDom(tableData);
    })
}
// 格式化表格数据 校验数据是否填写全
function formatData(dataArr) {
    var result = {
        status: 'success',
        data: {},
        msg: ''
    };
    for (var i = 0; i < dataArr.length; i++) {
        if (!dataArr[i].value) {
            result.status = 'fail';
            result.msg = '信息填写不完全';
        }
        result.data[dataArr[i].name] = dataArr[i].value;
    }
    return result;
}

// 获取学生列表数据
function getTableData() {
    transferData('/api/student/findByPage', {
        page: nowPage,
        size: pageSize
    }, function (data) {
        tableData = data.findByPage;
        allPage = Math.ceil(data.cont / pageSize);
        renderDom(data.findByPage);
    })
}

// 数据请求
function transferData(url, data, cb) {
    $.ajax({
        url: 'http://open.duyiedu.com' + url,
        type: 'get',
        data: $.extend({
            appkey: 'qiqiqi_1569759019786'
        }, data),
        dataType: 'json',
        success: function (res) {
            if (res.status == 'success') {
                cb(res.data);
            } else {
                alert(res.msg);
            }
        }
    })
}

// 渲染表格数据
function renderDom(data) {
    var str = '';
    data.forEach(function (item, index) {
        str += `<tr>
        <td>${item.sNo}</td>
        <td>${item.name}</td>
        <td>${item.sex == 0 ? '男': '女'}</td>
        <td>${item.email}</td>
        <td>${new Date().getFullYear() - item.birth}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>
            <button class="btn edit">编辑</button>
            <button class="btn delete">删除</button>
        </td>
    </tr>`;
    });
    $('#tbody').html(str);
    $('.turn-page').page({
        nowPage: nowPage,
        allPage: allPage,
        changePage: function (page) {
            nowPage = page;
            var val = $('#search-inp').val();
            if (val) {
                searchTableData(val);
            } else {
                getTableData();
            }
            
        }
    })
}

// 编辑表单回填
function renderEditForm(data) {
    var form = $('#student-edit-form')[0];
    for(var prop in data) {
        if (form[prop]) {
            form[prop].value = data[prop]
        }
    }
}
bindEvent();
getTableData();