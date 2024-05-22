import redis from 'ioredis';

const redisClient = new redis(6379, "34.28.116.231");

export default redisClient;