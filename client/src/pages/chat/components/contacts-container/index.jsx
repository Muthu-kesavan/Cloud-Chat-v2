import { useEffect, useState } from "react";
import logo1 from "../../../../../src/assets/logo1.png";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import { apiClient } from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTES, GET_USER_CHANNELS } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ui/ContactList";
import CreateChannel from "./components/create-channel";
import { FaCaretDown, FaRegCompass } from "react-icons/fa";
import { TbWriting } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const ContactsContainer = () => {
  const { directMessagesContacts, setDirectMessagesContacts, channels, setChannels } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isChannelExpand, setIsChannelExpand] = useState(false);
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

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <img src={logo1} alt="logo" width={"120px"} className="ml-8" />
      </div>
      
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Let's Post" />
          <div className="flex items-center">
            <TbWriting 
              className="text-neutral-400 font-light text-3xl text-opacity-90 text-start cursor-pointer transition-transform duration-300 hover:translate-x-[10px] hover:text-neutral-100 ml-0"
            />
          </div>
        </div>
      </div>

      <div className="my-5">
        <div 
          className="flex items-center justify-between pr-10 cursor-pointer" 
          onClick={handleExplore} >
          <Title text="Explore" />
          <div className="flex items-center">
            <FaRegCompass 
              className="text-neutral-400 font-light text-3xl text-opacity-90 text-start hover:-rotate-180 hover:translate-x-[5px] hover:text-neutral-100 transition-all ml-2" 
            />
          </div>
        </div>
      </div>
      
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Messages" />
          <div className="flex items-center">
            <NewDm />
            {directMessagesContacts.length > 0 && (
              <FaCaretDown   
                className={`text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all ${isExpanded ? "rotate-180" : ""}`} 
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
                className={`text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all ${isChannelExpand ? "rotate-180" : ""}`} 
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

      {/* Profile info at the bottom */}
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Title = ({ text }) => (
  <h1 className="text-white text-lg font-bold ml-4">{text}</h1>
);
