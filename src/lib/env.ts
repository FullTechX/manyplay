import fs from 'fs';
import path from 'path';
import { logger } from '@/lib/color';

/**
 * ฟังก์ชันสำหรับตรวจสอบและตรวจสอบความถูกต้องของไฟล์ .env
 * จะออกจากโปรแกรม (exit) โดยอัตโนมัติหากไม่พบตัวแปรที่กำหนด
 * 
 * @param filePath ที่อยู่ของไฟล์ .env
 * @param requiredVars รายการตัวแปรที่จำเป็น
 * @param exitOnEmpty หากเป็น true จะ exit หากตัวแปรไม่มีค่า (ว่างเปล่า)
 * @returns true หากผ่านการตรวจสอบทั้งหมด, ไม่คืนค่าหาก exit
 */
export async function checkEnvFile(filePath: string = '.env', requiredVars: string[] = [], exitOnEmpty: boolean = true): Promise<boolean> {
    try {
        if (!fs.existsSync(filePath)) {
            logger.error(`[ENV] ไม่พบไฟล์ .env ที่ ${filePath}`);
            logger.warn(`[ENV] กรุณาสร้างไฟล์ .env จาก .env.example (ถ้ามี)`);
            process.exit(1);
        }

        const envFileContent = fs.readFileSync(filePath, 'utf8');
        const envVars: Record<string, string | null> = {};
        const lines = envFileContent.split('\n');
        
        for (const line of lines) {
            if (line.trim() === '' || line.trim().startsWith('#')) continue;
            
            const matches = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (matches && matches[1]) {
                const key = matches[1];
                let value = matches[2] || '';
                
                value = value.replace(/^['"]|['"]$/g, '');
                envVars[key] = value.trim() === '' ? null : value.trim();
            }
        }
        
        const missingVars: string[] = [];
        const emptyVars: string[] = [];
        
        if (requiredVars.length > 0) {
            for (const varName of requiredVars) {
                const cleanVarName = varName.trim();
                if (!(cleanVarName in envVars)) {
                missingVars.push(cleanVarName);
                } else if (envVars[cleanVarName] === null) {
                emptyVars.push(cleanVarName);
                }
            }
        }
        
        logger.warn(`[ENV] พบไฟล์ .env ที่ ${path.resolve(filePath)}`);
        logger.warn(`[ENV] พบตัวแปรทั้งหมด ${Object.keys(envVars).length} ตัว`);
        
        logger.warn('\n[ENV] รายงานสถานะตัวแปร:');
        for (const [key, value] of Object.entries(envVars)) {
            if (value === null) {
                logger.error(`[ENV] ${key}: ไม่มีค่ากำหนด`);
            } else {
                const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
                logger.info(`[ENV] ${key}: ${displayValue}`);
            }
        }
        
        if (requiredVars.length > 0) {
            logger.warn('\n[ENV] ตรวจสอบตัวแปรที่จำเป็น:');
        
            if (missingVars.length > 0) {
                logger.error(`[ENV] ไม่พบตัวแปรที่จำเป็น: ${missingVars.join(', ')}`);
                logger.error('[ENV] โปรแกรมกำลังหยุดทำงานเนื่องจากไม่พบตัวแปรที่จำเป็น');
                process.exit(1);
            }
        
            if (exitOnEmpty && emptyVars.length > 0) {
                logger.error(`[ENV] ตัวแปรที่จำเป็นไม่มีค่ากำหนด: ${emptyVars.join(', ')}`);
                logger.error('[ENV] โปรแกรมกำลังหยุดทำงานเนื่องจากตัวแปรที่จำเป็นไม่มีค่ากำหนด');
                process.exit(1);
            } else if (emptyVars.length > 0) {
                logger.warn(`[ENV] ตัวแปรที่ไม่มีค่ากำหนด: ${emptyVars.join(', ')}`);
            }
        
            if (missingVars.length === 0 && (exitOnEmpty === false || emptyVars.length === 0)) {
                logger.warn('[ENV] มีการกำหนดค่าตัวแปรที่จำเป็นทั้งหมดแล้ว');
            }
        }
        
        return true;
    } catch (error) {
        logger.error('[ENV] เกิดข้อผิดพลาดในการตรวจสอบไฟล์ .env:', error);
        process.exit(1);
    }
}

if (import.meta.main) {
    const args = Bun.argv.slice(2);
    let filePath = '.env';
    let requiredVars: string[] = [];
    let exitOnEmpty = true;
    
    if (args.length > 0 && !args[0].startsWith('--')) {
        filePath = args[0];
    }
    
    const requireIndex = args.indexOf('--require');
    if (requireIndex !== -1 && args.length > requireIndex + 1) {
        requiredVars = args[requireIndex + 1].split(',');
    }
    
    if (args.includes('--allow-empty')) {
        exitOnEmpty = false;
    }
    
    checkEnvFile(filePath, requiredVars, exitOnEmpty);
}