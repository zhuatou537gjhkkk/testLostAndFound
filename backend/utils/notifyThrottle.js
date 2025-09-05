// utils/notifyThrottleRedis.js
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

/**
 * Redis 控制防骚扰
 */
async function shouldNotify(userId, type = 'email', cooldownSeconds = 3600) {
  const key = `notify:${userId}:${type}`;
  const last = await getAsync(key);
  if (last) return false;

  await setAsync(key, Date.now().toString(), 'EX', cooldownSeconds);
  return true;
}

module.exports = { shouldNotify };
