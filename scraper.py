#!/usr/bin/python3

import os
import re
import bs4
import requests
import sqlite3

cs = requests.get("https://courselist.wm.edu/courselist/")
if cs.status_code != 200:
    print("Course List", cs.status_code)
    os.exit(1)

csp = bs4.BeautifulSoup(cs.text, 'lxml')


def selectvalues(select):
    vals = []
    for opt in select.children:
        if isinstance(opt, bs4.element.Tag):
            v = opt['value']
            if v != '0':
                vals.append(opt['value'])
    return vals

terms = selectvalues(csp.find(id='term_code'))
subjs = selectvalues(csp.find(id='term_subj'))

def parsetable(c, table):
    pass

#for term in terms[:1]:
term = terms[2]
db = sqlite3.connect(term+'.db')
c = db.cursor()
# CRN int
# coll 0 = none, 100, 150, 200, 30D, 30G, 30C etc.
# TODO Multiple COLL attributes
c.execute('''
        CREATE TABLE IF NOT EXISTS courses
        (
        CRN int,
        ID  text,
        Attr text,
        COLL text,
        Title text,
        Instr text,
        credits int,
        days text,
        start int,
        end int,
        enrolled int,
        seats int,
        status int
        )
        ''')


ATTRS = ['CSI', 'NQR', 'ALV']


coll = re.compile(r'C\d{2}.')
def parserow(row, c):
    course = ["" for i in range(13)]
    course[0] = row[0].a.string
    course[1] = row[1].string.strip()
    attr = row[2].string.split(',')
    if not isinstance(attr, list):
        attr = [attr]
    for item in attr:
        if item in ATTRS:
            course[2] = item
        match = coll.search(item)
        if match:
            course[3] = item[1:]

    course[4] = row[3].string.strip()
    print(course[4])
    fl = row[4].string.split(',')
    if len(fl) == 1:
        course[5] = fl[0].strip()
    else:
        course[5] = fl[1].strip()+" "+fl[0].strip()
    course[6] = row[5].string
    dt = row[6].string.split(":")
    if len(dt) == 2:
        course[7] = dt[0]
        se = dt[1].split('-')
        course[8] = se[0]
        course[9] = se[1]
    # row[7] is projected
    course[10] = row[8].string
    course[11] = row[9].string
    if course[11].endswith('*'):
        course[11] = course[11][:-1]
    if row[10].string == "OPEN":
        course[12] = 1
    else:
        course[12] = 0
    v = " ?,"*len(course)
    v = v[:-1]
    sql = "INSERT INTO courses VALUES ("+v+")"
    c.execute(sql, course)

for subj in subjs:
    r = requests.get("https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code="+term+"&term_subj="+subj+"&attr=0&attr2=0&levl=0&status=0&ptrm=0&search=Search")
    if r.status_code != 200:
        print(term_code, subj, r.status_code)
        os.exit(2)
    parse = bs4.BeautifulSoup(r.text, 'lxml')
    t = parse.find('table')
    rowsize = 11
    row = []
    i = 0
    for data in t.find_all('td'):
        if i == rowsize:
            parserow(row, c)
            row = []
            i = 0
            pass
        row.append(data)
        i += 1
db.commit()
db.close()
