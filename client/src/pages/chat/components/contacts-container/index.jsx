import { useEffect, useState } from "react";
import logo1 from "../../../../../src/assets/logo1.png";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import { apiClient } from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ui/ContactList";
import CreateChannel from "./components/create-channel";
import { FaCaretDown } from "react-icons/fa";

const ContactsContainer = () => {
  const { directMessagesContacts, setDirectMessagesContacts, channels, setChannels } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isChannelExpand, setIsChannelExpand] = useState(false);

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

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <img src={logo1} alt="logo" width={"120px"} className="ml-8" />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Messages" />
          <div className="flex items-center">
            <NewDm />
            <FaCaretDown   
              className={`text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all ${isExpanded ? "rotate-180" : ""}`} 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ marginLeft: '40px' }} 
            />
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
            <FaCaretDown
              className={`text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all ${isChannelExpand ? "rotate-180" : ""}`} 
              style={{ marginLeft: '40px' }} 
              onClick={() => setIsChannelExpand(!isChannelExpand)}
            />
          </div>
        </div>
        {isChannelExpand && (
          <div className="max-h-[30vh] overflow-y-auto scrollbar-hidden">
            <ContactList contacts={channels} isChannel={true} />
          </div>
        )}
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Title = ({ text }) => (
  <h1 className="text-white text-lg font-bold ml-4">{text}</h1>
);


