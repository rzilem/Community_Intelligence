// Enhanced PWA Service for Phase 3 - Mobile Features

import { supabase } from '@/integrations/supabase/client';

export interface OfflineData {
  documents: any[];
  forms: any[];
  announcements: any[];
  lastSync: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface CameraCapture {
  id: string;
  file: File;
  type: 'maintenance' | 'violation' | 'document' | 'general';
  location?: GeolocationData;
  metadata?: Record<string, any>;
}

export class EnhancedPWAService {
  private dbName = 'CommunityIntelligenceOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Offline Data Management
  async initializeOfflineDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for offline data
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('forms')) {
          db.createObjectStore('forms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('announcements')) {
          db.createObjectStore('announcements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      };
    });
  }

  async syncOfflineData(associationId: string): Promise<OfflineData> {
    if (!navigator.onLine) {
      return this.getOfflineData();
    }

    try {
      // Fetch latest data
      const [documents, forms, announcements] = await Promise.all([
        this.fetchDocuments(associationId),
        this.fetchForms(associationId),
        this.fetchAnnouncements(associationId)
      ]);

      const offlineData: OfflineData = {
        documents,
        forms,
        announcements,
        lastSync: new Date().toISOString()
      };

      // Store in IndexedDB
      await this.storeOfflineData(offlineData);
      
      return offlineData;
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      return this.getOfflineData();
    }
  }

  private async fetchDocuments(associationId: string): Promise<any[]> {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_public', true)
      .limit(50);
    return data || [];
  }

  private async fetchForms(associationId: string): Promise<any[]> {
    const { data } = await supabase
      .from('forms')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true);
    return data || [];
  }

  private async fetchAnnouncements(associationId: string): Promise<any[]> {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_published', true)
      .gte('expiry_date', new Date().toISOString())
      .limit(20);
    return data || [];
  }

  private async storeOfflineData(data: OfflineData): Promise<void> {
    if (!this.db) await this.initializeOfflineDB();
    if (!this.db) throw new Error('Failed to initialize offline database');

    const transaction = this.db.transaction(['documents', 'forms', 'announcements'], 'readwrite');
    
    // Store each data type
    const documentsStore = transaction.objectStore('documents');
    const formsStore = transaction.objectStore('forms');
    const announcementsStore = transaction.objectStore('announcements');

    // Clear and store documents
    await documentsStore.clear();
    data.documents.forEach(doc => documentsStore.add(doc));

    // Clear and store forms
    await formsStore.clear();
    data.forms.forEach(form => formsStore.add(form));

    // Clear and store announcements
    await announcementsStore.clear();
    data.announcements.forEach(announcement => announcementsStore.add(announcement));
  }

  async getOfflineData(): Promise<OfflineData> {
    if (!this.db) await this.initializeOfflineDB();
    if (!this.db) throw new Error('Offline database not available');

    const transaction = this.db.transaction(['documents', 'forms', 'announcements'], 'readonly');
    
    const [documents, forms, announcements] = await Promise.all([
      this.getAllFromStore(transaction.objectStore('documents')),
      this.getAllFromStore(transaction.objectStore('forms')),
      this.getAllFromStore(transaction.objectStore('announcements'))
    ]);

    return {
      documents,
      forms,
      announcements,
      lastSync: localStorage.getItem('lastOfflineSync') || ''
    };
  }

  private getAllFromStore(store: IDBObjectStore): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Camera Integration
  async capturePhoto(type: CameraCapture['type']): Promise<CameraCapture | null> {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not available');
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Create canvas for capture
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Capture frame
      context?.drawImage(video, 0, 0);
      
      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob/file
      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const location = await this.getCurrentLocation();
          
          const capture: CameraCapture = {
            id: crypto.randomUUID(),
            file,
            type,
            location,
            metadata: {
              capturedAt: new Date().toISOString(),
              resolution: `${canvas.width}x${canvas.height}`
            }
          };

          // Store offline if needed
          await this.storePhotoOffline(capture);
          
          resolve(capture);
        }, 'image/jpeg', 0.9);
      });

    } catch (error) {
      console.error('Failed to capture photo:', error);
      return null;
    }
  }

  async uploadCapturedPhoto(capture: CameraCapture, associationId: string): Promise<string | null> {
    try {
      const fileName = `${associationId}/${capture.type}/${capture.id}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('maintenance-photos')
        .upload(fileName, capture.file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('maintenance-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload photo:', error);
      return null;
    }
  }

  private async storePhotoOffline(capture: CameraCapture): Promise<void> {
    if (!this.db) await this.initializeOfflineDB();
    if (!this.db) return;

    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');
    
    // Convert file to base64 for storage
    const base64 = await this.fileToBase64(capture.file);
    
    store.add({
      ...capture,
      file: base64,
      uploaded: false
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Location Services
  async getCurrentLocation(): Promise<GeolocationData | undefined> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('Failed to get location:', error);
          resolve(undefined);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      const data = await response.json();
      return data.locality || data.city || 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  // Form Draft Management
  async saveDraft(formId: string, formData: any): Promise<void> {
    if (!this.db) await this.initializeOfflineDB();
    if (!this.db) return;

    const draft = {
      id: `${formId}_draft`,
      formId,
      data: formData,
      savedAt: new Date().toISOString()
    };

    const transaction = this.db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    store.put(draft);
  }

  async loadDraft(formId: string): Promise<any | null> {
    if (!this.db) await this.initializeOfflineDB();
    if (!this.db) return null;

    const transaction = this.db.transaction(['drafts'], 'readonly');
    const store = transaction.objectStore('drafts');
    
    return new Promise((resolve) => {
      const request = store.get(`${formId}_draft`);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => resolve(null);
    });
  }

  async deleteDraft(formId: string): Promise<void> {
    if (!this.db) await this.initializeOfflineDB();
    if (!this.db) return;

    const transaction = this.db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    store.delete(`${formId}_draft`);
  }

  // Enhanced Push Notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }

  async subscribeToPushNotifications(
    registration: ServiceWorkerRegistration,
    userId: string,
    associationId: string
  ): Promise<void> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          association_id: associationId,
          subscription: JSON.stringify(subscription),
          is_active: true
        });

    } catch (error) {
      console.error('Push notification subscription failed:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Offline Queue Management
  async queueOfflineAction(action: any): Promise<void> {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push({
      ...action,
      id: crypto.randomUUID(),
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
  }

  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return;

    const processed = [];
    
    for (const action of queue) {
      try {
        await this.processQueuedAction(action);
        processed.push(action.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }

    // Remove processed actions
    const remainingQueue = queue.filter((action: any) => 
      !processed.includes(action.id)
    );
    localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));
  }

  private async processQueuedAction(action: any): Promise<void> {
    switch (action.type) {
      case 'upload_photo':
        await this.uploadCapturedPhoto(action.capture, action.associationId);
        break;
      case 'submit_form':
        await supabase.from(action.table).insert(action.data);
        break;
      case 'update_record':
        await supabase.from(action.table).update(action.data).eq('id', action.id);
        break;
      default:
        console.warn('Unknown queued action type:', action.type);
    }
  }
}

export const enhancedPWAService = new EnhancedPWAService();