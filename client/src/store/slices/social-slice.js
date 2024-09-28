import { apiClient } from "@/lib/api-client";
import { GET_FEED, LIKE_DISLIKE_POST, DELETE_POST, SAVE_OR_UNSAVE_POST } from "@/utils/constants";

export const createSocialSlice = (set, get) => ({
  posts: [],
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(GET_FEED, { withCredentials: true });
      set({ posts: response.data.feeds, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  toggleLikePost: async (postId, userId) => {
    try {
      await apiClient.patch(LIKE_DISLIKE_POST(postId), {}, { withCredentials: true });
      const currentPosts = get().posts;
      const post = currentPosts.find((p) => p._id === postId);
      const isLiked = post.likes.includes(userId);
      set((state) => ({
        posts: state.posts.map((p) =>
          p._id === postId
            ? { ...p, likes: isLiked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] }
            : p
        ),
      }));
    } catch (error) {
      console.error('Error toggling like', error);
    }
  },

  deletePost: async (postId) => {
    try {
      await apiClient.delete(DELETE_POST(postId), {}, { withCredentials: true });
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
      }));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Error deleting post');
    }
  },

  saveOrUnsavePost: async (postId) => {
    try {
      await apiClient.patch(SAVE_OR_UNSAVE_POST(postId), {}, { withCredentials: true });
      const currentPosts = get().posts;
      const post = currentPosts.find((p) => p._id === postId);
      set((state) => ({
        posts: state.posts.map((p) =>
          p._id === postId
            ? { ...p, isSaved: !post.isSaved }
            : p
        ),
      }));
      toast.success(post.isSaved ? 'Post unsaved' : 'Post saved');
    } catch (error) {
      toast.error('Error saving post');
    }
  },
});
