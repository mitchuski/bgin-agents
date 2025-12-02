// =====================================
// backend/src/integrations/discourse-api/discourse-client.ts
// =====================================

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';
import { config } from '../../utils/config';

export interface DiscourseTopic {
  id: number;
  title: string;
  slug: string;
  posts_count: number;
  reply_count: number;
  highest_post_number: number;
  created_at: string;
  last_posted_at: string;
  bumped: boolean;
  bumped_at: string;
  archetype: string;
  unseen: boolean;
  pinned: boolean;
  unpinned: boolean;
  visible: boolean;
  closed: boolean;
  archived: boolean;
  bookmarked: boolean;
  liked: boolean;
  tags: string[];
  category_id: number;
  user_id: number;
  last_poster_username: string;
  last_poster_id: number;
  last_post_id: number;
  views: number;
  like_count: number;
  has_summary: boolean;
  last_post_smiley: string;
  chunked: boolean;
  pinned_globally: boolean;
  featured_link: string;
  featured_link_root_domain: string;
  posters: Array<{
    extras: string;
    description: string;
    user_id: number;
    primary_group_id: number;
    flair_group_id: number;
  }>;
}

export interface DiscoursePost {
  id: number;
  name: string;
  username: string;
  avatar_template: string;
  created_at: string;
  cooked: string;
  post_number: number;
  post_type: number;
  updated_at: string;
  reply_count: number;
  reply_to_post_number: number;
  quote_count: number;
  incoming_link_count: number;
  reads: number;
  score: number;
  yours: boolean;
  topic_id: number;
  topic_slug: string;
  display_username: string;
  primary_group_name: string;
  flair_name: string;
  flair_url: string;
  flair_bg_color: string;
  flair_color: string;
  version: number;
  can_edit: boolean;
  can_delete: boolean;
  can_recover: boolean;
  can_wiki: boolean;
  read: boolean;
  user_title: string;
  bookmarked: boolean;
  actions_summary: Array<{
    id: number;
    count: number;
    hidden: boolean;
    can_act: boolean;
  }>;
  moderator: boolean;
  admin: boolean;
  staff: boolean;
  user_id: number;
  hidden: boolean;
  trust_level: number;
  deleted_at: string;
  user_deleted: boolean;
  edit_reason: string;
  can_view_edit_history: boolean;
  wiki: boolean;
  reviewable_id: number;
  reviewable_score_count: number;
  reviewable_score_pending_count: number;
}

export interface DiscourseCategory {
  id: number;
  name: string;
  color: string;
  text_color: string;
  slug: string;
  topic_count: number;
  post_count: number;
  position: number;
  description: string;
  description_text: string;
  description_excerpt: string;
  topic_url: string;
  read_restricted: boolean;
  permission: number;
  notification_level: number;
  topic_template: string;
  has_children: boolean;
  sort_order: string;
  sort_ascending: boolean;
  show_subcategory_list: boolean;
  num_featured_topics: number;
  default_view: string;
  subcategory_list_style: string;
  default_top_period: string;
  default_list_filter: string;
  minimum_required_tags: number;
  navigate_to_first_post_after_read: boolean;
  custom_fields: Record<string, any>;
  allowed_tags: string[];
  allowed_tag_groups: string[];
  allow_global_tags: boolean;
  read_only_banner: string;
  logo_url: string;
  background_url: string;
  allow_badges: boolean;
  topic_featured_link_allowed: boolean;
  all_topics_wiki: boolean;
  subcategory_ids: number[];
  uploaded_logo: any;
  uploaded_background: any;
}

export interface DiscourseUser {
  id: number;
  username: string;
  name: string;
  avatar_template: string;
  email: string;
  last_posted_at: string;
  last_seen_at: string;
  created_at: string;
  ignored: boolean;
  muted: boolean;
  can_ignore_user: boolean;
  can_mute_user: boolean;
  can_send_private_messages: boolean;
  can_send_private_message_to_user: boolean;
  trust_level: number;
  moderator: boolean;
  admin: boolean;
  title: string;
  badge_count: number;
  user_fields: Record<string, any>;
  custom_fields: Record<string, any>;
  time_read: number;
  recent_time_read: number;
  primary_group_id: number;
  primary_group_name: string;
  flair_name: string;
  flair_url: string;
  flair_bg_color: string;
  flair_color: string;
  featured_user_badge_ids: number[];
  staged: boolean;
  can_edit: boolean;
  can_edit_username: boolean;
  can_edit_email: boolean;
  can_edit_name: boolean;
  can_edit_title: boolean;
  can_edit_primary_group: boolean;
  can_edit_trust_level: boolean;
  can_edit_staged: boolean;
}

