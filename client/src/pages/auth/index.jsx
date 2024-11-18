import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import {AiOutlineLoading3Quarters} from "react-icons/ai";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { useState } from "react"
import { toast } from "sonner"
import {apiClient} from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE, VERIFY_OTP } from "@/utils/constants"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/store"
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const {setUserInfo} = useAppStore();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is Required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is Required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("password and confirm password need to be same");
      return false;
    }
    return true;
  };


  const handleSignup = async () => {
    if (validateSignup()) {
      setLoading(true);
      try{
        const res = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
      if (res.status === 201) {
        setUserInfo(res.data.user);
        toast.success("Signup successful!");
        navigate('/profile');
      }

      } catch(err){
        if (err.response && err.response.status === 400){
          toast.error(err.response.data || "User Already Exists");
        }else {
          toast.error("An error occurred during signup")
        }
      } finally{
        setLoading(false);
      }
      
    }
  };

  const validateLogin=()=> {
    if (!email.length) {
      toast.error("Email is Required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is Required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      setLoading(true);
      try {
        const res = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
        if (res.status === 200) {
          if (res.data.user.id){
            setUserInfo(res.data.user)
            if (res.data.user.profileSetup){
              navigate('/chat');
            }else{
              navigate('/profile');
            }
          }
          toast.success("Login successful!");
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data || "Invalid email or password");
        } else {
          toast.error("An error occurred during login");
        }
      } finally{
        setLoading(false);
      }
    }
    
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70wv] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <img src="/waving-hand.png" alt="emoji" className="h-[80px]" />
              <h1 className="text-5xl font-bold md:text-6xl"> Welcome</h1>
            </div>
            <p className="font-medium text-center">
              Let's Get Started with <span className="font-bold text-[#5A00EE]">CLOUD-CHAT</span>
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-[#5A00EE] data-[state=active]:font-semibold data-[state=active]:border-b-[#5A00EE] p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-[#5A00EE] data-[state=active]:font-semibold data-[state=active]:border-b-[#5A00EE] p-3 transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                <Input 
                  placeholder="Email" 
                  type="email" 
                  className="rounded-full p-6 caret-[#5A00EE]" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    className="rounded-full p-6 caret-[#5A00EE]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <IoMdEye
                    className={`text-2xl absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer ${showPassword ? "text-[#5A00EE]" : "text-gray-500"}`}
                    onClick={togglePassword}
                  />
                </div>
                <Button
                  className="rounded-full p-6 flex items-center justify-center"
                  style={{ backgroundColor: '#5A00EE', color: 'white' }}
                  onClick={handleLogin}
                  disabled={loading} // Disable button when loading
                >
                  {loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5" value="signup">
                <Input 
                  placeholder="Email" 
                  type="email" 
                  className="rounded-full p-6 caret-[#5A00EE]" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    className="rounded-full p-6 caret-[#5A00EE]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <IoMdEye
                    className={`text-2xl absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer ${showPassword ? "text-[#5A00EE]" : "text-gray-500"}`}
                    onClick={togglePassword}
                  />
                </div>
                <div className="relative">
                  <Input 
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="rounded-full p-6 caret-[#5A00EE]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <IoMdEye
                    className={`text-2xl absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer ${showConfirmPassword ? "text-[#5A00EE]" : "text-gray-500"}`}
                    onClick={toggleConfirmPassword}
                  />
                </div>
                <Button
                  className="rounded-full p-6 flex items-center justify-center"
                  style={{ backgroundColor: '#5A00EE', color: 'white' }}
                  onClick={handleSignup}
                  disabled={loading} // Disable button when loading
                >
                  {loading ? (
                    <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                  ) : (
                    "Signup"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="bg-[#5A00EE] h-full w-full bg-cover bg-center rounded-r-3xl relative" style={{ backgroundImage: "url(bgimage3.webp)" }}>
          <div className="absolute w-full h-full bg-black opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default Auth;