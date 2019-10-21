const exportDBLnk = document.getElementById('export-db');
const importDBLnk = document.getElementById('import-db');
const optionsBtn  = document.getElementById('options');
const modalOpt    = document.getElementById('modal-options');

function toggleModal(e) {
  if (modalOpt.className == 'modal fade-out') {
    if (e.target == optionsBtn || e.target == optionsBtn.children[0]) {
      modalOpt.className = 'modal fade-in';
    }
  } else {
    modalOpt.className = 'modal fade-out';
  }
}

function exportDB(e) {
  var dbs = idb.readAll(db, 'users');
  dbs.onsuccess = function (e) {
    var dbsToJson = JSON.stringify(e.target.result);
    var data = new Blob([dbsToJson]);
    var url = window.URL.createObjectURL(data);
    exportDBLnk.href = url;
    exportDBLnk.setAttribute('download', `DB-${url.slice(-5)}.JSON`);
  }
}

function validate(e) {
  var fileDB = e.target.files[0];
  if (fileDB.type !== 'application/json') {
    alert('Se necesita un archivo json')
    return;
  }
  readFile(fileDB, function (res) {
    var database = JSON.parse(res);
      importDB(database);
  });
}
function readFile(file, callback) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function (e) {
    callback(e.target.result);
  }
}
function importDB(data) {
  var errors = {
    counter: 0,
    message: ''
  }
  var success = {
    counter: 0,
    message: ''
  }
  data.map(function (reg) {
    var add = idb.add(db, 'users', reg);
    add.onsuccess = function (e) {
      success.counter += 1;
      success.message = e.target.result;
      if (success.counter == data.length) {
        notification(`Todos los registros fueros agregados`, 'info', 6000);
      } else if(success.counter + errors.counter == data.length && errors.counter > 0) {
        notification(`${success.counter} se agregaron a la base de datos los demas ya existen`, 'info', 6000);
      }

    }
    add.onerror = function (e) {
      errors.counter += 1;
      errors.message = e.target.error.message;
      if (errors.counter == data.length) {
        notification('Ningun registro fue agregado porque ya existen en la base de datos', 'warn', 6000);
      } else if(success.counter + errors.counter == data.length && errors.counter > 0) {
        notification(`${errors.counter} no se agregaron porque ya existen en la base datos`, 'warn', 6000);
      }
    }
  })
}

exportDBLnk.addEventListener('mouseover', exportDB, false);
importDBLnk.addEventListener('change', validate, false);
document.addEventListener('click', toggleModal, false);