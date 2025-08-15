// IndexedDB utility for managing clipboard images
class ClipboardImageDB {
  constructor() {
    this.dbName = 'SideClipDB';
    this.version = 1;
    this.storeName = 'images';
    this.db = null;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for images if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Created images object store');
        }
      };
    });
  }

  // Store image blob
  async storeImage(imageData) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        // Generate unique ID with timestamp + random component
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const imageRecord = {
          id: uniqueId,
          blob: imageData.blob,
          url: imageData.url || '',
          size: imageData.size || 0,
          type: imageData.type || 'image/png',
          timestamp: new Date().toISOString()
        };

        // Validate blob data
        if (!imageData.blob || !(imageData.blob instanceof Blob)) {
          console.error('Invalid blob data provided');
          reject(new Error('Invalid blob data'));
          return;
        }

        const request = store.add(imageRecord);

        request.onsuccess = () => {
          console.log('Image stored successfully:', imageRecord.id);
          resolve(imageRecord);
        };

        request.onerror = (event) => {
          const error = event.target.error;
          console.error('Error storing image:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
          });
          
          // If constraint error (duplicate key), try with new ID
          if (error.name === 'ConstraintError') {
            console.log('Duplicate key detected, retrying with new ID...');
            setTimeout(() => {
              this.storeImage(imageData).then(resolve).catch(reject);
            }, 10);
          } else {
            reject(error);
          }
        };

        transaction.onerror = (event) => {
          console.error('Transaction error:', event.target.error);
          reject(event.target.error);
        };

        transaction.onabort = (event) => {
          console.error('Transaction aborted:', event.target.error);
          reject(new Error('Transaction aborted'));
        };

      } catch (error) {
        console.error('Exception in storeImage:', error);
        reject(error);
      }
    });
  }

  // Get all images
  async getAllImages() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Error getting images:', request.error);
        reject(request.error);
      };
    });
  }

  // Delete image by ID
  async deleteImage(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Image deleted successfully:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting image:', request.error);
        reject(request.error);
      };
    });
  }

  // Clear all images
  async clearAllImages() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All images cleared successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing images:', request.error);
        reject(request.error);
      };
    });
  }

  // Get storage usage
  async getStorageUsage() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 0 };
    }
    
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercentage: estimate.quota ? (estimate.usage / estimate.quota * 100) : 0
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { usage: 0, quota: 0, usagePercentage: 0 };
    }
  }

  // Clean old images if storage is getting full
  async cleanOldImages(maxItems = 50) {
    if (!this.db) await this.init();
    
    try {
      const images = await this.getAllImages();
      
      if (images.length <= maxItems) {
        return;
      }

      // Sort by timestamp (oldest first)
      images.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Delete oldest items
      const itemsToDelete = images.length - maxItems;
      for (let i = 0; i < itemsToDelete; i++) {
        await this.deleteImage(images[i].id);
      }
      
      console.log(`Cleaned ${itemsToDelete} old images`);
    } catch (error) {
      console.error('Error cleaning old images:', error);
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClipboardImageDB;
}
