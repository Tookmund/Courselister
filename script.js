var db = null;

var xhr = new XMLHttpRequest();
xhr.open('GET', '202010.sqlite', true);
xhr.responseType = 'arraybuffer';

xhr.onload = function(e) {
  var uInt8Array = new Uint8Array(this.response);
  db = new SQL.Database(uInt8Array);
  alert("LOADED");
  console.log(db.exec("SELECT * from courses LIMIT 1"));
};
xhr.send();
console.log('begin');
