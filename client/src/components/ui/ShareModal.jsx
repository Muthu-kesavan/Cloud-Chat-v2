import React, { useState, useEffect } from 'react';
import { IoMdSend } from 'react-icons/io';
import { FaWhatsapp, FaRegCopy } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS, HOST, SEARCH_CONTACTS } from '@/utils/constants';
import { getColor } from '@/lib/utils';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';

const ShareModal = ({ post, isOpen, onClose }) => {
  const [recentContacts, setRecentContacts] = useState([]);
  const [userGroups, setUserGroups] = useState([]);  // Store groups fetched from backend
  const [selectedRecipient, setSelectedRecipient] = useState(null);  // Unified for both contacts and groups
  const [recipientType, setRecipientType] = useState('');  // Track whether it's a contact or group
  const [searchResults, setSearchResults] = useState([]);  // Store search results
  const [searchTerm, setSearchTerm] = useState('');        // Track search input value

  useEffect(() => {
    if (isOpen) {
      // Fetch recent contacts and groups when modal opens
      const fetchData = async () => {
        try {
          const resContacts = await apiClient.get(GET_DM_CONTACTS_ROUTES, {withCredentials: true}); // API for recent contacts
          const resGroups = await apiClient.get(GET_USER_CHANNELS, {withCredentials: true});        // API for user groups
          setRecentContacts(resContacts.data.contacts);
          setUserGroups(resGroups.data.channels);
        } catch (err) {
          console.error(err);
          toast.error('Failed to fetch recent contacts or groups.');
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (recipientType === 'contact' && selectedRecipient) {
      // Send post to selected contact
      try {
        await apiClient.post(`/share/post/contact/${selectedRecipient._id}`, { postId: post._id });
        toast.success("Post shared successfully with the contact!");
        onClose();
      } catch (err) {
        console.error(err);
        toast.error("Failed to share the post with contact.");
      }
    } else if (recipientType === 'group' && selectedRecipient) {
      // Send post to selected group
      try {
        await apiClient.post(`/share/post/group/${selectedRecipient._id}`, { postId: post._id });
        toast.success("Post shared successfully with the group!");
        onClose();
      } catch (err) {
        console.error(err);
        toast.error("Failed to share the post with group.");
      }
    }
  };

  // Handle search
  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const res = await apiClient.post(SEARCH_CONTACTS, { searchTerm }, { withCredentials: true });
        if (res.status === 200 && res.data.contacts) {
          // Filter out contacts that are already in recentContacts
          const filteredResults = res.data.contacts.filter(contact => 
            !recentContacts.some(recent => recent._id === contact._id)
          );
          setSearchResults(filteredResults);
        }
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.log({ err });
    }
  };

  // Handle input change for search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchContacts(value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1c1d25] rounded-lg border-none text-white max-w-md w-full p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        {/* URL and Copy Icon */}
        <div className="flex items-center justify-between border-b pb-4">
          <input
            type="text"
            value={`${window.location.origin}/post/${post._id}`}
            readOnly
            className="border-none bg-gray-600 p-2 flex-grow rounded-md"
          />
          <button onClick={copyToClipboard} className="ml-2 text-gray-500 hover:text-gray-800">
            <FaRegCopy />
          </button>
        </div>

        {/* Share with section */}
        <div className="mt-4">
          <p className="font-semibold">Share with:</p>

          {/* Search bar */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search contacts..."
            className="w-full mt-2 mb-4 p-2 rounded-md bg-gray-600 text-white"
          />

          {/* Scrollable container for recent contacts and groups */}
          <div className="max-h-15 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
            <div className="grid grid-cols-3 gap-4">
              {/* Display recent contacts */}
              {recentContacts.map(contact => (
                <div
                  key={contact._id}
                  className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${selectedRecipient === contact ? 'bg-blue-500 text-white' : 'bg-gray-600'}`}
                  onClick={() => {
                    setSelectedRecipient(contact);
                    setRecipientType('contact');
                  }}
                >
                  <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                    {contact.image ? (
                      <AvatarImage
                        src={`${HOST}/${contact.image}`}
                        alt="Profile"
                        className="object-cover w-full h-full bg-black"
                      />
                    ) : (
                      <div
                        className={`${selectedRecipient === contact ? 'bg-[#ffffff22] border border-white/70' : getColor(contact.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                      >
                        {contact.name ? contact.name.charAt(0) : contact.email.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <p>{contact.name}</p>
                </div>
              ))}

              {/* Display groups */}
              {userGroups.map(group => (
                <div
                  key={group._id}
                  className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${selectedRecipient === group ? 'bg-blue-500 text-white' : 'bg-gray-600'}`}
                  onClick={() => {
                    setSelectedRecipient(group);
                    setRecipientType('group');
                  }}
                >
                  <p>{group.name}</p>
                </div>
              ))}

              {/* Display search results excluding recent contacts */}
              {searchResults.map(result => (
                <div
                  key={result._id}
                  className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${selectedRecipient === result ? 'bg-blue-500 text-white' : 'bg-gray-600'}`}
                  onClick={() => {
                    setSelectedRecipient(result);
                    setRecipientType('contact');
                  }}
                >
                  <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                    {result.image ? (
                      <AvatarImage
                        src={`${HOST}/${result.image}`}
                        alt="Profile"
                        className="object-cover w-full h-full bg-black"
                      />
                    ) : (
                      <div
                        className={`${selectedRecipient === result ? 'bg-[#ffffff22] border border-white/70' : getColor(result.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                      >
                        {result.name ? result.name.charAt(0) : result.email.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <p>{result.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="mt-6 bg-blue-600 p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
