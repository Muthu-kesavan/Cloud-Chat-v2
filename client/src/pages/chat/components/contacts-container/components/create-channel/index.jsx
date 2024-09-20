import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL, GET_ALL_CONTACTS } from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { addChannel } = useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getData = async () => {
      const res = await apiClient.get(GET_ALL_CONTACTS, { withCredentials: true });
      setAllContacts(res.data.contacts);
    };
    getData();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const res = await apiClient.post(CREATE_CHANNEL, {
          name: channelName,
          members: selectedContacts.map(contact => contact.value),
        }, { withCredentials: true });

        if (res.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
          addChannel(res.data.channel);
        }
      }
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" 
              onClick={() => setNewChannelModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Create New Group
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col ">
          <DialogHeader>
            <DialogTitle>Fill up Group Details</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <Input 
            placeholder="Group Name" 
            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
            onChange={(e) => setChannelName(e.target.value)} 
            value={channelName}
          />
          <MultipleSelector
            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white" 
            defaultOptions={allContacts}
            placeholder="Search Contacts"
            value={selectedContacts}
            onChange={setSelectedContacts}
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-600">No Result found</p>
            } 
          />
          <Button className="w-full bg-[#5201fe] hover:bg-[#3B0088] transition-all duration-300" onClick={createChannel}>
            Create Group
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
