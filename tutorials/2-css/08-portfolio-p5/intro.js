const terminal = document.getElementById("terminal");

const lines = [
    "Initializing system...",
    "PMAP: PCID enabled", 
    "Sean Cruz-Colatriano Portfolio Version 1.0.0; root:xnu-4868.12.22~verified/PUBLIC_x86_64",
    "asset leak secured",
    "standard vector authorized",
    "flexbox_table_displ = 240",
    "NETVerify: ProcessorID=1 LocalId=0 Enabled",
    "NETVerify: ProcessorID=2 LocalId=2 Enabled",
    "NETVerify: ProcessorID=3 LocalId=1 Enabled",
    "NETVerify: ProcessorID=4 LocalId=3 Enabled",
    "Security auth loaded: scanning...",
    "          ",
    "Please Wait...",
    "          ",
    "Please Wait...",
    "             ",
    "Scan complete [0131ETTd8289192]",
    "auth: scan verified",
    "OTG VER PARAM: 0, OTG VER FLAG: 0",
    "Buffering-def val [core params]",
    "BC54JAS8: Ethernet address c9:d3:45:45:k1",
    "DSMOS - Priority 5",
    "eng_enabled: LP32",
    "updating pages-vector:net_init",
    "mbinit: done [64 MB total size cret, (32/90) under ]",
    "virtif_NTFS: AuthEvent - BSD BDH34Enet: 1 3 6 1 3 5 32 24 5 2 23 23 54",
    "LP45 [Flags: R/W]. Veron ID 651089 active GUID; max speed s970",
    "Level: 2 Cleared [LIMITED] device root virtf 97: sync",
    "classify-Level: 1 ",
    "SSD TS343 uuid- AF345",
    "configuration changed (device=7 bridge=13 caret=9)",
    "Driver kel: 2 83 83 737 63 [support_net] - set to 'US'",
    "Channel-98: NET{full} viewing port",
    "Base_Wall entered; 3RU3/ --- [INTERRUPTED] .    .     .     .",
    "[VICTION]- [entry granted]   .     .     .       .       .",
    "[RESUME]/ ---RT54",
    "Boot sequence complete.",
    "",
    "",
    "Enabling Access...",
    "Welcome, User",
];

let lineIndex = 0; 
let charIndex = 0; 

function typeLine() {
    if (lineIndex < lines.length) {
        let currentLine = lines[lineIndex];

        if (charIndex < currentLine.length) {
            terminal.innerHTML += currentLine.charAt(charIndex);
            charIndex++;
            setTimeout(typeLine, 3);
        } else {
            terminal.innerHTML += "\n";
            lineIndex++;
            charIndex = 0;
            setTimeout(typeLine, 300);
        }
    } else {
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    
    }
}

typeLine();