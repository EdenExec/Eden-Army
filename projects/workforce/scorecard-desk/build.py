import sys
PEOPLE=[("max","Max","MB"),("evan","Evan","EM"),("noah","Noah","NF"),("andrew","Andrew","AJ"),("bridger","Bridger","BS"),("nick","Nick","NL"),("kev","Kev","KW")]
t=open(sys.argv[1]).read()
for slug,name,init in PEOPLE:
    open(f"{sys.argv[2]}/{slug}.html","w").write(t.replace("__SLUG__",slug).replace("__NAME__",name).replace("__INIT__",init))
