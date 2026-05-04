/**
 * Day 5: Offline Queue Manager
 * IndexedDB-based queue for offline submissions with auto-sync
 */

import { openDB } from 'idb';
import logger from './logger';

class OfflineQueue {
  constructor() {
    this.db = null;
    this.dbName = 'SmartHiringOffline';
    this.version = 1;
    this.syncInProgress = false;
  }

  async init() {
    if (this.db) return this.db;

    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        // Submissions store
        if (!db.objectStoreNames.contains('submissions')) {
          const submissionStore = db.createObjectStore('submissions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          submissionStore.createIndex('timestamp', 'timestamp');
          submissionStore.createIndex('status', 'status');
        }

        // Draft answers store
        if (!db.objectStoreNames.contains('answers')) {
          const answerStore = db.createObjectStore('answers', { 
            keyPath: 'questionId' 
          });
          answerStore.createIndex('interviewId', 'interviewId');
        }
      }
    });

    return this.db;
  }

  async enqueue(submission) {
    await this.init();

    const item = {
      data: submission,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      lastError: null
    };

    const id = await this.db.add('submissions', item);
    logger.info(`Queued submission ${id} for offline sync`);
    
    return id;
  }

  async saveDraftAnswer(interviewId, questionId, answer) {
    await this.init();

    const draft = {
      questionId,
      interviewId,
      answer,
      savedAt: new Date().toISOString()
    };

    await this.db.put('answers', draft);
    logger.info(`Saved draft answer for question ${questionId}`);
  }

  async getDraftAnswers(interviewId) {
    await this.init();

    const tx = this.db.transaction('answers', 'readonly');
    const index = tx.store.index('interviewId');
    const answers = await index.getAll(interviewId);

    return answers.reduce((acc, draft) => {
      acc[draft.questionId] = draft.answer;
      return acc;
    }, {});
  }

  async syncAll(apiClient) {
    if (this.syncInProgress) {
      logger.warn('Sync already in progress');
      return { success: false, reason: 'sync_in_progress' };
    }

    if (!navigator.onLine) {
      logger.warn('Cannot sync: offline');
      return { success: false, reason: 'offline' };
    }

    this.syncInProgress = true;

    try {
      await this.init();

      const submissions = await this.db.getAll('submissions');
      const pending = submissions.filter(s => s.status === 'pending');

      logger.info(`Syncing ${pending.length} pending submissions`);

      let synced = 0;
      let failed = 0;

      for (const submission of pending) {
        try {
          // Attempt to submit
          await apiClient.submit(submission.data);

          // Success - remove from queue
          await this.db.delete('submissions', submission.id);
          synced++;

          logger.info(`Synced submission ${submission.id}`);

        } catch (error) {
          // Failed - update retry count
          submission.retryCount++;
          submission.lastError = error.message;
          submission.status = submission.retryCount >= 3 ? 'failed' : 'pending';

          await this.db.put('submissions', submission);
          failed++;

          logger.error(`Failed to sync submission ${submission.id}`, error);

          // Exponential backoff
          if (submission.retryCount < 3) {
            const delay = Math.pow(2, submission.retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      return {
        success: true,
        synced,
        failed,
        total: pending.length
      };

    } finally {
      this.syncInProgress = false;
    }
  }

  async getPendingCount() {
    await this.init();
    const submissions = await this.db.getAll('submissions');
    return submissions.filter(s => s.status === 'pending').length;
  }

  async clearAll() {
    await this.init();
    await this.db.clear('submissions');
    await this.db.clear('answers');
    logger.info('Cleared offline queue');
  }

  async getFailedSubmissions() {
    await this.init();
    const submissions = await this.db.getAll('submissions');
    return submissions.filter(s => s.status === 'failed');
  }
}

// Singleton instance
let offlineQueue = null;

export function getOfflineQueue() {
  if (!offlineQueue) {
    offlineQueue = new OfflineQueue();
  }
  return offlineQueue;
}

export default OfflineQueue;
