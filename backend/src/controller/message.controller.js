import Message from "../model/Message.js";
import User from "../model/User.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllContacts = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password");
        
        res.status(200).json(filteredUsers);
    }
    catch(error){
        console.log("Error in getAllContacts controller:", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const getMessagesByUserId = async (req, res) => {
    try{
        const myId = req.user._id;
        const {id:userToChatId}= req.params;

        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ],
        });
        res.status(200).json(messages);
    }
    catch(error){
        console.log("Error in getMessagesByUserId controller:", error);
        res.status(500).json({message:"Internal server error"}); 
    };
};


export const sendMessage = async (req, res) => {
    try{
        const {text,image}=req.body;
        const {id:receiverId}=req.params;
        const senderId=req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }
        if(senderId.equals(receiverId)){
            return res.status(400).json({message:"Cannot send messages to yourself"});
        }
        const receiverExists=await User.exists({_id:receiverId});
        if(!receiverExists)return res.status(400).json({message:"Receiver not found."});
        
        let imageUrl = "";
        if (image) {
            //upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text || "",
            image: imageUrl
        });
        const savedMessage = await newMessage.save();

        res.status(201).json(savedMessage);

        //todo: send message in real-time if user is online -socket.io
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getChatPartners = async (req,res)=>{
    try{
        const loggedInUserId=req.user._id

        //find all the messages where logged in user is either sender or receiver
        const messages= await Message.find({
            $or:[
                {senderId:loggedInUserId},{receiverId:loggedInUserId}
            ]
        });

        const chatPartnerIds=[...new Set(messages.map((msg) => msg.senderId.toString()===loggedInUserId.toString()?msg.receiverId.toString():msg.senderId.toString()))];

        const chatPartners=await User.find({_id:{$in:chatPartnerIds}}).select("-password");

        res.status(200).json(chatPartners);
    }catch(err){
        console.log("Error in getChatPartners controller",err.message);
        res.status(500).json({message:"Internal server error"});
    }
}