export class DiscourseClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private isConnected: boolean = false;

  constructor() {
    this.baseUrl = process.env.DISCOURSE_URL || 'https://discourse.bgin.org';
    this.apiKey = config.discourseApiKey || '';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Api-Key': this.apiKey,
        'Api-Username': 'system',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request/response interceptors
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Discourse API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Discourse API request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Discourse API response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Discourse API response error:', error);
        return Promise.reject(error);
      }
    );
  }

  async initialize(): Promise<void> {
    try {
      // Test connection by fetching site info
      await this.client.get('/site.json');
      this.isConnected = true;
      logger.info('Discourse API connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Discourse API:', error);
      throw new Error('Discourse connection failed');
    }
  }

  async fetchTopics(
    categoryId?: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<DiscourseTopic[]> {
    try {
      const params: any = {
        limit,
        offset,
        order: 'created',
        ascending: false
      };

      if (categoryId) {
        params.category = categoryId;
      }

      const response = await this.client.get('/latest.json', { params });
      return response.data.topic_list.topics;
    } catch (error) {
      logger.error('Failed to fetch topics:', error);
      throw error;
    }
  }

  async fetchTopic(topicId: number): Promise<DiscourseTopic> {
    try {
      const response = await this.client.get(`/t/${topicId}.json`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch topic ${topicId}:`, error);
      throw error;
    }
  }

  async fetchPosts(
    topicId: number,
    postIds?: number[]
  ): Promise<DiscoursePost[]> {
    try {
      const params: any = {};
      if (postIds) {
        params.post_ids = postIds.join(',');
      }

      const response = await this.client.get(`/t/${topicId}/posts.json`, { params });
      return response.data.post_stream.posts;
    } catch (error) {
      logger.error(`Failed to fetch posts for topic ${topicId}:`, error);
      throw error;
    }
  }

  async fetchPost(postId: number): Promise<DiscoursePost> {
    try {
      const response = await this.client.get(`/posts/${postId}.json`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch post ${postId}:`, error);
      throw error;
    }
  }

  async createPost(
    topicId: number,
    content: string,
    replyToPostNumber?: number
  ): Promise<DiscoursePost> {
    try {
      const data: any = {
        raw: content,
        topic_id: topicId
      };

      if (replyToPostNumber) {
        data.reply_to_post_number = replyToPostNumber;
      }

      const response = await this.client.post('/posts.json', data);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create post in topic ${topicId}:`, error);
      throw error;
    }
  }

  async createTopic(
    title: string,
    content: string,
    categoryId?: number,
    tags?: string[]
  ): Promise<DiscourseTopic> {
    try {
      const data: any = {
        title,
        raw: content
      };

      if (categoryId) {
        data.category = categoryId;
      }

      if (tags) {
        data.tags = tags;
      }

      const response = await this.client.post('/posts.json', data);
      return response.data;
    } catch (error) {
      logger.error('Failed to create topic:', error);
      throw error;
    }
  }

  async fetchCategories(): Promise<DiscourseCategory[]> {
    try {
      const response = await this.client.get('/categories.json');
      return response.data.category_list.categories;
    } catch (error) {
      logger.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  async fetchUser(userId: number): Promise<DiscourseUser> {
    try {
      const response = await this.client.get(`/users/${userId}.json`);
      return response.data.user;
    } catch (error) {
      logger.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  }

  async searchTopics(
    query: string,
    categoryId?: number,
    limit: number = 20
  ): Promise<DiscourseTopic[]> {
    try {
      const params: any = {
        q: query,
        limit
      };

      if (categoryId) {
        params.category = categoryId;
      }

      const response = await this.client.get('/search.json', { params });
      return response.data.topics || [];
    } catch (error) {
      logger.error('Failed to search topics:', error);
      throw error;
    }
  }

  async syncWithBGIN(): Promise<void> {
    try {
      logger.info('Starting BGIN Discourse synchronization...');
      
      // Fetch all categories
      const categories = await this.fetchCategories();
      logger.info(`Found ${categories.length} categories`);

      // Fetch topics from each category
      for (const category of categories) {
        const topics = await this.fetchTopics(category.id, 100);
        logger.info(`Found ${topics.length} topics in category ${category.name}`);
        
        // Process topics and posts
        for (const topic of topics) {
          const posts = await this.fetchPosts(topic.id);
          logger.debug(`Found ${posts.length} posts in topic ${topic.title}`);
          
          // Here you would process and store the data
          // This will be implemented in the data processing pipeline
        }
      }

      logger.info('BGIN Discourse synchronization completed');
    } catch (error) {
      logger.error('BGIN Discourse synchronization failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/site.json');
      return true;
    } catch (error) {
      logger.error('Discourse health check failed:', error);
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const discourseClient = new DiscourseClient();
