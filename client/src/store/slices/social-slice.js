import { apiClient } from "@/lib/api-client";
import Cookies from 'js-cookie';
import { 
  CREATE_POST, 
  DELETE_POST, 
  LIKE_DISLIKE_POST, 
  REPLY_TO_POST, 
  GET_POST_COMMENTS, 
  GET_FEED, 
  GET_SAVED_POSTS, 
  SHARE_POST, 
  SAVE_OR_UNSAVE_POST, 
  GET_USER_POSTS 
} from "@/utils/constants";

export const createSocialSlice = (set, get) => ({
  posts: [],
  comments: [],
  savedPosts: [],
  loading: false,
  error: null,

  // Helper function to get the token from cookies
  getToken: () => {
    return Cookies.get('jwt'); // Use the name you set for the cookie
  },

  fetchFeed: async () => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.get(GET_FEED, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ posts: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createPost: async (postData) => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.post(CREATE_POST, postData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        posts: [response.data, ...state.posts],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deletePost: async (postId) => {
    const token = get().getToken();
    set({ loading: true });
    try {
      await apiClient.delete(DELETE_POST(postId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  likePost: async (postId) => {
    const token = get().getToken();
    try {
      const response = await apiClient.post(LIKE_DISLIKE_POST(postId), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        ),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  replyToPost: async (postId, replyData) => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.post(REPLY_TO_POST(postId), replyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        comments: [...state.comments, response.data],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  getComments: async (postId) => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.get(GET_POST_COMMENTS(postId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ comments: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  saveOrUnsavePost: async (postId) => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.post(SAVE_OR_UNSAVE_POST(postId), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        savedPosts: response.data.saved ? [...state.savedPosts, response.data] : state.savedPosts.filter(post => post._id !== postId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSavedPosts: async () => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.get(GET_SAVED_POSTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ savedPosts: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUserPosts: async () => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.get(GET_USER_POSTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ posts: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sharePost: async (postId) => {
    const token = get().getToken();
    set({ loading: true });
    try {
      const response = await apiClient.post(SHARE_POST(postId), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        posts: state.posts.map((post) => 
          post._id === postId ? { ...post, shared: response.data.shared } : post
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
});
