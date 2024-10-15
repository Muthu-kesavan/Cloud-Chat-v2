import { useAppStore } from "@/store"
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { colors } from "@/lib/utils";
import {FaTrash, FaPlus} from "react-icons/fa"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {toast} from "sonner";
import { apiClient } from "@/lib/api-client";
import { UPDATE_PROFILE, UPLOAD_IMAGE, HOST, REMOVE_IMAGE } from "@/utils/constants";


const Profile = () => {
  const navigate = useNavigate();
  const {userInfo, setUserInfo}= useAppStore();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [hover, setHover] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);
  useEffect(()=>{
    if (userInfo.profileSetup){
      setName(userInfo.name);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image){
      setImage(`${HOST}/${userInfo.image}`);
    }
  },[userInfo])

  const validateProfile = ()=> {
    if (!name){
      toast.error("Enter your Name");
      return false
    }
    return true;
  };

  const saveChanges = async()=> {
    if (validateProfile()){
      try{
        const res = await apiClient.post(UPDATE_PROFILE, {name, color:selectedColor }, {withCredentials: true});
        //console.log("Profile update response:", res.data)
        if (res.status === 200 && res.data){
          setUserInfo({...res.data});
          toast.success("Profile updated Successfully");
          navigate('/chat');
        }
      } catch(err){
        console.log({err});
      }
    }
  };

  const handleNavigate = ()=> {
    if (userInfo.profileSetup){
      navigate('/chat');
    }else{
      toast.error("Complete the Profile Setup");
    }
  }

  const handelFileInputClick=()=>{
    fileInputRef.current.click();
  }

  const handleImage = async (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedExtensions.includes(file.type)) {
        toast.error("Only .jpg, .jpeg, and .png files are allowed");
        return;
      }
  
      const formData = new FormData();
      formData.append("profile-image", file);
  
      try {
        const res = await apiClient.post(UPLOAD_IMAGE, formData, { withCredentials: true });
  
        if (res.status === 200 && res.data.image) {
          setUserInfo({ ...userInfo, image: res.data.image });
          setImage(`${HOST}/${res.data.image}`); // Update image state with the new URL
          toast.success("Image uploaded successfully");
        }
      } catch (err) {
        console.log("Error uploading image", err);
        toast.error("Failed to upload image");
      }
    }
  };
  

  const deleteImage = async(req, res)=>{
    try{
      const res = await apiClient.delete(REMOVE_IMAGE, {withCredentials: true})
      if (res.status === 200){
        setUserInfo({...userInfo,image:null});
        toast.success("Profile Image Removed");
        setImage(null);
      }
    }catch(err){
      console.log(err);
    }
  };

  return (
  <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
    <div className="flex flex-col gap-10 w-[80vw] md:w-max">
      <div >
          <IoArrowBack className="text-4l lg:text-6xl text-white/90 cursor-pointer" onClick={handleNavigate}/>
      </div>
      <div className="grid grid-cols-2">
      <div className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
      onMouseEnter={()=> setHover(true)}
      onMouseLeave={()=> setHover(false)}
      >
        <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
          {
            image ? 
            (<AvatarImage src={image} 
              alt="Profile" 
              className="object-cover w-full h-full bg-black" />
            ) : 
            (
            <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full 
            ${getColor(selectedColor)}`}>
              {name ? name.split("").shift() : userInfo.email.split("").shift()}
            </div>
          )}
        </Avatar>
        { hover && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
            onClick={image ? deleteImage : handelFileInputClick}>
              {image ? 
              (<FaTrash className="text-white text-3xl cursor-pointer" />)
               : 
              (<FaPlus className="text-white text-3xl cursor-pointer"/>
              )} 
            </div>
          )}
          <input type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleImage} 
          name="profile-image" 
          accept=".png, .jpg, .jpeg, .svg, .webp, .gif"/>
      </div>
    
    <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
      <div className="w-full">
        <Input placeholder="Email"
         type="email" 
         disabled value={userInfo.email} 
         className="rounded-lg p-6 bg-[#2c2e3B] border-none" />
      </div>
      <div className="w-full">
        <Input placeholder="Name" 
        type="text" 
        onChange={e=>setName(e.target.value)} 
        value={name}  
        className="rounded-lg p-6 bg-[#2c2e3B] border-none" />
      </div>
      <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    selectedColor === index
                      ? "outline outline-white/50 outline-1"
                      : ""
                  }`}
                  key={index}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
    </div>
    </div>
    <div className="w-full">
      <Button className="h-16 w-full transition-all duration-300 bg-[#5A00EE] text-white hover:bg-[#3B0088]"
      onClick={saveChanges}>
      Save Changes
      </Button>
    </div>
    </div>
    </div>
    
  );
};

export default Profile