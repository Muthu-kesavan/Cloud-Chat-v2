import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { FaPlus, FaSearch } from "react-icons/fa"
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Lottie from "react-lottie"
import { animationDefaultOptions, getColor } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { SEARCH_CONTACTS } from "@/utils/constants"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/store"
import { HOST } from "@/utils/constants"
const NewDm = () => {
  const {setSelectedChatType, setSelectedChatData} = useAppStore();
  const [openModal, setOpenModal] = useState(false);
  const [contact, setContact] = useState([]);

  const searchContacts = async (searchTerm) =>{
    try{
      if (searchTerm.length > 0){
        const res = await apiClient.post(SEARCH_CONTACTS,
          {searchTerm},
          {withCredentials: true}
        );
        if (res.status === 200 && res.data.contacts){
          setContact(res.data.contacts)
        }
      } else{
        setContact([]);
      }
    }catch(err){
      console.log({err});
    }
  };

  const selectNewContact =(contact)=>{
    setOpenModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setContact([]);
  };
  return (
    <>
    <TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <FaPlus
      className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" 
      onClick={()=>setOpenModal(true)}
      />
    </TooltipTrigger>
    <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
    Select New Contact
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
<Dialog open={openModal} onOpenChange={setOpenModal}>
  <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col ">
    <DialogHeader>
      <DialogTitle>Please Select a Contact</DialogTitle>
      <DialogDescription />
    </DialogHeader>

    
    <div>
      <Input 
        placeholder="Search Contact" 
        className="rounded-lg p-6 bg-[#2c2e3b] border-none"
        onChange={e => searchContacts(e.target.value)} 
      />
    </div>
      {contact.length > 0 && (
        <ScrollArea className="h-[250px] w-full flex-grow mt-4 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg overflow-hidden">
        <div className="flex flex-col gap-5">
          {contact.map((cont) => (
            <div 
              key={cont._id} 
              className="flex gap-3 items-center cursor-pointer"
              onClick={()=>selectNewContact(cont)}>
              <div className="w-12 h-12 relative">
                <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                  {cont.image ? (
                    <AvatarImage 
                      src={`${HOST}/${cont.image}`} 
                      alt="Profile" 
                      className="object-cover w-full h-full bg-black rounded-full" 
                    />
                  ) : (
                    <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(cont.color)}`}>
                      {cont.name ? cont.name[0] : cont.email[0]}
                    </div>
                  )}
                </Avatar>
              </div>
  
              <div className="flex flex-col">
                <span>
                  {
                    cont.name ? `${cont.name}`: `${cont.email}`
                  }
                  </span>
                <span className="text-xs">{cont.email}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      )
      }
    {contact.length <= 0 && (
      <div className="flex-1 md:flex mt-5 md:mt-0 flex-col justify-center items-center duration-1000 transition-all">
        <Lottie
          isClickToPauseDisabled={true}
          height={100}
          width={100}
          options={animationDefaultOptions}
        />
        {/* <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
          <h3 className="inline-flex items-center">
            <FaSearch className="mr-2" /> Search New&nbsp;
            <span className="font-bold text-[#5A00EE]">Contacts</span>
          </h3>
        </div> */}
      </div>
    )}
  </DialogContent>
</Dialog>


  </>
  )
}

export default NewDm