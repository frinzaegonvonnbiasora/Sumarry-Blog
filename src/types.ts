export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  email: string;
}

export interface PrivateDoc {
  id: string;
  type: 'file' | 'note';
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  readTime: number;
  likes?: string[]; // Array of user IDs who liked the post
  commentCount?: number;
  createdAt: any;
  updatedAt?: any;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
}
