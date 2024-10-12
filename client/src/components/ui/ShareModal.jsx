import React, { useState, useEffect } from 'react';
import { BiSolidCopy } from "react-icons/bi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS, HOST, SEARCH_CONTACTS, SHARE_POST } from '@/utils/constants';
import { getColor } from '@/lib/utils';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';

const ShareModal = ({ post, isOpen, onClose }) => {
  const [recentContacts, setRecentContacts] = useState([]);
  const [userGroups, setUserGroups] = useState([]);  
  const [selectedRecipients, setSelectedRecipients] = useState([]);  
  const [recipientType, setRecipientType] = useState(''); 
  const [searchResults, setSearchResults] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');  
  const [isHovered, setHovered] = useState(false);   

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const resContacts = await apiClient.get(GET_DM_CONTACTS_ROUTES, { withCredentials: true }); 
          const resGroups = await apiClient.get(GET_USER_CHANNELS, { withCredentials: true });        
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
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    const recipientIds = selectedRecipients.map(recipient => recipient._id);

    try {
      const res = await apiClient.post(SHARE_POST(post._id), { recipientIds }, { withCredentials: true });
      toast.success("Post shared successfully!");
      onClose(); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to share the post.");
    }
  };

  const toggleRecipientSelection = (recipient) => {
    if (selectedRecipients.some(selected => selected._id === recipient._id)) {
      setSelectedRecipients(selectedRecipients.filter(selected => selected._id !== recipient._id)); // Remove if already selected
    } else {
      setSelectedRecipients([...selectedRecipients, recipient]); 
    }
  };

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const res = await apiClient.post(SEARCH_CONTACTS, { searchTerm }, { withCredentials: true });
        if (res.status === 200 && res.data.contacts) {
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

        <div className="flex items-center justify-between border-b pb-4">
          <input
            type="text"
            value={`${window.location.origin}/post/${post._id}`}
            readOnly
            className="border-none bg-gray-600 p-2 flex-grow rounded-md"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 text-gray-100 hover:text-gray-500"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <BiSolidCopy
                    className={`transition duration-200 ${
                      isHovered ? 'text-gray-500 scale-125 transition-transform duration-200' : 'text-gray-100'
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="border-none">
                <p>Copy to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-4">
          <p className="font-semibold">Share with</p>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search contacts..."
            className="w-full mt-2 mb-4 p-2 rounded-md bg-gray-600 text-white"
          />
          <div className="max-h-15 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
            <div className="grid grid-cols-3 gap-4">
              {recentContacts.map(contact => (
                <div
                  key={contact._id}
                  className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${selectedRecipients.some(selected => selected._id === contact._id) ? 'bg-[#5A00EE] text-white' : 'bg-gray-600'}`}
                  onClick={() => toggleRecipientSelection(contact)}
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
                        className={`${selectedRecipients.some(selected => selected._id === contact._id) ? 'bg-[#ffffff22] border border-white/70' : getColor(contact.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                      >
                        {contact.name ? contact.name.charAt(0) : contact.email.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <p>{contact.name}</p>
                </div>
              ))}

              {userGroups.map(group => (
                <div
                  key={group._id}
                  className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${selectedRecipients.some(selected => selected._id === group._id) ? 'bg-[#5A00EE] text-white' : 'bg-gray-600'}`}
                  onClick={() => toggleRecipientSelection(group)}
                >
                  <p>{group.name}</p>
                </div>
              ))}

              {searchResults.map(result => (
                <div
                  key={result._id}
                  className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${selectedRecipients.some(selected => selected._id === result._id) ? 'bg-[#5A00EE] text-white' : 'bg-gray-600'}`}
                  onClick={() => toggleRecipientSelection(result)}
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
                        className={`${selectedRecipients.some(selected => selected._id === result._id) ? 'bg-[#ffffff22] border border-white/70' : getColor(result.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
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

        <button
          onClick={handleSend}
          className="mt-6 bg-[#5A00EE] p-2 rounded-md text-white hover:bg-[#3B0088] transition-colors"
        >
          Send 
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
