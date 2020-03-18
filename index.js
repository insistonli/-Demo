let tableData = [];
let nowPage = 1;
let allPage = 1;
let pageSize = 4; //每页显示多少
/**
 * @description: 绑定事件
 * @param {*} 
 * @return: 
 */
function bindEvent() {
  let menuList = document.getElementsByClassName("menu")[0];
  let contentBox = document.getElementsByClassName("content-box");
  let studentList = menuList.getElementsByTagName('dd')[0];
  let tbody = document.getElementById('tbody');
  let modal = document.querySelector(".modal");
  let prevBtn = document.getElementById("prevPage");
  let nextBtn = document.getElementById('nextPage');
  let searchBtn = document.getElementsByClassName('search-btn')[0];

  // 导航切换点击事件
  menuList.onclick = function (e) {
    if (e.target.tagName !== "DD") {
      return;
    }
    let actives = document.getElementsByClassName("active");
    for (let i = 0; i < actives.length; i++) {
      actives[i].classList.remove('active');
    }
    e.target.classList.add('active');
    let id = e.target.getAttribute("data-id");
    for (let i = 0; i < contentBox.length; i++) {
      contentBox[i].style.display = "none";
    }
    document.getElementById(id).style.display = "block";
  }
  //分页按钮点击事件
  prevBtn.onclick = function () {
    nowPage--;
    getTableData();
  }
  nextBtn.onclick = function () {
    nowPage++;
    getTableData();
  }
  //搜索栏点击事件
  searchBtn.onclick = function (e) {
    e.preventDefault();
    let searchForm = document.getElementById('search-form');
    let dataList = [];
    let searchvalue = searchForm.search.value;
    transferData('/api/student/searchStudent', {
      sex: -1,
      search: searchvalue,
      page: nowPage,
      size: pageSize
    }, function (data) {
      for (let prop in data.searchList) {
        if (data.searchList[prop].sNo.search(searchvalue) !== -1) {
          dataList.push(data.searchList[prop]);
        }
      }
      //  searchForm.reset();
    });
    alert(`一共查询到${dataList.length}个数据`);
    renderTable(dataList || []);
  }
  //想全部查找出来
  // searchBtn.onclick = function (e) {
  //   e.preventDefault();
  //   let searchForm = document.getElementById('search-form');
  //   let dataList = [];
  //   let searchvalue = searchForm.search.value;
  //   transferData('/api/student/findAll', {}, function (data) {
  //     if (data) {
  //       for (let prop in data) {
  //         if (data[prop].sNo.search(searchvalue) !== -1) {
  //           dataList.push(data[prop]);
  //         }
  //       }
  //     }
  //   })
  //   alert(`一共查询到${dataList.length}个数据`);
  //   renderTable(dataList || []);
  // }


  //表单提交点击事件
  let studentAddBtn = document.getElementById("student-add-btn");
  studentAddBtn.onclick = function (e) {
    //阻止提交按钮后刷新整个页面
    e.preventDefault();
    let formAdd = document.getElementById("student-add-form");
    let data = getFormData(formAdd);
    //判断是否有数据
    if (data) {
      transferData('/api/student/addStudent', data, function () {
        alert('新增成功');
        studentList.click();
        getTableData();
        formAdd.reset();
      })
    }
  }
  //编辑按钮点击事件
  tbody.onclick = function (e) {
    if (e.target.tagName !== 'BUTTON') {
      return;
    }
    let isEidt = e.target.classList.contains('edit');
    let index = e.target.dataset.index;
    if (isEidt) {
      modal.style.display = "block";
      //表单回填
      renderEditForm(tableData[index]);
    } else {
      let isDel = confirm('是否删除?');
      if (isDel) {
        transferData('/api/student/delBySno', {
          sNo: tableData[index].sNo
        }, function () {
          alert('删除成功');
          getTableData();
        })
      }
    }
  }
  //点击遮罩编辑消失
  modal.onclick = () => {
    modal.style.display = 'none';
  }
  //禁止中间表单事件冒泡
  let modalContent = document.getElementsByClassName('modal-content')[0];
  modalContent.onclick = e => {
    e.stopPropagation();
  }
  //编辑按钮提交点击事件
  let editSubmitBtn = document.getElementById('edit-submit-btn');
  editSubmitBtn.onclick = function (e) {
    let form = document.getElementById("student-edit-form");
    let data = getFormData(form);
    if (data) {
      transferData('/api/student/updateStudent', data, function () {
        alert("修改成功");
        modal.style.display = 'none';
        getTableData();
      })
    }

  }
}



