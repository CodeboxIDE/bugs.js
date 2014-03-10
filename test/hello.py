from time import sleep

def unused():
    pass


def myf(x):
    a = 'ccc'

    d = 99*5

    unused()

    return 99*x+3


def main():
    x = 34
    print(myf(7))
    print(myf(myf(9)))

main()
