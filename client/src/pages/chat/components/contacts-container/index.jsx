import { useEffect, useState } from "react";
import logo1 from "../../../../../src/assets/logo1.png";
import NewDm from "./components/new-dm";
import Badge from '@mui/material/Badge';
import ProfileInfo from "./components/profile-info";
import { apiClient } from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ui/ContactList";
import CreateChannel from "./components/create-channel";
import { FaCaretDown, FaRegCompass } from "react-icons/fa";
import { TbWriting } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { MdOutlineNotifications } from "react-icons/md";
import { MdOutlineNotificationsActive } from "react-icons/md";

const ContactsContainer = () => {
  const { directMessagesContacts, setDirectMessagesContacts, channels, setChannels, notifications, clearNotifications } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isChannelExpand, setIsChannelExpand] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getContacts = async () => {
      const res = await apiClient.get(GET_DM_CONTACTS_ROUTES, { withCredentials: true });
      if (res.data.contacts) {
        setDirectMessagesContacts(res.data.contacts);
      }
    };
    const getUserChannels = async () => {
      const res = await apiClient.get(GET_USER_CHANNELS, { withCredentials: true });
      if (res.data.channels) {
        setChannels(res.data.channels);
      }
    };
    getContacts();
    getUserChannels();
  }, [setChannels, setDirectMessagesContacts]);

  const handleExplore = () => {
    navigate('/explore'); 
  };

  const handleUserPost = () => {
    navigate('/lets-post');
  };

  const uniqueNotifications = notifications.reduce((acc, notification)=> {
    const existingNotification = acc.find(n => n.senderId === notification.senderId);
    if (existingNotification) {
      existingNotification.count += 1;
    } else{
      acc.push({...notification, count: 1});
    }
    return acc;
  }, []);

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const clearAllNotifications = () => {
    clearNotifications();
    setShowNotifications(false);
  };

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="flex items-center justify-between pt-3 p-4">
        <img src={logo1} alt="logo" width={"120px"} className="ml-4 sm:ml-8" />
        <div onClick={handleNotificationsClick}>
          {uniqueNotifications.length > 0 ? (
            <Badge badgeContent={uniqueNotifications.length} color="secondary" max={4}>
              <MdOutlineNotificationsActive className="text-purple-400 font-light text-3xl cursor-pointer transition-transform duration-300 hover:text-neutral-100" />
            </Badge>
          ) : (
            <MdOutlineNotifications className="text-neutral-400 font-light text-3xl cursor-pointer transition-transform duration-300 hover:text-neutral-100 " />
          )}
        </div>
      </div>

      <div className="my-5 ">
        <div className="flex items-center justify-between pr-10 cursor-pointer" onClick={handleUserPost}>
          <Title text="Let's Post" />
          <TbWriting className="text-neutral-400 font-light text-3xl cursor-pointer transition-transform duration-300 hover:translate-x-[10px] hover:text-neutral-100 ml-0" />
        </div>
      </div>

      <div className="my-5 ">
        <div className="flex items-center justify-between pr-10 cursor-pointer" onClick={handleExplore}>
          <Title text="Explore" />
          <FaRegCompass className="text-neutral-400 font-light text-3xl cursor-pointer transition-all hover:-rotate-180 hover:translate-x-[5px] hover:text-neutral-100 ml-2" />
        </div>
      </div>

      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Messages" />
          <div className="flex items-center">
            <NewDm />
            {directMessagesContacts.length > 0 && (
              <FaCaretDown
                className={`text-neutral-400 font-light cursor-pointer transition-all ${isExpanded ? "rotate-180" : ""}`}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ marginLeft: '40px' }}
              />
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="max-h-[30vh] overflow-y-auto scrollbar-hidden">
            <ContactList contacts={directMessagesContacts} />
          </div>
        )}
      </div>

      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Groups" />
          <div className="flex items-center">
            <CreateChannel />
            {channels.length > 0 && (
              <FaCaretDown
                className={`text-neutral-400 font-light cursor-pointer transition-all ${isChannelExpand ? "rotate-180" : ""}`}
                style={{ marginLeft: '40px' }}
                onClick={() => setIsChannelExpand(!isChannelExpand)}
              />
            )}
          </div>
        </div>
        {isChannelExpand && (
          <div className="max-h-[30vh] overflow-y-auto scrollbar-hidden">
            <ContactList contacts={channels} isChannel={true} />
          </div>
        )}
      </div>

      <ProfileInfo />

      {showNotifications && (
        <div className="absolute top-12 right-5 bg-[#2f303b] p-4 rounded-lg shadow-md w-72">
          {uniqueNotifications.length > 0 ? (
            uniqueNotifications.map((notification, index) => (
              <p key={index} className="text-white text-sm mb-2">
                {notification.senderName} sent you {notification.count > 1 ? `${notification.count} messages`: 'a message'}
              </p>
            ))
          ) : (
            <p className="text-white text-sm">No notifications</p>
          )}
          {uniqueNotifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="mt-4 bg-red-600 text-white py-1 px-4 rounded"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsContainer;

const Title = ({ text }) => (
  <h1 className="text-white text-lg font-bold ml-4">{text}</h1>
);
