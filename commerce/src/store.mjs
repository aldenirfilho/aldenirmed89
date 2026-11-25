import { DatabaseSync } from 'node:sqlite';

export class Store {
  constructor(filename) {
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS customers (user_id TEXT PRIMARY KEY, customer_id TEXT UNIQUE NOT NULL);
      CREATE TABLE IF NOT EXISTS subscriptions (
        provider TEXT NOT NULL, subscription_id TEXT NOT NULL,
        subject TEXT NOT NULL, tier TEXT, status TEXT NOT NULL,
        paid_until INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0,
        risk_block INTEGER NOT NULL DEFAULT 0, cancel_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY(provider,subscription_id));
      CREATE TABLE IF NOT EXISTS events (
        provider TEXT NOT NULL, event_id TEXT NOT NULL, type TEXT NOT NULL,
        processed_at INTEGER NOT NULL, PRIMARY KEY(provider,event_id));
      CREATE TABLE IF NOT EXISTS risk_holds (
        provider TEXT NOT NULL, subscription_id TEXT NOT NULL, reason TEXT NOT NULL,
        PRIMARY KEY(provider,subscription_id));
      CREATE TABLE IF NOT EXISTS checkout_attempts (
        user_id TEXT PRIMARY KEY, attempt_key TEXT NOT NULL, payload_json TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS checkout_pending (
        user_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, url TEXT NOT NULL,
        tier TEXT NOT NULL, expires_at INTEGER NOT NULL);
    `);
  }
  close() { this.db.close(); }
  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); this.db.exec('COMMIT'); return value; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  seen(provider, id) { return !!this.db.prepare('SELECT 1 FROM events WHERE provider=? AND event_id=?').get(provider,id); }
  event(provider,id,type,now) { this.db.prepare('INSERT INTO events VALUES (?,?,?,?)').run(provider,id,type,now); }
  customer(userId) { return this.db.prepare('SELECT customer_id FROM customers WHERE user_id=?').get(userId)?.customer_id; }
  owner(customerId) { return this.db.prepare('SELECT user_id FROM customers WHERE customer_id=?').get(customerId)?.user_id; }
  linkCustomer(userId,customerId) { this.db.prepare('INSERT INTO customers VALUES (?,?)').run(userId,customerId); }
  get(provider,id) { return this.db.prepare('SELECT * FROM subscriptions WHERE provider=? AND subscription_id=?').get(provider,id); }
  put(row) {
    const existing=this.get(row.provider,row.subscription_id);
    if(existing && row.updated_at < existing.updated_at) return;
    if(existing && existing.subject !== row.subject) throw new Error('subscription_owner_conflict');
    this.db.prepare(`INSERT INTO subscriptions VALUES (?,?,?,?,?,?,?,?,?)
      ON CONFLICT(provider,subscription_id) DO UPDATE SET
      tier=excluded.tier,status=excluded.status,paid_until=excluded.paid_until,
      updated_at=excluded.updated_at,risk_block=MAX(subscriptions.risk_block,excluded.risk_block),cancel_at=excluded.cancel_at`)
      .run(row.provider,row.subscription_id,row.subject,row.tier ?? null,row.status,row.paid_until,row.updated_at,row.risk_block||0,row.cancel_at||0);
  }
  hold(provider,id,reason) {
    this.db.prepare('INSERT OR IGNORE INTO risk_holds VALUES (?,?,?)').run(provider,id,reason);
    this.db.prepare('UPDATE subscriptions SET risk_block=1 WHERE provider=? AND subscription_id=?').run(provider,id);
  }
  held(provider,id) {return !!this.db.prepare('SELECT 1 FROM risk_holds WHERE provider=? AND subscription_id=?').get(provider,id);}
  subscriptions(userId,emailHash) {
    return this.db.prepare('SELECT provider,subscription_id,tier,status,paid_until,risk_block,cancel_at FROM subscriptions WHERE subject=? OR subject=?').all('user:'+userId,'email:'+emailHash);
  }
  pending(userId,now) {return this.db.prepare('SELECT * FROM checkout_pending WHERE user_id=? AND expires_at>?').get(userId,now);}
  setPending(userId,s) {this.db.prepare('INSERT OR REPLACE INTO checkout_pending VALUES (?,?,?,?,?)').run(userId,s.id,s.url,s.tier,s.expires_at);}
  attempt(userId) {return this.db.prepare('SELECT * FROM checkout_attempts WHERE user_id=?').get(userId);}
  setAttempt(userId,key,payload,now) {this.db.prepare('INSERT INTO checkout_attempts VALUES (?,?,?,?)').run(userId,key,JSON.stringify(payload),now);}
  completeAttempt(userId,s) {this.transaction(()=>{this.setPending(userId,s);this.db.prepare('DELETE FROM checkout_attempts WHERE user_id=?').run(userId);});}
  clearPending(userId) {this.db.prepare('DELETE FROM checkout_pending WHERE user_id=?').run(userId);this.db.prepare('DELETE FROM checkout_attempts WHERE user_id=?').run(userId);}
}
