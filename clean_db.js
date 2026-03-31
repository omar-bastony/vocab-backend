import { Redis } from '@upstash/redis';
import 'dotenv/config';

// Connect to your live database
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function cleanDatabase() {
    console.log("🧹 Starting Database Cleanup...");
    
    let deletedCount = 0;
    let cursor = '0';

    do {
        // Scan for all translation keys
        const [nextCursor, keys] = await redis.scan(cursor, { match: 'trans:all:*', count: 100 });
        cursor = nextCursor;

        for (const key of keys) {
            // Extract the word from the key (e.g., "trans:all:apfel" -> "apfel")
            const word = key.replace('trans:all:', '');
            
            // If the word is insanely long, or has too many spaces, DELETE IT!
            if (word.length > 45 || word.split(' ').length > 4) {
                console.log(`🗑️ Deleting bad entry: "${word.substring(0, 30)}..."`);
                await redis.del(key);
                deletedCount++;
            }
        }
    } while (cursor !== '0');

    console.log(`✅ Cleanup Complete! Deleted ${deletedCount} bad entries from Upstash.`);
}

cleanDatabase();