// =====================================
// backend/src/integrations/vector-db/qdrant-client.ts
// =====================================

import { QdrantClient as QdrantSDK } from '@qdrant/js-client-rest';
import { logger } from '../../utils/logger';
import { config } from '../../utils/config';

export interface CollectionConfig {
  vectors: {
    size: number;
    distance: 'Cosine' | 'Euclid' | 'Dot';
  };
  optimizers_config?: {
    default_segment_number?: number;
  };
  replication_factor?: number;
}

export interface Point {
  id: string | number;
  vector: number[];
  payload?: Record<string, any>;
}

export interface SearchResult {
  id: string | number;
  score: number;
  payload?: Record<string, any>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  with_payload?: boolean;
  with_vector?: boolean;
  filter?: Record<string, any>;
  score_threshold?: number;
}

export class QdrantClient {
  private client: QdrantSDK;
  private isConnected: boolean = false;

  constructor() {
    this.client = new QdrantSDK({
      url: config.vectorDbUrl,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test connection
      await this.client.getCollections();
      this.isConnected = true;
      logger.info('Qdrant vector database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Qdrant:', error);
      throw new Error('Qdrant connection failed');
    }
  }

  async createCollection(
    name: string, 
    config: CollectionConfig
  ): Promise<void> {
    try {
      const exists = await this.collectionExists(name);
      if (exists) {
        logger.info(`Collection ${name} already exists`);
        return;
      }

      await this.client.createCollection(name, config);
      logger.info(`Collection ${name} created successfully`);
    } catch (error) {
      logger.error(`Failed to create collection ${name}:`, error);
      throw error;
    }
  }

  async collectionExists(name: string): Promise<boolean> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.some(col => col.name === name);
    } catch (error) {
      logger.error(`Failed to check if collection ${name} exists:`, error);
      return false;
    }
  }

  async deleteCollection(name: string): Promise<void> {
    try {
      await this.client.deleteCollection(name);
      logger.info(`Collection ${name} deleted successfully`);
    } catch (error) {
      logger.error(`Failed to delete collection ${name}:`, error);
      throw error;
    }
  }

  async upsertPoints(
    collection: string, 
    points: Point[]
  ): Promise<void> {
    try {
      await this.client.upsert(collection, {
        wait: true,
        points: points
      });
      logger.debug(`Upserted ${points.length} points to collection ${collection}`);
    } catch (error) {
      logger.error(`Failed to upsert points to collection ${collection}:`, error);
      throw error;
    }
  }

  async searchSimilar(
    collection: string,
    query: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        limit = 10,
        offset = 0,
        with_payload = true,
        with_vector = false,
        filter,
        score_threshold
      } = options;

      const searchParams: any = {
        vector: query,
        limit,
        offset,
        with_payload,
        with_vector,
      };

      if (filter) {
        searchParams.filter = filter;
      }

      if (score_threshold !== undefined) {
        searchParams.score_threshold = score_threshold;
      }

      const result = await this.client.search(collection, searchParams);
      
      return result.map(hit => ({
        id: hit.id,
        score: hit.score,
        payload: hit.payload || undefined
      }));
    } catch (error) {
      logger.error(`Failed to search in collection ${collection}:`, error);
      throw error;
    }
  }

  async getCollectionInfo(name: string): Promise<any> {
    try {
      return await this.client.getCollection(name);
    } catch (error) {
      logger.error(`Failed to get collection info for ${name}:`, error);
      throw error;
    }
  }

  async getCollectionStats(name: string): Promise<any> {
    try {
      const info = await this.getCollectionInfo(name);
      return {
        points_count: info.points_count,
        segments_count: info.segments_count,
        status: info.status
      };
    } catch (error) {
      logger.error(`Failed to get collection stats for ${name}:`, error);
      throw error;
    }
  }

  async deletePoints(
    collection: string,
    pointIds: (string | number)[]
  ): Promise<void> {
    try {
      await this.client.delete(collection, {
        wait: true,
        points: pointIds
      });
      logger.debug(`Deleted ${pointIds.length} points from collection ${collection}`);
    } catch (error) {
      logger.error(`Failed to delete points from collection ${collection}:`, error);
      throw error;
    }
  }

  async updatePoints(
    collection: string,
    points: Point[]
  ): Promise<void> {
    try {
      await this.client.upsert(collection, {
        wait: true,
        points: points
      });
      logger.debug(`Updated ${points.length} points in collection ${collection}`);
    } catch (error) {
      logger.error(`Failed to update points in collection ${collection}:`, error);
      throw error;
    }
  }

  async scrollPoints(
    collection: string,
    limit: number = 100,
    offset?: string | number
  ): Promise<{ points: Point[], next_page_offset?: string | number }> {
    try {
      const result = await this.client.scroll(collection, {
        limit,
        offset
      });

      return {
        points: result.points.map(point => ({
          id: point.id,
          vector: point.vector as number[],
          payload: point.payload || undefined
        })),
        next_page_offset: typeof result.next_page_offset === 'object' ? undefined : result.next_page_offset || undefined
      };
    } catch (error) {
      logger.error(`Failed to scroll points in collection ${collection}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      logger.error('Qdrant health check failed:', error);
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const qdrantClient = new QdrantClient();
