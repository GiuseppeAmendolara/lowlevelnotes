# Compiling

!!! warning
    To compile NASM on windows download [NASM](https://www.nasm.us/) & [w64devkit-x86](https://github.com/skeeto/w64devkit/releases/tag/v2.0.0).
    
    Use NASM to assemble the .asm file into an object file (.obj). Run this command in the same directory where the .asm file is located:
    ```nasm -f win32 -o fileName.obj fileName.asm```
    
    Use GCC to link the .obj file and create the final executable (.exe). Run this command:
    ```gcc -mconsole -nostartfiles -o fileName.exe fileName.obj```