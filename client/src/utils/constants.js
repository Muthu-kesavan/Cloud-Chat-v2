export const HOST = import.meta.env.VITE_SERVER_URL;


export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`
export const VERIFY_OTP = `${AUTH_ROUTES}/verify-otp`
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`
export const UPDATE_PROFILE = `${AUTH_ROUTES}/update-profile`
export const UPLOAD_IMAGE = `${AUTH_ROUTES}/upload-image`
export const REMOVE_IMAGE = `${AUTH_ROUTES}/remove-image`
export const LOGOUT = `${AUTH_ROUTES}/logout`
export const GET_USER = `${AUTH_ROUTES}/find/:id`


export const CONTACT_ROUTES = "api/contacts"
export const SEARCH_CONTACTS = `${CONTACT_ROUTES}/search`
export const GET_DM_CONTACTS_ROUTES = `${CONTACT_ROUTES}/get-contacts-for-dm`
export const GET_ALL_CONTACTS = `${CONTACT_ROUTES}/get-all-contacts`



export const MESSAGE_ROUTES = "api/messages"
export const GET_MESSAGES = `${MESSAGE_ROUTES}/get-messages`
export const UPLOAD_FILE = `${MESSAGE_ROUTES}/upload`
export const SHARE_LOCATION = `${MESSAGE_ROUTES}/location` 
export const DELETE_MESSAGE = `${MESSAGE_ROUTES}/:messageId/delete`


export const CHANNEL_ROUTES = "api/channel"
export const CREATE_CHANNEL = `${CHANNEL_ROUTES}/create-channel`
export const GET_USER_CHANNELS = `${CHANNEL_ROUTES}/get-user-channels`
export const GET_CHANNEL_MESSAGES = `${CHANNEL_ROUTES}/channel-messages`


export const POST_ROUTES =  "api/post"
export const CREATE_POST = `${POST_ROUTES}/post`;
export const DELETE_POST = (postId) => `${POST_ROUTES}/${postId}`;
export const LIKE_DISLIKE_POST = (postId) => `${POST_ROUTES}/${postId}/like`;
export const REPLY_TO_POST = (postId) => `${POST_ROUTES}/${postId}/reply`;
export const GET_POST_COMMENTS = (postId) => `${POST_ROUTES}/${postId}/comments`;
export const GET_FEED = `${POST_ROUTES}/feed`;
export const GET_SAVED_POSTS = `${POST_ROUTES}/saved`;
export const SHARE_POST = (postId) => `${POST_ROUTES}/${postId}/share`;
export const POST_SAVE_OR_UNSAVE = (postId)=> `${POST_ROUTES}/${postId}/save`;
export const SAVE_OR_UNSAVE_POST = (postId) => `${POST_ROUTES}/${postId}/save`;
export const GET_USER_POSTS = `${POST_ROUTES}/myPosts`;
export const SINGLE_POST =(postId)=> `${POST_ROUTES}/${postId}`;