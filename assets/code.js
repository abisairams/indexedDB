const form = document.register;
const list = document.getElementById('list');

function error (e) {
  var error = e.target.error
  notification(`Error: ${error.message}`, 'warn', 10000);
}

// Notifications
function notification(message, type, time) {
  const container = document.getElementById('message-container');
  const box = document.createElement('div');
  const content = document.createElement('span');

  box.setAttribute('class', `message show ${type}`);
  content.setAttribute('class', 'content');
  content.textContent = message;

  box.appendChild(content);
  container.appendChild(box);
  window.setTimeout(function () {
    if (container.childElementCount > 0) {
      container.removeChild(box);
    }
  },time)
  box.onclick = function () {
    this.parentNode.removeChild(this);
  };
}

// DB requests;
const idb = new Idb();
var request = idb.open('MyDB', 2, function (e) {
  if(e)
    db = e.target.result;
    if (!db.objectStoreNames.contains('users')) {
      db.createObjectStore('users', {keyPath: 'id', unique: true, autoIncrement: true});
      db.onsuccess = function () {
        notification('DB created', 'info', 2000);
      }
      db.onerror = error;
    }
});
request.onerror = error;
request.onsuccess = function (e) {
  db = e.target.result;
  setTimeout( e => { notification('App ready to use'.toUpperCase(), 'info', 5000)}, 200);
  setTimeout( e => { displayData()}, 100);
}

function displayData() {
  var transaction = idb.readAll(db, 'users');
  transaction.onsuccess = function (e) {
    var result = e.target.result;
    result.map( function (res) {
      displayNewData(res);
    })
  }
  transaction.onerror = error;
}
function displayNewData(data) {
  var button = document.createElement('button');
  var tr = document.createElement('tr');
  var td = [];
  for (var i = 0; i < 4; i++) {
    td[i] = document.createElement('td');
  }
  var editable = [td[1],td[2]];
  button.setAttribute('id', data.id);
  button.textContent = 'Delete';
  tr.setAttribute('id', data.id);
  td[0].textContent = data.id;
  td[1].textContent = data.name;
  td[2].textContent = data.email;
  editable.map(function (x) {
    x.addEventListener('click', function () {
      this.setAttribute('contenteditable', true);
    }, false);
  });
  editable[0].addEventListener('blur', function () {
    var data = {id: parseInt(this.parentNode.id), name: this.textContent, email: editable[1].textContent};
    var transaction = idb.update(db, 'users', data.id, data);
    transaction.then(e => {
      notification('User updated.', 'info', 5000);
    })
    transaction.onerror = error;
  }, false);
  editable[1].addEventListener('blur', function () {
    var data = {id: parseInt(this.parentNode.id), name: editable[0].textContent, email: this.textContent};
    var transaction = idb.update(db, 'users', data.id, data);
    transaction.then(e => {
      notification('User updated.', 'info', 5000);
    })
    transaction.onerror = error;
  }, false);

  td[3].appendChild(button);
  tr.appendChild(td[0]);
  tr.appendChild(td[1]);
  tr.appendChild(td[2]);
  tr.appendChild(td[3]);
  list.appendChild(tr);

  button.onclick = function () {
    var tr = this.parentNode.parentNode.parentNode;
    var target = this.parentNode.parentNode;
    if (confirm('Are u sure?')) {
      var del = idb.remove(db, 'users', parseInt(data.id));
      del.onsuccess = function (e) {
        notification('User has been deleted', 'warn', 5000);
        tr.removeChild(target);
      }  
    }   
  };
}
function validate(e) {
  e.preventDefault();
  var username = form.username;
  var email = form.useremail;
  if (username.value == '' || email.value == '') {
    notification('All inputs are required', 'warn', 10000);
    username.focus();
    return;
  } else {
    var add = idb.add(db, 'users', {name: username.value, email: email.value});
    add.onsuccess = function (e) {
      var id = e.target.result;
      var transaction = idb.read(db, 'users', id);
      transaction.onsuccess = function (e) {
        notification('User has been registered.', 'info', 5000);
        displayNewData(e.target.result);
      }
      transaction.onerror = error;
    }
    add.onerror = error;

    username.value = '';
    email.value = '';
    username.focus();
  }
}
form.addEventListener('submit', validate, false);