/**
 * @description: 获取表单数据
 * @param {} form 目标表单
 */
function getFormData(form) {
  let name = form.name.value;
  let sex = form.sex.value;
  let sNo = form.sNo.value;
  let email = form.email.value;
  let birth = form.birth.value;
  let phone = form.phone.value;
  let address = form.address.value;

  if (!name || !sNo || !email || !birth || !phone || !address) {
    alert("信息填写不全");
    return;
  }
  if (!(/^\d{4,16}$/.test(sNo))) {
    alert("学号应该为4-16位的数字");
    return;
  }
  if (!(/^\w+@\w+\.com$/.test(email))) {
    alert("邮箱格式不正确");
    return;
  }
  if (!(/^\d{4}$/.test(birth))) {
    alert("出生年份格式不正确");
    return;
  }
  if (!(/^\d{11}$/.test(phone))) {
    alert("手机号应该为11位数字");
    return;
  }
  if (!(/[\u4e00-\u9FA5]/.test(address))) {
    alert("地址应该为中文");
    return;
  }
  return {
    name,
    sNo,
    sex,
    email,
    birth,
    phone,
    address
  }
}


/**
 * @description: 获取学生列表数据
 * @param {} 
 * @return: 学生列表数据
 */
function getTableData() {
  transferData('/api/student/findByPage', {
    page: nowPage,
    size: pageSize
  }, function (data) {
    allPage = Math.ceil(data.cont / pageSize); //向上取整
    tableData = data.findByPage;
    renderTable(tableData || []);
  })
}

/**
 * @description: 渲染学生列表表单数据
 * @param {type} 
 * @return: 
 */
function renderTable(data) {
  let str = '';
  data.forEach((item, index) => {
    str += `<tr>
    <td>${item.sNo}</td>
    <td>${item.name}</td>
    <td>${item.sex == 0 ? '男' : '女'}</td>
    <td>${item.email}</td>
    <td>${new Date().getFullYear() - item.birth}</td>
    <td>${item.phone}</td>
    <td>${item.address}</td>
    <td>
      <button class="btn edit" data-index="${index}">编辑</button>
      <button class="btn del" data-index = "${index}">删除</button>
    </td>
  </tr>`
  });
  let prevBtn = document.getElementById("prevPage");
  let nextBtn = document.getElementById('nextPage');
  if (nowPage < allPage) {
    nextBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'none';
  }
  if (nowPage > 1) {
    prevBtn.style.display = 'inline-block';
  } else {
    prevBtn.style.display = 'none';
  }
  document.getElementById('tbody').innerHTML = str;
}

/**
 * @description: 编辑表单的回填
 * @param {type} 
 * @return: 
 */
function renderEditForm(data) {
  let editForm = document.getElementById("student-edit-form");
  for (let prop in data) {
    if (editForm[prop]) {
      editForm[prop].value = data[prop];
    }
  }
}



//降低跟后台请求数据的冗余
function transferData(url, data, func) {
  let res = saveData("http://open.duyiedu.com" + url, Object.assign({
    appkey: 'coderljp_1581060918858'
  }, data));
  if (res.status == 'fail') {
    alert(res.msg);
  } else(
    func(res.data)
  )
}

bindEvent();
//抓取数据渲染页面
getTableData();




// 向后端存储数据
function saveData(url, param) {
  var result = null;
  var xhr = null;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject('Microsoft.XMLHTTP');
  }
  if (typeof param == 'string') {
    xhr.open('GET', url + '?' + param, false);
  } else if (typeof param == 'object') {
    var str = "";
    for (var prop in param) {
      str += prop + '=' + param[prop] + '&';
    }
    xhr.open('GET', url + '?' + str, false);
  } else {
    xhr.open('GET', url + '?' + param.toString(), false);
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        result = JSON.parse(xhr.responseText);
      }
    }
  }
  xhr.send();
  return result;
}