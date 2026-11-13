import sys
PEOPLE=[("max","Max"),("evan","Evan"),("noah","Noah"),("andrew","Andrew"),("bridger","Bridger")]
t=open(sys.argv[1]).read()
for slug,name in PEOPLE:
    open(f"{sys.argv[2]}/{slug}.html","w").write(t.replace("__SLUG__",slug).replace("__NAME__",name))
