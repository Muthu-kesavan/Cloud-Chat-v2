import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { FaRegComment } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { GET_POST_COMMENTS, REPLY_TO_POST } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import formatDistance from "date-fns/formatDistance";
import { IoMdSend } from "react-icons/io";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PostModal = ({ post, isOpen, onClose }) => {
  const { userInfo, likePost, postSaveorUnsave } = useAppStore();
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const dateStr = post.createdAt ? formatDistance(new Date(post.createdAt), new Date()) : 'Unknown time';


  useEffect(() => {
    if (isOpen) {
      const fetchCommentCount = async () => {
        try {
          const res = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
          setCommentCount(res.data?.comments?.length || 0);
          setComments(res.data?.comments || []);
        } catch (err) {
          console.log(err);
        }
      };
      fetchCommentCount();
    }
  }, [isOpen, post._id]);

  const handleLike = async () => {
    await likePost(post._id);
  };

  const handleSavePost = async () => {
    setIsSaving(true);
    await postSaveorUnsave(post._id);
    setIsSaving(false);
  };

  const handleAddComment = async () => {
    try {
      await apiClient.put(REPLY_TO_POST(post._id), { text: replyText }, { withCredentials: true });
      const fetchedComments = await apiClient.get(GET_POST_COMMENTS(post._id), { withCredentials: true });
      setComments(fetchedComments.data?.comments || []);
      setReplyText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1c1d25] text-white rounded-lg max-w-xl w-full">
        <div className="p-4">
          <div className="flex items-center mb-3">
          <button onClick={onClose} className="close-button">
          X
        </button>
            <span className="ml-3 font-semibold text-lg">{post.name}</span>
            <p className="text-gray-500 ml-2">- {dateStr} ago</p>
          </div>

          {/* Post content */}
          <p>{post.description}</p>

          <div className="flex justify-around items-center mt-4 text-lg">
          <button onClick={handleLike} className="flex items-center">
  {post.likes?.includes(userInfo.id) ? (
    <MdFavorite className="text-[#5A00EE]" />
  ) : (
    <MdFavoriteBorder />
  )}
  <span>{post.likes?.length || 0}</span>
</button>

<button onClick={handleSavePost} className="flex items-center">
  {post.saved?.includes(userInfo.id) ? (
    <IoBookmark />
  ) : (
    <IoBookmarkOutline />
  )}
</button>


            <button onClick={() => setShowComments(!showComments)} className="flex items-center">
              <FaRegComment />
              <span>{commentCount}</span>
            </button>

            <button onClick={handleSavePost} className="flex items-center">
              {post.saved.includes(userInfo.id) ? (
                <IoBookmark />
              ) : (
                <IoBookmarkOutline />
              )}
            </button>
          </div>

          {showComments && (
            <div className="mt-4">
              <div className="max-h-60 overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="border-t py-2">
                      <p className="font-semibold">{comment.userId.name}</p>
                      <p className="text-gray-400">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
              </div>

              <div className="mt-2 flex">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="border text-gray-600 rounded-md p-2 flex-grow mr-2"
                  placeholder="Add a comment..."
                />
                <button onClick={handleAddComment}>
                  <IoMdSend className="text-neutral-500 hover:text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;
