var db = null;

function getvals(v) {
	return Array.from(v[0].values);
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
	var titles = db.exec("SELECT Title FROM courses");
	new Awesomplete(document.getElementById('title'), {
		list: getvals(titles)
	});
	autocomp("SELECT DISTINCT InstF,InstL FROM courses", 'instr');
};
xhr.send();
console.log('begin');
