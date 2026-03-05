//context api me ek box banate hai usme data dalte hai ek box kinof me ..alag alag boxes hai for every data or use ...to hm is tarah se use kret hai jisse ek box doosre ko distrub ni krega

import React ,{createContext,useContext,useState,useEffect} from 'react';
const authContext = createContext();

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context; 
};
export const AuthProvider = ({children}) =>{
    const [user,setUser] = useState(null);
    const[loading,setloading] = useState(true);
    const[isAuthenticated,setIsAuthenticated] = useState(false);

    useEffect(()=>{
        checkAuthStatus();
    },[])

    const checkAuthStatus = ()=>{
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if(token && savedUser){
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setloading(false);


    }

    const login = (userData,token)=>{
        localStorage.setItem("token",token);
        localStorage.setItem("user",JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    }


    const logout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = "/";
    }

    const updateUser = (newData)=>{
        const updatedUser = {...user,...newData};
        localStorage.setItem("user",JSON.stringify(updatedUser));
        setUser(updateUser);
    }

    return(
        <authContext.Provider value={{
            user,loading,isAuthenticated,login,logout,updateUser

        }}>
            {children}
        </authContext.Provider>
    )
}

