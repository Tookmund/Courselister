var db = null;

var xhr = new XMLHttpRequest();
xhr.open('GET', '202010.db', true);
xhr.responseType = 'arraybuffer';

xhr.onload = function(e) {
  var uInt8Array = new Uint8Array(this.response);
  db = new SQL.Database(uInt8Array);
};
xhr.send();
console.log('begin');
