#!/usr/bin/python3
import sys
import os
import re
import bs4
import requests
import sqlite3
import json
from datetime import datetime

cs = requests.get("https://courselist.wm.edu/courselist/")
if cs.status_code != 200:
    print("Course List", cs.status_code)
    sys.exit(1)

csp = bs4.BeautifulSoup(cs.text, 'lxml')


def selectvalues(select):
    vals = []
    for opt in select.children:
        if isinstance(opt, bs4.element.Tag):
            v = opt['value']
            if v != '0':
                vals.append(opt['value'])
    return vals

tc = csp.find(id='term_code')
termdict = {}
termdict['updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
terms = []
for opt in tc.children:
    if isinstance(opt, bs4.element.Tag):
        termdict[opt['value']] = opt.string.strip()
        terms.append(opt['value'])
with open("terms.json", 'w') as f:
    json.dump(termdict, f)

subjs = []
subjc = csp.find(id='term_subj')
subjdict = {}
for opt in subjc.children:
    if isinstance(opt, bs4.element.Tag):
        v = opt['value']
        if v != '0':
            subjdict[opt['value']] = opt.string.strip()
            subjs.append(opt['value'])

coll = re.compile(r'C\d{2}.')
def parserow(row, c):
    course = ["" for i in range(14)]
    course[0] = row[0].a.string
    row[1] = row[1].string.strip()
    ident = row[1].split(" ")
    course[1] = subjdict[ident[0]]
    course[2] = row[1]
    attr = row[2].string.split(',')
    if not isinstance(attr, list):
        attr = [attr]
    for item in attr:
        match = coll.findall(item)
        if len(match) > 0:
            course[4] += match[0].strip()+' & '
        else:
            course[3] += item.strip()+' & '
    if (course[3] != ''):
            course[3] = course[3][:-3]
    if (course[4] != ''):
            course[4] = course[4][:-3]

    course[5] = row[3].string.strip()
    print(course[5])
    names = row[4].string.split(';')
    for n in names:
        fl = n.split(',')
        if len(fl) == 1:
            course[6] += fl[0].strip()
        else:
            course[6] += fl[1].strip()+" "+fl[0].strip()
        course[6] += ' & '
    course[6] = course[6][:-3]
    course[7] = row[5].string
    dt = row[6].string.split(":")
    if len(dt) == 2:
        course[8] = dt[0]
        se = dt[1].split('-')
        course[9] = se[0]
        course[10] = se[1]
    # row[7] is projected
    course[11] = row[8].string
    course[12] = row[9].string
    if course[12].endswith('*'):
        course[12] = course[11][:-1]
    if row[10].string == "OPEN":
        course[13] = 1
    else:
        course[12] = 0
    v = " ?,"*len(course)
    v = v[:-1]
    sql = "INSERT INTO courses VALUES ("+v+")"
    c.execute(sql, course)


for term in terms:
    # term = terms[2]
    # finals = {}
    # finals[term] = None
    # finalreq = requests.get("https://www.wm.edu/offices/registrar/calendarsandexams/examschedules/fall19exam/index.php")
    # if finalreq.status_code == 200:
    #     finals[term] = {}
    #     finalp = bs4.BeautifulSoup(finalreq.text, 'lxml')
    #     t = finalp.find(id='class').find_next('table')
    #     for r in t.find_all('tr'):

    os.rename(term+'.db', term+'.db.bak')
    db = sqlite3.connect(term+'.db')
    c = db.cursor()
    c.execute('''
            CREATE TABLE courses
            (
            CRN int,
            Subject text,
            ID  text,
            Attributes text,
            COLL text,
            Title text,
            Instructor text,
            Credits int,
            Days text,
            Start int,
            End int,
            Enrolled int,
            Seats int,
            Status int
            )
            ''')

    for subj in subjs:
        r = requests.get("https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code="+term+"&term_subj="+subj+"&attr=0&attr2=0&levl=0&status=0&ptrm=0&search=Search")
        if r.status_code != 200:
            print(term_code, subj, r.status_code)
            sys.exit(2)
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
