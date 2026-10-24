/**
 * Server-Sent Events (SSE) 实时推流管理中心
 * 用于向所有在线浏览页面毫秒级广播最新抓取的新闻与指标更新
 */
class SSEManager {
  constructor() {
    this.clients = new Set();
    this.heartbeatTimer = null;
    this.startHeartbeat();
  }

  startHeartbeat() {
    // 每 25 秒向所有长连接客户端发送保活心跳包
    this.heartbeatTimer = setInterval(() => {
      this.broadcast('ping', { time: Date.now() });
    }, 25000);
  }

  addClient(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    this.clients.add(res);

    // 立即向新连入的客户端发送欢迎与当前客户端总数
    res.write(`event: connected\ndata: ${JSON.stringify({ message: '智讯枢纽实时流已成功建立', clientCount: this.clients.size })}\n\n`);

    // 广播最新的在线用户数
    this.broadcast('stats_update', { connectedClients: this.clients.size });

    req.on('close', () => {
      this.clients.delete(res);
      this.broadcast('stats_update', { connectedClients: this.clients.size });
    });
  }

  /**
   * 广播事件给所有客户端
   * @param {string} event 
   * @param {object} data 
   */
  broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  getClientCount() {
    return this.clients.size;
  }

  closeAll() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    for (const client of this.clients) {
      try {
        client.write('event: shutdown\ndata: {}\n\n');
        client.end();
      } catch (_) {}
    }
    this.clients.clear();
  }
}

module.exports = new SSEManager();
