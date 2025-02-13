// lib/contentlayer/rebuildContentlayer.ts

import { exec } from 'child_process';

export async function rebuildContentlayer() {
    // Only run in production to avoid unnecessary rebuilds in dev
    if (process.env.NODE_ENV !== 'production') {
        return;
    }
    try {
        // Execute the Contentlayer CLI to rebuild content
        await new Promise<void>((resolve, reject) => {
            exec('npx contentlayer build', (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                console.log(stdout);  // optional: log Contentlayer output
                resolve();
            });
        });
        console.log('✅ Contentlayer regeneration complete.');
    } catch (err) {
        console.error('❌ Failed to rebuild Contentlayer:', err);
    }
}
