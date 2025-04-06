/**
 * ฟังก์ชันช่วยในการแปลงเวลาจากมิลลิวินาทีเป็นรูปแบบ HH:MM:SS
 * @param ms เวลาในหน่วยมิลลิวินาที
 * @returns สตริงในรูปแบบ HH:MM:SS หรือ MM:SS
 */
export function formatDuration(ms: number): string {
    if (!ms || isNaN(ms)) return '00:00';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const paddedSeconds = seconds.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    
    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
        return `${paddedMinutes}:${paddedSeconds}`;
    }
}

/**
 * แปลงเวลาเป็นรูปแบบที่อ่านง่าย เช่น "3 นาที 45 วินาที"
 * @param ms เวลาในหน่วยมิลลิวินาที
 * @returns สตริงในรูปแบบที่อ่านง่าย
 */
export function formatDurationText(ms: number): string {
    if (!ms || isNaN(ms)) return '0 วินาที';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    const parts = [];
    
    if (hours > 0) {
        parts.push(`${hours} ชั่วโมง`);
    }
    
    if (minutes > 0) {
        parts.push(`${minutes} นาที`);
    }
    
    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds} วินาที`);
    }
    
    return parts.join(' ');
}