# -*- coding: UTF-8 -*-
from invoke import task
from xml.dom.minidom import parse
import xml.dom.minidom


# delete translation by created_date
@task()
def delete_tv(c):
    source_file = "tm.tmx"
    target_file = "tm_deleted_tv.tmx"
    date_string = "20210504T"
    DOMTree = xml.dom.minidom.parse(source_file)
    collection = DOMTree.documentElement
    tus = collection.getElementsByTagName("tu")

    count = 0
    for tu in tus:
        tuvs = tu.getElementsByTagName("tuv")
        for tuv in tuvs:
            lang = tuv.getAttributeNode("xml:lang")
            if lang.value == "zh-CN":
                creation_date = tuv.getAttributeNode("creationdate")
                if creation_date.value.startswith(date_string):
                    tu.removeChild(tuv)
                    count += 1

    print(count)

    with open(target_file, 'w', encoding='UTF-8') as fh:
        DOMTree.writexml(fh, encoding='UTF-8')

# remove tuid to force load to crowdin TM
@task()
def delete_tuid(c):
    source_file = "tm_deleted_tv.tmx"
    target_file = "tm_deleted_tuid.tmx"
    DOMTree = xml.dom.minidom.parse(source_file)
    collection = DOMTree.documentElement
    tus = collection.getElementsByTagName("tu")
    for tu in tus:
        if tu.hasAttribute("tuid"):
            tu.removeAttribute("tuid")
    with open(target_file, 'w', encoding='UTF-8') as fh:
        DOMTree.writexml(fh, encoding='UTF-8')
