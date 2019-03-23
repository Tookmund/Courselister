var db = null;
var acompsql = null;

function getvals(v) {
	arr = [];
	if (!v || v.length == 0) {
		return arr;
	}
	for (let a of v[0].values) {
		arr.push(a[0]);
	}
	return arr;
}

var xhr = new XMLHttpRequest();
xhr.open('GET', '202010.db', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {
	var uInt8Array = new Uint8Array(this.response);
	db = new SQL.Database(uInt8Array);
	autocomp("Title", 'title');
	autocomp("InstL", 'instr');
	autocomp("days", 'day');
	autocomp("time", 'time');
};
xhr.send();
console.log('begin');

function coursesearch() {
	console.log("SEARCH");
	var title = document.getElementById('title').value;
	title = '%'+title+'%';
	console.log(title);
	var r = db.exec("SELECT * FROM courses WHERE Title LIKE ?", title);
	console.log(r);
}
