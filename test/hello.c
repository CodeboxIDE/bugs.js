#include <stdio.h>
#include <stdlib.h>

// A Simple polynomial function
int f(x) {
    return x*x + 3*x + 9;
}

int main(int argc, char *argv[]) {
    int a = 2;
    int b = 1;

    printf("f(%d) = %d\n", a, f(a));

    puts("Hello");

    printf("f(%d) = %d\n", b, f(b));

    return 0;
}
