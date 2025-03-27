---
layout: page
title: 2. Static Analysis
parent: Reverse Engineering
permalink: /Reverse_Engineering/Static_Analysis
nav_order: 1
---

# Table of contents
- TOC
{: toc}

# Basic Static analysis
## Lab Setup
Some famous software used for creating and using Virtual Machines includes [Oracle VirtualBox](https://www.virtualbox.org/) and [VMWare Workstation Pro](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion).

Following steps portray the usage of Virtual Machines for malware analysis:

1. Created a fresh Virtual Machine with a new OS install
2. Set up the machine by installing all the required analysis tools in it
3. Take a snapshot of the machine
4. Copy/Download malware samples inside the VM and analyze it
5. Revert the machine to the snapshot after the analysis completes

### FLARE VM
The [`FLARE VM`](https://github.com/mandiant/flare-vm) is a Windows-based VM well-suited for malware analysis created by Mandiant (Previously FireEye).
It contains some of the community's favorite malware analysis tools. Since it is a Windows-based VM, it can perform dynamic analysis of Windows-based malware.

### REMnux:
[`REMnux`](https://github.com/REMnux) stands for Reverse Engineering Malware Linux.
It is a Linux-based malware analysis distribution created by Lenny Zeltser in 2010.

Like the FLARE VM, it includes some of the most popular reverse engineering and malware analysis tools pre-installed.

Being a Linux-based distribution, it cannot be used to perform dynamic analysis of Windows-based malware.

## String search
In the [intro to (Malware) Analysis](/Reverse_Engineering/Introduction), we identified that searching for strings is one of the first steps in analysis.

### How a string search works:
A string search `looks at the binary data` in a malware sample regardless of its file type and `identifies sequences of ASCII or Unicode characters followed by a null character`. Wherever it finds such a sequence, it reports that as a string. This might raise the question that not all sequences of binary data that looks like ASCII or Unicode characters will be actual strings, which is right. 

Many sequences of bytes can fulfill the criteria mentioned above but are not strings of useful value; rather, they might include memory addresses, assembly instructions, etc. Therefore, a string search leads to `many False Positives (FPs)`. These FPs show up as garbage in the output of our string search and should be ignored. It is up to the analyst to identify the useful strings and ignore the rest.

### What to look for?
Since an analyst has to identify actual strings of interest and differentiate them from the garbage, it is good to know what to look for when performing a string search. Although a lot of useful information can be unearthed in a string search, the following artifacts can be used as `Indicators of Compromise (IOCs)` and prove more useful.

- Information about the possible functionality:
  - Windows `Functions` and `APIs` like:
    - `SetWindowsHook`
    - `CreateProcess`
    - `InternetOpen`
    - `etc`

- Information about possible C2 communication:
  - `IP Addresses`
  - `URLs`
  - `Domains`

- Information that helps set the context for further analysis:
  - `Miscellaneous strings` such as `Bitcoin addresses`
  - `Text used for Message Boxes`
  - `etc`

### Basic String Search
The `strings` utility, which is pre-installed in `Linux machines` can be used for a basic string search.

Similarly, the FLARE VM comes with a Windows utility, `strings.exe`, that performs the same task. This Windows strings utility is `part of the Sysinternals suite`, a set of `tools published by Microsoft to analyze different aspects of a Windows machine`. Details about the strings utility can be found in [Microsoft Documentation](https://learn.microsoft.com/en-us/sysinternals/downloads/strings). 

The good thing about the command line strings utility is that it can `dump strings to a file for further analysis`.

```
C:\Users\Administrator\Desktop>strings <path to binary>
```

Several other tools included in the FLARE VM can be used for string search.

For example:
- `CyberChef` (Desktop>FLARE>Utilities>Cyberchef) has a recipe for basic string search as well.
- `PEstudio` (Desktop>FLARE>Utilities>pestudio) also provides a string search utility.

    PEstudio also provides some additional information about the strings, like, the encoding, size of the string, offset in the binary where the string was found, and a hint to guess what the string is related to. It also has a column for a blacklist, which matches the strings against some signatures.

E.g:
PEstudio shows strings found by PEstudio in a malware sample. This can be done by selecting strings in the left pane after loading the PE file in PEstudio. The blacklist here shows a bunch of Windows API calls, which PEstudio flags as potentially used in malicious processes. You can learn about these APIs using resources like [MalAPI](https://malapi.io/) or MSDN.

### Obfuscated strings
Searching for strings often proves one of the most effective first steps in malware analysis. The malware authors know this and don't want a simple string search to thwart their malicious activities. Therefore, `they deploy techniques to obfuscate strings` in their malware. Malware authors use several techniques to obfuscate the key parts of their code. These techniques often render a string search ineffective, i.e., we won't find much information when we search for strings.

#### FLOSS
Mandiant (then FireEye) launched [`FLOSS`](https://github.com/mandiant/flare-floss) to solve this problem, short for FireEye Labs Obfuscated String Solver. FLOSS uses several techniques to deobfuscate and extract strings that would not be otherwise found using a string search. The type of strings that FLOSS can extract and how it works can be found in [Mandiant's blog post](https://www.mandiant.com/resources/blog/automatically-extracting-obfuscated-strings).

To execute FLOSS, open a command prompt and navigate to the Desktop directory.

```
C:\Users\Administrator\Desktop>floss -h
```

This command will open the `help page for FLOSS`. We can use the following command to use FLOSS to search for obfuscated strings in a binary.

```
C:\Users\Administrator\Desktop>floss --no-static-strings <path to binary>
```

Please remember that the command `might take some time to execute`, and you might see what appear to be some `error messages before the results are generated`.

## Fingerprinting malware
When analyzing malware, it is often required to identify unique malware and `differentiate them from each other`.

File names can't be used for this purpose as they can be duplicated easily and might be confusing. Also, a file name can be changed easily as well. Hence, a hash function is used to identify a malware sample uniquely.

A hash function takes a file/data of arbitrary length as input and creates a fixed-length unique output based on file contents. This process is irreversible, as you can't recreate the file's contents using the hash. `Hash functions have a very low probability (practically zero) of two files having different content but the same hash`. A hash remains the same as long as the file's content remains the same. However, even a slight change (1 bit) in content will result in a different hash. It might be noted that the `file name is not a part of the content`; therefore, changing the file name does not affect the hash of a file.

Besides identifying files, hashes are also used to store passwords to authenticate users. In malware analysis, hash files can be used to identify unique malware, search for this malware in different malware repositories and databases, and as an Indicator of Compromise (IOC).

### Commonly used methods of calculating File hashes
For identification of files, a hash of the complete file is taken. There are various methods to take the hash. The most commonly used methods are:
- Md5sum
- Sha1sum
- Sha256sum

The first two types of hashes are now considered insecure or prone to collision attacks (when two or more inputs result in the same hash). Although a collision attack for these hash functions is not very probable, it is still possible. Therefore, `sha256sum is currently considered the most secure method` of calculating a file hash.

### Finding similar files with hashes
Another scenario in which hash functions help a malware analyst is identifying similar files using hashes. We already established that even a slight change in the contents of a file would result in a different hash.

However, some types of hashes can help identify the similarity among different files:
- `Imphash`:

  The imphash stands for "import hash". Imports are functions that an executable file imports from other files or Dynamically Linked Libraries (DLLs). The imphash is a hash of the function calls/libraries that a malware sample imports and the order in which these libraries are present in the sample. This helps identify samples from the same threat groups or performing similar activities.

  Any malware samples with the same imports in the same order will have the same imphash. This helps in identifying similar samples.

  ![Imphash](/Reverse_Engineering/Images/Imphash.png)

- `Fuzzy hashes/SSDEEP`:

  Another way to identify similar malware is through fuzzy hashes. A fuzzy hash is a `Context Triggered Piecewise Hash (CTPH)`. This hash is calculated by dividing a file into pieces and calculating the hashes of the different pieces. This method creates `multiple inputs with similar sequences of bytes`, even though the whole file might be different.


Multiple utilities can be used to calculate ssdeep, like CyberChef. However after having ssdeep installed you can show the help menu like so:

  ```
  C:\Users\Administrator\Desktop>ssdeep-2.14.1\ssdeep.exe -h
  ```

### Signature-based detection
While using imphash or ssdeep provides a way to identify if some files are similar, sometimes we just need to identify if a file contains the information of interest. Hashes are not the ideal tool to perform this task.

#### Signatures
Signatures are a way to `identify if a particular file has a particular type of content`. We can consider a signature as a pattern that might be found inside a file. This pattern is often a `sequence of bytes` in a file, with or without any context regarding where it is found. Security researchers often use signatures to identify patterns in a file, `identify if a file is malicious, and identify suspected behavior and malware family`.  

#### Yara rules
Yara rules are a type of `signature-based rule`. It is famously called a `pattern-matching swiss army knife for malware researchers`. Yara can identify information based on binary and textual patterns, such as hexadecimal and strings contained within a file.

The security community publishes a [repository of open-source Yara rules](https://github.com/Yara-Rules/rules) that we can use as per our needs. When analyzing malware, we can use this repository to dig into the community's collective wisdom. However, while using these rules, please keep in mind that `some might depend on context`. Some others might just be used for the `identification of patterns that can be non-malicious as well`. Hence, `just because a rule hits doesn't mean the file is malicious`.

#### Proprietary signatures - Anti-virus Scans
Besides the open-source signatures, Antivirus companies spend lots of resources to create proprietary signatures. The advantage of these proprietary signatures is that `since they have to be sold commercially, there are lesser chances of False Positives` (FPs, when a signature hits a non-malicious file). However, this `might lead to a few False Negatives` (FNs, when a malicious file does not hit any signature).

Antivirus scanning helps identify if a file is malicious with `high confidence`. Antivirus software will often mention the signature that the file has hit, which might hint at the file's functionality. However, we must note that despite their best efforts, `every AV product in the market has some FPs and some FNs`. Therefore, when analyzing malware, it is prudent to get a verdict from multiple products. The `Virustotal` website makes this task easier for us, where we can find the verdict about a file from 60+ AV vendors, apart from some very useful information. We also touched upon this topic in our Intro to Malware Analysis room.

Please remember, if you are analyzing a sensitive file, it is best practice to `search for its hash` on Virustotal or other scanning websites `instead of uploading the file itself`. This is done to avoid leaking sensitive information on the internet and letting a sophisticated attacker know that you are analyzing their malware.

#### Capa
Capa is another open-source tool created by Mandiant. This tool helps `identify the capabilities found in a PE file`. Capa reads the files and tries to `identify the behavior` of the file based on signatures such as `imports`, `strings`, `mutexes`, and `other artifacts present in the file`.

Using Capa is simple. On the command prompt, we just point capa to the file we want to run it against.

```
C:\Users\Administrator\Desktop>capa mal\1
loading : 100%|████████████████████████████████████████████████████████████| 485/485 [00:00<00:00, 1552.05     rules/s]
matching: 100%|██████████████████████████████████████████████████████████████| 288/288 [00:12<00:00, 22.23 functions/s]
+------------------------+------------------------------------------------------------------------------------+
| md5                    | 6548eec09f4d8bc6514bee3e5452541c                                                   |
| sha1                   | 7be46c62d975949fdd6777530940cf6435e8cb90                                           |
| sha256                 | 6ec74cc0a9b5697efd3f4cc4d3a21d9ffe6e0187b770990df8743fbf4f3b2518                   |
| path                   | mal\1                                                                              |
+------------------------+------------------------------------------------------------------------------------+

+------------------------+------------------------------------------------------------------------------------+
| ATT&CK Tactic          | ATT&CK Technique                                                                   |
|------------------------+------------------------------------------------------------------------------------|
| DEFENSE EVASION        | Obfuscated Files or Information::Indicator Removal from Tools [T1027.005]          |
|                        | Obfuscated Files or Information [T1027]                                            |
| DISCOVERY              | Application Window Discovery [T1010]                                               |
|                        | System Information Discovery [T1082]                                               |
| EXECUTION              | Command and Scripting Interpreter [T1059]                                          |
|                        | Shared Modules [T1129]                                                             |
+------------------------+------------------------------------------------------------------------------------+

+-----------------------------+-------------------------------------------------------------------------------+
| MBC Objective               | MBC Behavior                                                                  |
|-----------------------------+-------------------------------------------------------------------------------|
| ANTI-STATIC ANALYSIS        | Disassembler Evasion::Argument Obfuscation [B0012.001]                        |
| CRYPTOGRAPHY                | Encrypt Data::RC4 [C0027.009]                                                 |
|                             | Generate Pseudo-random Sequence::RC4 PRGA [C0021.004]                         |
| FILE SYSTEM                 | Delete File [C0047]                                                           |
|                             | Read File [C0051]                                                             |
|                             | Write File [C0052]                                                            |
| OPERATING SYSTEM            | Console [C0033]                                                               |
| PROCESS                     | Allocate Thread Local Storage [C0040]                                         |
|                             | Set Thread Local Storage Value [C0041]                                        |
|                             | Terminate Process [C0018]                                                     |
+-----------------------------+-------------------------------------------------------------------------------+

+------------------------------------------------------+------------------------------------------------------+
| CAPABILITY                                           | NAMESPACE                                            |
|------------------------------------------------------+------------------------------------------------------|
| contain obfuscated stackstrings                      | anti-analysis/obfuscation/string/stackstring         |
| encrypt data using RC4 PRGA                          | data-manipulation/encryption/rc4                     |
| contains PDB path                                    | executable/pe/pdb                                    |
| contain a resource (.rsrc) section                   | executable/pe/section/rsrc                           |
| accept command line arguments                        | host-interaction/cli                                 |
| manipulate console                                   | host-interaction/console                             |
| query environment variable                           | host-interaction/environment-variable                |
| delete file                                          | host-interaction/file-system/delete                  |
| read file                                            | host-interaction/file-system/read                    |
| write file (2 matches)                               | host-interaction/file-system/write                   |
| enumerate gui resources                              | host-interaction/gui                                 |
| get disk information                                 | host-interaction/hardware/storage                    |
| get hostname                                         | host-interaction/os/hostname                         |
| get thread local storage value (3 matches)           | host-interaction/process                             |
| set thread local storage value (2 matches)           | host-interaction/process                             |
| terminate process (5 matches)                        | host-interaction/process/terminate                   |
| link function at runtime (8 matches)                 | linking/runtime-linking                              |
| link many functions at runtime                       | linking/runtime-linking                              |
| parse PE exports (2 matches)                         | load-code/pe                                         |
| parse PE header (4 matches)                          | load-code/pe                                         |
+------------------------------------------------------+------------------------------------------------------+


FLARE Sun 09/18/2022 18:34:13.15
```

We can see that Capa has mapped the identified capabilities according to the `MITRE ATT&CK framework` and `Malware Behavior Catalog (MBC)`. In the last table, we see the capabilities against the matched signatures and the number of signatures that have found a hit against these capabilities. As we might see, it also tells us if there are obfuscated stackstrings in the sample, allowing us to identify if running `FLOSS` against the sample might be helpful. To find out more information about the sample, we can use the `-v` or the `-vv` operator, which will show us the results in `verbose or very verbose mode`, identifying addresses where we might find the said capability.

## Leveraging the PE header
So far we have covered techniques that work regardless of the file type of the malware. However, those techniques are a little `hit-and-miss`, as they don't always provide us with deterministic information about the malware. The `PE headers provide a little more deterministic characteristics` of the sample, which tells us much more about the sample.

### The PE header
{: .warning}
>If you're unsure what this is, make sure to read about [Portable executable file format](/Windows_Internals/PE).

Several tools in the FLARE VM can help us analyze PE headers. `PEStudio` is one of them.

The `PE header contains rich information` useful for malware analysis.

# Advanced Static analysis
 In Advanced Static Analysis, we will move further and reverse engineer malware into the disassembled code and `analyze the assembly instructions` to understand the malware's core functionality in a better way.

Advanced static analysis is a technique used to analyze the code and structure of malware without executing it. This can help us identify the malware's behavior and weaknesses and develop signatures for antivirus software to detect it. By analyzing the code and structure of malware, researchers can also better understand how it works and develop new techniques for defending against it.

## Malware analysis overview

| Technique | Description |
|-|-|
| Basic static analysis | Aims to understand the malware's `structure`. Involves examining the malware's `code`, `file headers`, and `other static properties`. |
| Advanced static analysis | Aims to uncover `hidden or obfuscated code and functionality` within the malware. Involves using more advanced techniques to analyze the malware's code, such as `deobfuscation` and `code emulation`. |
| Basic dynamic analysis | Aims to observe the malware's `behavior during execution` in a controlled environment. Involves `executing` the malware in a sandbox or virtual machine and `monitoring` its `system activity`, `network traffic`, and `process behavior`. |
| Advanced dynamic analysis | Aims to uncover more `complex and evasive malware behavior` using advanced monitoring techniques. Involves using more sophisticated sandboxes and monitoring tools to `capture the malware's behavior in greater detail`. |

## How advanced static analysis is performed
To perform advanced static analysis, `disassemblers` such as `IDA Pro`, `Binary Ninja`, and `radare2` are commonly used. These disassemblers allow the analyst to explore the malware's code and `identify its functions and data structures`.

The steps involved in performing advanced static analysis of malware are as follows:
-  Identify the `entry point` of the malware and the `system calls` it makes.
-  Identify the malware's `code sections` and analyze them using available tools such as `debuggers` and `hex editors`.
-  Analyze the malware's `control flow` graph to identify its `execution path`.
-  Trace the malware's dynamic behavior by `analyzing the system calls` it makes during execution.
-  Use the above information to understand the malware's `evasion techniques` and the `potential damage it can cause`.

## Ghidra
Many `disassemblers` like Cutter, radare2, Ghidra, and IDA Pro can be used to disassemble malware. However, we will explore Ghidra because it's `free`, `open-source`, and has `many features` that can be utilized to get proficient in reverse engineering.

>[!NOTE]
> The objective is to get comfortable with the main usage of a disassembler and use that knowledge to use any disassembler.

`Ghidra` is a software reverse engineering tool that allows users to analyze compiled code to understand its functionality. It is designed to help analysts and developers understand how the software works by providing a platform to `decompile`, `disassemble`, and `debug binaries`.

Ghidra includes many features that make it a powerful reverse engineering tool. Some of these features include:
- `Decompilation`: Ghidra can `decompile` binaries `into readable C code`, making it easier for developers to understand how the software works.
- `Disassembly`: Ghidra can `disassemble` binaries `into assembly language`, allowing analysts to examine the low-level operations of the code.
- `Debugging`: Ghidra has a built-in `debugger` that allows users to `step through` code and examine its behavior.
- `Analysis`: Ghidra can `automatically identify functions`, `variables`, and `other code` to help users understand the `structure of the code`.

### How to use Ghidra
1. Open Ghidra and create a `new project`.
2. Select `Non-Shared Project`.

    Selecting Shared Project would allow us to share our analysis with other analysts.

3. Name the project and `set the directory` or leave the default path.
4. `Import` the executable you want to analyze. Now that we have created an empty project, let's Drag & Drop the executable and select the program.
5. Once it's imported, it shows us the summary of the program.
6. `Double-click on the .exe` to open it in the Code Browser. When asked to analyze the executable, `click on Yes`.
7. The next window that appears shows us various analysis options. We can `check or uncheck them based on our needs`. These plug-ins or add-ons assist Ghidra during the analysis.
8. It will take some time to analyze. The bar on the bottom-right shows the progress. `Wait` until the analysis is 100%.

### Ghidra layout
![Ghidra layout](/CCI25/Reverse_Engineering/Images/Ghidra_layout.png)

1. `Program Trees`: Shows (PE) sections of the program. We can click on different sections to see the content within each.

2. `Symbol Tree`:
    - `Imports`: This section contains information about the `libraries being imported` by the program. Clicking on each API call shows the assembly code that uses that API.
    - `Exports`: This section contains the API/function calls being exported by the program. This section is `useful when analyzing a DLL`, as it will show all the functions dll contains.
    - `Functions`: This section contains the functions it finds within the code. Clicking on each function will take us to the disassembled code of that function. It also contains the `entry function`. Clicking on the entry function will take us to the `start of the program` we are analyzing. Functions with `generic names` starting with `FUN_VirtualAddress` are the ones that `Ghidra does not give any names to`.

3. `Data Type Manager`: This section shows various data types found in the program.

4. `Listing`: This window shows the disassembled code of the binary, which includes the following values in order.
    - `Virtual Address`
    - `Opcode`
    - `Assembly Instruction (PUSH, POP, ADD, XOR, etc.)`
    - `Operands`
    - `Comments`

5. `Decompile`: Ghidra translates the assembly code into a `pseudo C code` here. This is a very important section to look at during analysis as it gives a better understanding of the assembly code.

6. `Toolbar`: It has various `options to use` during the analysis.
   
   - `Graph View`: The Graph View in the toolbar is an important option, allowing us to see the graph view of the disassembly:

    ![Graph view](/CCI25/Reverse_Engineering/Images/Graph_view.png)

   - The `Memory Map` option shows the memory mapping of the program as shown below:
    
    ![Memory map](/CCI25/Reverse_Engineering/Images/Memory_map.png)

   - This `navigation toolbar` shows different options to navigate through the code.

    ![Navigation toolbar](/CCI25/Reverse_Engineering/Images/Navigation_toolbar.png)

   - `Explore Strings`. Go to `Search -> For Strings` and click Search will give us the strings that Ghidra finds within the program. This window can contain very juicy information to help us during the analysis.

    ![Strings](/CCI25/Reverse_Engineering/Images/Strings.png)

## Identifying C code constructs in Assembly
Analyzing the assembly code of the compiled binary can be overwhelming for beginners.
Understanding the assembly instructions and how various programming components are translated/reflected into the assembly is important.
Here, we will examine various C constructs and their corresponding assembly code. This will help us identify and focus on the key parts of the malware during analysis.

{: .warning}
> Different compilers add their own code for various checks while compiling.
> 
> Therefore expect some garbage assembly code that does not make sense.

There are different approaches to begin analyzing the disassembled code:

- Locate the `main` function from the `Symbol Tree` section.
- Check the `.text` code from the `Program Trees` section to see the code section and find the entry point.
- Search for interesting `strings` and locate the code from where those strings are referenced.

<details>
<summary> Hello World example </summary>

{% highlight c %}
#include <stdio.h>

int main()
{
    printf("Hello, world!");
    return 0;
}
{% endhighlight %}

Assembly code:
{% highlight asm %}
section .data 
    message db 'HELLO WORLD!!', 0

section .text
    global _start

_start:
    ; write the message to stdout
    mov eax, 4      ; write system call
    mov ebx, 1      ; file descriptor for stdout
    mov ecx, message    ; pointer to message
    mov edx, 13     ; message length
    int 0x80        ; call kernel
{% endhighlight %}

</details>

This program defines a string "HELLO WORLD!!" in the .data section and then uses the `write system call` to `print the string to stdout`.

![Hello World example](/CCI25/Reverse_Engineering/Images/Hello_world.png)

If we look at the disassembled code in the Listings View, we can see instructions to push HELLO WORLD!! to the stack before calling the print function.

<details>
<summary> For loop example </summary>

{% highlight c %}
int main()
{
    for (int i = 1; i <= 5; i++)
    {
        std::cout << i << std::endl;
    }
    return 0;
}
{% endhighlight %}

Assembly:
{% highlight asm %}
main:
    ; initialize loop counter to 1
    mov ecx, 1

    ; loop 5 times
    mov edx, 5
loop:
    ; print the loop counter
    push ecx
    push format
    call printf
    add esp, 8

    ; increment loop counter
    inc ecx

    ; check if the loop is finished
    cmp ecx, edx
    jle loop
{% endhighlight %}

</details>

<details>
<summary> Function example </summary>

{% highlight c %}
int add(int a, int b)
{
    int result = a + b;
    return result;
}
{% endhighlight %}

Assembly:
{% highlight asm %}
add:
    push ebp          ; save the current base pointer value
    mov ebp, esp      ; set base pointer to current stack pointer value
    mov eax, dword ptr [ebp+8]  ; move the value of 'a' into the eax register
    add eax, dword ptr [ebp+12] ; add the value of 'b' to the eax register
    mov dword ptr [ebp-4], eax  ; move the sum into the 'result' variable
    mov eax, dword ptr [ebp-4]  ; move the value of 'result' into the eax register
    pop ebp           ; restore the previous base pointer value
    ret               ; return to calling function
{% endhighlight %}

</details>

The add function starts by saving the current base pointer value onto the stack.
Then, it sets the base pointer to the current stack pointer value.
The function then moves the values of a and b into the eax register, adds them, and store the result in the result variable.
Finally, the function moves the value of the result into the eax register, restores the previous base pointer value, and returns to the calling function.

## An overview of API calls
The Windows API is a `collection of functions and services` the Windows Operating System provides to `enable developers to create Windows applications`.
These functions include `creating windows`, `menus`, `buttons`, and `other user-interface elements` and `performing tasks` such as file input/output and network communication.

### CreateProcessA example
The `CreateProcessA` function creates a new process and its primary thread. The function takes several parameters, including the name of the executable file, command-line arguments, and security attributes.

![Windows API syntax](/CCI25/Reverse_Engineering/Images/Win_syntax.png)

Here is an example of C code that uses the CreateProcessA function to launch a new process:

```C
#include <windows.h>

int main()
{
    STARTUPINFO si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    if (!CreateProcess(NULL, "C:\\\\Windows\\\\notepad.exe", NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi))
    {
        printf("CreateProcess failed (%d).\\n", GetLastError());
        return 1;
    }

    WaitForSingleObject(pi.hProcess, INFINITE);

    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    return 0;
}
```

When compiled into assembly code, the CreateProcessA function call looks like this:
```asm
push 0
lea eax, [esp+10h+StartupInfo]
push eax
lea eax, [esp+14h+ProcessInformation]
push eax
push 0
push 0
push 0
push 0
push 0
push 0
push dword ptr [hWnd]
call CreateProcessA
```

This assembly code `pushes the necessary parameters onto the stack in reverse order` and then calls the CreateProcessA function. The CreateProcessA function then launches a new process and returns a handle to the process and its primary thread.

During malware analysis, identifying the API call and examining the code can help understand the malware's purpose.

## Common APIs used by Malware
Malware authors heavily rely on Windows APIs to accomplish their goals. It's important to know the Windows APIs used in different malware variants. It's an important step in advanced static analysis to examine the `import` functions, which can reveal much about the malware.

### Keylogger
- `SetWindowsHookEx`: Installs an `application-defined hook procedure into a hook chain`. Used to `monitor and intercept system events`, such as `keystrokes` or `mouse clicks`.
- `GetAsyncKeyState`: Retrieves the status of a virtual key when the function is called. Used to `determine if a key is being pressed` or `released`.
- `GetKeyboardState`: Retrieves the status of all virtual keys. Used to `determine the status of all key`s on the keyboard.
- `GetKeyNameText`: Retrieves the `name of a key`. Used to `determine the name of the pressed key`.

### Downloader
Designed to download other malware onto a victim's system.

- `URLDownloadToFile`: `Downloads a file` from the internet and saves it to a local file. Used to `download additional malicious code` or updates to the malware.
- `WinHttpOpen`: `Initializes the WinHTTP API`. Used to `establish an HTTP connection to a remote server` and download additional malicious code.
- `WinHttpConnect`: `Establishes a connection` to a remote server using the WinHTTP API. Used to `connect to a remote server and download additional malicious code`.
- `WinHttpOpenRequest`: `Opens HTTP request` using the WinHTTP API. Used to `send HTTP requests to a remote server` and download additional malicious code or steal data.

### C2 Communication
Command and Control (C2) communication is a method malware uses to communicate with a remote server or attacker.

- `InternetOpen`: `Initializes a session for connecting to the internet`. Used to `connect to a remote server and communicate with a command-and-control (C2) server`.
- `InternetOpenUrl`:` Opens a URL` for download. Used to `download additional malicious code` or steal data from a C2 server.
- `HttpOpenRequest`: `Opens HTTP request`. Used to `send HTTP requests to a C2 server and receive commands` or additional malicious code.
- `HttpSendRequest`: Sends `HTTP request to a C2 server`. Used to `send data or receive commands` from a C2 server.

### Data Exfiltration
Unauthorized data transfer from an organization to an external destination.

- `InternetReadFile`: `Reads data from a handle to an open internet resource`. Used to `steal data from a compromised system and transmit it to a C2 server`.
- `FtpPutFile`: `Uploads a file to an FTP server`. Used to `exfiltrate stolen data to a remote server`.
- `CreateFile`: `Creates or opens a file or device`. Used to `read or modify files containing sensitive information` or `system configuration data`.
- `WriteFile`: `Writes data to a file or device`. Used to `write stolen data to a file and then exfiltrate it` to a remote server.
- `GetClipboardData`: Used to `retrieve data from the clipboard`. Used to `retrieve sensitive data that is copied to the clipboard`.

### Dropper
Designed to install other malware onto a victim's system.

- `CreateProcess`: `Creates a new process and its primary thread`. Used to `execute its code in the context of a legitimate process`, making it more difficult to detect and analyze.
- `VirtualAlloc`: Reserves or commits a region of memory within the virtual address space of the calling process. Malware can use this function to `allocate memory to store its code`.
- `WriteProcessMemory`: Writes data to an area of memory within the address space of a specified process. Used to `write its code to the allocated memory`.

### API Hooking
`Intercept calls to Windows APIs and modify their behavior`.

- `GetProcAddress`: `Retrieves the address of an exported function or variable` from a specified dynamic-link library (DLL). Used to `locate and hook API calls made by other processes`.
- `LoadLibrary`: Loads a dynamic-link library (DLL) into a process's address space. Used to `load and execute additional code from a DLL or other module`.
- `SetWindowsHookEx` This API is used to `install a hook procedure that monitors messages sent to a window or system event`. Used to `intercept calls to other Windows APIs and modify their behavior`.

### Anti-debugging and VM detection
Evade detection and analysis by security researchers.

- `IsDebuggerPresent`: Checks whether a process is running under a debugger. Used to `determine whether it is being analyzed` and take appropriate action to evade detection.
- `CheckRemoteDebuggerPresent`: Checks whether a remote debugger is debugging a process. Used to `determine whether it is being analyzed` and take appropriate action to evade detection.
- `NtQueryInformationProcess`: Retrieves information about a specified process. Used to `determine whether the process is being debugged` and take appropriate action to evade detection.
- `GetTickCount`: Retrieves the number of milliseconds that have elapsed since the system was started. Used to `determine whether it is running in a virtualized environment`, which may indicate that it is being analyzed.
- `GetModuleHandle`: Retrieves a handle to a specified module. Used to `determine whether it is running under a virtualized environment`, which may indicate that it is being analyzed.
- `GetSystemMetrics`: Retrieves various system metrics and configuration settings. Used to `determine whether it is running under a virtualized environment`, which may indicate that it is being analyzed.

Read more on [malapi.io](https://malapi.io/) to learn about APIs used in different malware families.

## Analyzing process hollowing
Let's take analyze a code sample that uses [process hollowing](https://attack.mitre.org/techniques/T1055/012/).

An important point to note is that almost all malware comes `packed with known or custom packers` and also have employed different Anti-debugging / VM detection techniques to hinder the analysis. 

This sample is not packed and has no Anti-debugging / VM detection techniques is applied.

Our objective of advanced static analysis would be to:
- `Examine the API calls` to find a pattern or suspicious call.
- Look at the suspicious `strings`.
- Find `interesting or malicious functions`.
- Examine the disassembled/decompiled code to `find as much information as possible`.

{: .warning}
> It's important to mention that starting to search for the CreateProcessA function right away is not how an analyst would start analyzing an unknown binary. This whole example is just to get comfertable with Ghidra.

### CreateProcess
The suspicious process creates a victim process in the suspended state.

To confirm, let's search for the CreateProcessA API in the Symbol Tree section.

Then, `right-click on the Show References` to option to display all the program sections where this function is called.

Clicking on the first reference will take us to the disassembled code and show the decompiled C code in the Decompile section.

It clearly shows how the parameters on the stack are being pushed in reverse order before calling the function. The value `0x4` in the `process creation flag` is being pushed into the stack, representing the `suspended state`.

### Graph View
Clicking on the Display Function Graph in the toolbar will show the graph view of the disassembled code we are examining.

![Function graph](/CCI25/Reverse_Engineering/Images/Function_graph.png)

In the above case, if the program:
- Fails to create a victim process in the suspended state, it will move to block 1. The `red arrow represents the failure` to meet the condition mentioned above.
- Successfully creates the victim process, it will move to block 2. The `green arrow represents the success` of the jump condition.

### Example of further analysis
1. Opening a suspicous file

    The CreateFileA API is used to either create or open an existing file.

2. Hollowing the process

    Malware use ZwUnmapViewOfSection or NtUnmapViewOfSection API calls to unmap the target process's memory.

    NtUnmapViewOfSection takes exactly two arguments, the base address (virtual address) to be unmapped and the handle to the process that needs to be hollowed.

3. Allocating memory

    Once the process is hollowed, malware must allocate the memory using VirtualAllocEx before writing the process.

    Arguments passed to the function include a handle to the process, address to be allocated, size, allocation type, and memory protection flag.

4. Writing down the memory

    Once the memory is allocated, the malware will attempt to write the suspicious process/code into the memory of the hollowed process. The WriteProcessMemory API is used for this purpose.

    There were three calls to the WriteProcessMemory Function. The last call references to the code in the Kernel32 DLL; therefore, we can ignore that. From the decompiled code, it seems the program is copying different sections of the suspicious process one by one.

5. Resuming the thread

    Once all is sorted out, the malware will get hold of the thread using the SetThreadContext and then resume the thread using the ResumeThread API to execute the code.