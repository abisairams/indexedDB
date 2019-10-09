/*!
 * rms-idb indexedDB Library v1.0.1 
 * http://opensource.com/idb
 * Copyright 2011-2016 RMS-Corp.
 * Licensed under the MIT license
 */

class Idb {
  constructor() {
    if (typeof indexedDB == 'undefined') {
      throw Error ('indexedDB API not supported');
    }
    this.native = window.indexedDB;
  }
  open(name, version, callback) {
    var temp = indexedDB.open(name, version);
    temp.onupgradeneeded = function (e) {
      if (callback) {
        callback(e);
      }
    }
    return temp;
  }
  createTable(db, table, settings) {
    if(!db.objectStoreNames.contains(table)) {
      db.createObjectStore(table, settings);
    }
  }
  doTransaction(db, table, mode) {
    var transaction = db.transaction([table], mode)
    .objectStore(table);
    return transaction;
  }
  add(db, table, data) {
    var transaction = this.doTransaction(db, table, 'readwrite');
    var add = transaction.add(data);
    return add;
  }
  read(db, table, key) {
    var transaction = this.doTransaction(db, table, 'readonly');
    return transaction.get(key);
  }
  readAll(db, table) {
    var transaction = this.doTransaction(db, table, 'readonly');
    return transaction.getAll();
  }
  remove(db, table, key) {
    var transaction = this.doTransaction(db, table, 'readwrite');
    return transaction.delete(key);
  }
  removeObjectStore(request, objectStore) {
    return request.result.deleteObjectStore(objectStore);
  }
  update(db, table, key, data) {
    var promise = new Promise(function(resolve, reject) {
      var transaction = Idb.prototype.doTransaction(db, table, 'readwrite');
      var get = transaction.get(key)
      .onsuccess = function (e) {
        var reg = e.target.result;
        for (var cell in reg) {
          if (reg.hasOwnProperty(cell)) {
            if (data.hasOwnProperty(cell)) {
              reg[cell] = data[cell];
            }
          }
        }
        var update = transaction.put(reg)
        .onsuccess = function (e) {
          resolve(e);
        }
      }
    });
    return promise;
  }
}