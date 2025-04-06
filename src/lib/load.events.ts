import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

import { logger } from "@/lib/color";

export async function loadEvents(client: Client) {
    const eventsPath = join(__dirname, "../events");
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
        try {
            const eventModule = await import(join(eventsPath, file));
            const event = eventModule.default;

            if (!event || !event.name || !event.execute) {
                logger.warn(`[EVENT] ข้ามไฟล์ ${file} เพราะไม่มี structure ที่ถูกต้อง`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }

            logger.info(`[EVENT] โหลด event: ${event.name}`);
        } catch (err) {
            logger.error(`[EVENT] โหลด event ล้มเหลว: ${file} error: ${err}`);
        }
    }

    logger.success(`[EVENT] Loaded ${eventFiles.length} events`);
}