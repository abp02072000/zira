import appData from "../data.json";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "FinTech" | "AgriTech" | "GreenTech" | "Investissement" | "Réglementation" | "Entrepreneuriat";
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = (appData.blogPosts as BlogPost[]) || [];
