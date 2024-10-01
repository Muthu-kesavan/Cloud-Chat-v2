import { apiClient } from "@/lib/api-client";
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
  GET_USER_POSTS ,
  POST_SAVE_OR_UNSAVE
  
} from "@/utils/constants";

export const createSocialSlice = (set, get) => ({
  posts: [],
  comments: [],
  commentCount: 0,
  savedPosts: [],
  loading: false,
  error: null,

  fetchFeed: async () => {
    set({ loading: true });
    try {
      const response = await apiClient.get(GET_FEED, { withCredentials: true });
      set({ posts: response.data.feeds, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createPost: async (postData) => {
    set({ loading: true });
    try {
      const response = await apiClient.post(CREATE_POST, postData, {withCredentials: true});
      set((state) => ({
        posts: [response.data, ...state.posts],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deletePost: async (postId) => {
    set({ loading: true });
    try {
      await apiClient.delete(DELETE_POST(postId), {withCredentials: true});
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  likePost: async (postId) => {
    try {
      const response = await apiClient.patch(LIKE_DISLIKE_POST(postId), {}, {
        withCredentials: true, 
      });
      const updatedPost = response.data.post;

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, likes: updatedPost.likes } : post
        ),
      }));
    } catch (error) {
      set({ error: error.message }); 
    }
  },

  replyToPost: async (postId, replyText) => {
    set({ loading: true });
    try {
      await apiClient.put(REPLY_TO_POST(postId),
        {text: replyText},
       {withCredentials: true}
    );
    const res = await apiClient.get(GET_POST_COMMENTS(postId), { withCredentials: true });
    const comments = res.data?.comments || [];
      set((state) => ({
        comments: [...state.comments, ...comments],
        commentCount: comments.length,
        loading: false,
        replyText: '',
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  getComments: async (postId) => {
    set({ loading: true });
    try {
      const response = await apiClient.get(GET_POST_COMMENTS(postId), { withCredentials: true });
      const comments = response.data?.comments || [];
      set({
        comments: comments, 
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  getCommentsCount: async (postId) => {
    set({ loading: true });
      try {
        const response = await apiClient.get(GET_POST_COMMENTS(postId), { withCredentials: true });
        const count = response.data?.comments?.length || 0;
        set({
          commentCount : count,
          loading: false,
        });
    } catch(err){
      console.error("Error fetching comment count:", err);
      set({ error: err.message, loading: false });
    }
},
postSaveorUnsave: async (postId) => {
  try {
    const response = await apiClient.patch(POST_SAVE_OR_UNSAVE(postId), {}, {
      withCredentials: true, 
    });
    const updatedPost = response?.data?.post;

    if (updatedPost) {
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, saved: updatedPost.saved } : post
        ),
      }));
    }
  } catch (error) {
    set({ error: error.message }); 
  }
}
});
