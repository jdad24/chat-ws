import { createClient } from 'redis';

class RedisClient {
    private client;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));

        this.client.connect().then(() => {
            console.log('Connected to Redis');
        }).catch((err) => {
            console.error('Failed to connect to Redis:', err);
        });
    }

    async publish(channel: string, message: string) {
        await this.client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void) {
        const subscriber = this.client.duplicate();
        await subscriber.connect();
        await subscriber.subscribe(channel, (message) => {
            callback(message);
        });
    }

    async lPush(key: string, value: string) {
        await this.client.lPush(key, value);
    }

    async lRange(key: string, start: number, stop: number): Promise<string[]> {
        return await this.client.lRange(key, start, stop)
    }
}

export default RedisClient;


// //Upstash Redis URL
// const redisClient = createClient({
//     url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// redisClient.connect().then(() => {
//     console.log('Connected to Redis');
// }).catch((err) => {
//     console.error('Failed to connect to Redis:', err);
// });

// export default redisClient;