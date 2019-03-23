var db = null;

function getvals(v) {
	arr = [];
	for (let a of v[0].values) {
		arr.push(a[0]);
	}
	//console.log(arr);
	return arr;
}

function autocomp(sql, id) {
	var query = db.exec(sql);
	return new Awesomplete(document.getElementById(id), {
		list: getvals(query)
	});
}

var xhr = new XMLHttpRequest();
xhr.open('GET', '202010.db', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {
	var uInt8Array = new Uint8Array(this.response);
	db = new SQL.Database(uInt8Array);
	var titles = db.exec("SELECT DISTINCT Title FROM courses");
	new Awesomplete(document.getElementById('title'), {
		list: getvals(titles)
	});
	autocomp("SELECT DISTINCT InstL FROM courses", 'instr');
	autocomp("SELECT DISTINCT days FROM courses", 'day');
	autocomp("SELECT DISTINCT time FROM courses", 'time');
};
xhr.send();
console.log('begin');

function search() {
	console.log("SEARCH");
	var title = document.getElementById('title').value;
	title = '%'+title+'%';
	console.log(title);
	var r = db.exec("SELECT * FROM courses WHERE Title LIKE ?", title);
	console.log(r);
}
