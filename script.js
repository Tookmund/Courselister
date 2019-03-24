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

function getdb(name) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', name+'.db', true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
		var uInt8Array = new Uint8Array(this.response);
		db = new SQL.Database(uInt8Array);
		var s = document.getElementById("search");
		var inps = s.getElementsByTagName("input");
		for (i in inps) {
			if (inps[i].type == 'text') {
				autocomp(inps[i].id);
			}
		}
		console.log(name);
	};
	xhr.send();
}


var termreq = new XMLHttpRequest();
var termselem = document.getElementById('term');
termreq.open('GET', 'terms.json', true);
termreq.responseType = 'json';
var termdict = null;
termreq.onload = function(e) {
	termdict = this.response;
	var hstr = "<p>Last Updated: "+termdict['updated']+"</p><select>";
	for (const [value, name] of Object.entries(termdict)) {
		if (value != 'updated') {
			hstr += '<option value='+value+'>'+name+'</option>';
		}
	}
	hstr += "</select>";
	hstr += "<div class='submit'><input type='submit' value='Load Term' /></div>";
	termselem.innerHTML = hstr;
};
termreq.send();


termselem.addEventListener('submit', function (e) {
	e.preventDefault();
	var v = termselem.getElementsByTagName('select')[0];
	getdb(v.value);
	document.getElementById('termname').innerHTML = termdict[v.value];
});


document.getElementById("search").addEventListener('submit', function (e) {
	e.preventDefault();
	var searchql = "SELECT * FROM courses WHERE ";
	var search = document.getElementById('search');
	var inps = search.getElementsByTagName('input');
	var terms = 0;
	for (i in inps) {
		if (inps[i].type == 'checkbox') {
			continue;
		}
		if (inps[i].type == 'text' && inps[i].value != '') {
			if (terms > 0) {
				searchql += " AND "
			}
			if (inps[i].id == 'Start') {
				searchql += inps[i].id +' >= '+inps[i].value;
			} else if (inps[i].id == 'End') {
				searchql += inps[i].id +' <= '+inps[i].value;
			} else {
				searchql += inps[i].id+" LIKE '%"+inps[i].value+"%'";
			}
			terms++;
		}
	}
	var days = document.getElementById('Days').getElementsByTagName('input');
	dstr = "";
	for (d in days) {
		if (days[d].type == 'checkbox') {
			if (days[d].checked) {
				dstr += '%'+days[d].value;
			}
		}
	}
	if (dstr != "") {
		if (terms > 0) {
			searchql += " AND ";
		}
		searchql += "Days LIKE '"+dstr+"%'";
		terms++;
	}
	var oc = document.getElementById('Status');
	if (oc.value != '') {
		if (terms > 0) {
				searchql += " AND "
		}
		searchql += oc.id+" LIKE "+oc.value;
	}
	if (terms == 0) {
		searchql = searchql.slice(0, -7);
	}
	getresults(searchql);

	for (i in inps) {
		if (inps[i].type == 'checkbox') {
			inps[i].checked = false;
		}
		if (inps[i].type == 'text' && inps[i].value != '') {
			inps[i].value = '';
		}
	}

}, false);

var lastSearch = '';
var orderbyql = '';
function getresults(searchql) {
	lastSearch = searchql;
	searchql += ' '+orderbyql;
	console.log(searchql);
	var results = document.getElementById('results');
	var r = db.exec(searchql);
	if (r.length == 0) {
		results.innerHTML = "NO RESULTS";
		results.scrollIntoView();
		return;
	}
	var d = r[0];
	results.innerHTML = '';
	var fin = '<table><tr>';
	for (c in d.columns) {
		fin += '<th><a href="javascript:orderBy(';
		fin += "'"+d.columns[c]+"'";
		fin += ')">'+d.columns[c]+"</a></th>";
	}
	fin += '</tr>';
	for (c in d.values) {
		fin += '<tr>';
		var url = null;
		for (row in d.values[c]) {
			if (d.columns[row] == 'CRN') {
				var fterm = termselem.getElementsByTagName('select')[0].value;
				url = "https://courselist.wm.edu/courselist/courseinfo/addInfo?fterm="+fterm+"&fcrn="+d.values[c][row];
			}
			if (d.columns[row] == 'Title') {
				fin += "<td><a href='"+url+"' target='_blank'>"+d.values[c][row]+"</a></td>";
			}
			else if (d.columns[row] == 'Status') {
				fin += "<td>";
				if (d.values[c][row] == '1') {
					fin += "Open";
				}
				else {
					fin += "Closed";
				}
				fin += "</td>";
			}
			else {
				fin += '<td>'+d.values[c][row]+'</td>';
			}
		}
		fin += '</tr>';
	}
	fin += '</table>';
	results.innerHTML = fin;
	results.scrollIntoView();
}

function orderBy(id) {
	orderbyql = "ORDER BY "+id;
	getresults(lastSearch);
}
