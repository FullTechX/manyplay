import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadEvents(client: Client) {
    const eventsPath = join(__dirname, "../events");
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
        try {
            const eventModule = await import(join(eventsPath, file));
            const event = eventModule.default;

            if (!event || !event.name || !event.execute) {
                console.warn(`! ข้ามไฟล์ ${file} เพราะไม่มี structure ที่ถูกต้อง`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }

            console.log(`โหลด event: ${event.name}`);
        } catch (err) {
            console.error(`!!!โหลด event ล้มเหลว: ${file}`, err);
        }
    }

    console.log(`Loaded ${eventFiles.length} events`);
}