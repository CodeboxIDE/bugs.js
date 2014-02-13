/*************************************************************************
 *  Compilation:  javac HelloWorld.java
 *  Execution:    java HelloWorld
 *************************************************************************/

public class HelloWorld {
    public static void misc() {
        String abc = "Another string";

        String xyz = "Im a long string";

        System.out.println(abc);
    }

    public static void main(String[] args) {
        HelloWorld.misc();

        String xyz = "string in main";

        System.out.println(xyz);
    }
}
