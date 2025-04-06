export const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    
    brightBlack: "\x1b[90m",
    brightRed: "\x1b[91m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m",
    brightWhite: "\x1b[97m",
    
    bgBrightBlack: "\x1b[100m",
    bgBrightRed: "\x1b[101m",
    bgBrightGreen: "\x1b[102m",
    bgBrightYellow: "\x1b[103m",
    bgBrightBlue: "\x1b[104m",
    bgBrightMagenta: "\x1b[105m",
    bgBrightCyan: "\x1b[106m",
    bgBrightWhite: "\x1b[107m"
};
  
export const logger = {
    log: (message: string) => console.log(message),
    
    info: (message: string) => console.log(`${colors.cyan}${message}${colors.reset}`),
    
    warn: (message: string) => console.log(`${colors.yellow}${message}${colors.reset}`),
    
    error: (message: string) => console.log(`${colors.red}${message}${colors.reset}`),
    
    success: (message: string) => console.log(`${colors.green}${message}${colors.reset}`),
    
    command: (message: string) => console.log(`${colors.magenta}${message}${colors.reset}`),
    
    custom: (message: string, textColor: keyof typeof colors, bgColor?: keyof typeof colors) => {
        const bg = bgColor ? colors[bgColor] : '';
        console.log(`${colors[textColor]}${bg}${message}${colors.reset}`);
    },
    
    tagged: (tag: string, message: string, tagColor: keyof typeof colors, messageColor?: keyof typeof colors) => {
        const msgColor = messageColor ? colors[messageColor] : colors.reset;
        console.log(`${colors[tagColor]}[${tag}]${colors.reset} ${msgColor}${message}${colors.reset}`);
    }
};
  
if (import.meta.main) {
    logger.info("นี่คือข้อมูล");
    logger.warn("นี่คือคำเตือน");
    logger.error("นี่คือข้อผิดพลาด");
    logger.success("นี่คือความสำเร็จ");
    logger.command("นี่คือคำสั่ง");
    logger.custom("ข้อความกำหนดสีเอง", "brightBlue", "bgYellow");
    logger.tagged("COMMAND", "update command in Guild 123456", "brightMagenta", "brightWhite");
}