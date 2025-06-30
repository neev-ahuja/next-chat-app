import { User2 } from 'lucide-react';
import mongoose, { Schema, model, models } from 'mongoose';

const mongodb = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
    if(mongodb) mongoose.connect(mongodb);
}

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name : String ,
    avatar : String ,
    contacts: [{
        name: { type: String, required: true },
        email: { type: String, required: true },
        lastMessage: String,
        time: String,
        unread: Number,
        online: Boolean,
        avatar: String
    }]
});

const messageSchema = new Schema({
    emails : [String , String],
    messages : [{
        sender : String,
        content : String ,
        time : String ,
        isOwn : Boolean
    }
    ]
})

const User = models.User || model('User', userSchema);

const Message = models.Message || model('Message', messageSchema);


const getUser = async (email : String , name : String , avatar : String) => {
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({
        name : name ,
        email : email ,
        avatar : avatar,
        contacts : []
    });
        user.save();
    }
    return user;
};


const addContact = async (email : String , contactMail : String) => {
    try{
        let user = await User.findOne({ email });
        if(!user) return {err : "Error"};
        let user2 = await User.findOne({ email : contactMail});
        if(!user2) return {message : "No User Found"};
        user.contacts.push({
            name : user2.name,
            email : contactMail ,
            lastMessage : "" ,
            time : "" ,
            unread : 0,
            online : false,
            avatar : user2.avatar
        });
        user.save();  
    } catch(err) {
        return {err};
    }
    return {message : "sucess"}
}

const getMessages = async (email1 : String , email2 : String) => {
    let msg = await Message.findOne({ emails: { $all: [email1, email2] } });
    if(!msg) {
        const message = new Message({
            emails : [email1 , email2] ,
            messages : []
        });
        const user2 = await User.findOne({email : email2});
        const user1 = await User.findOne({email : email1});
        if(!user1 || !user2) {
            message.save();
            return message;
        }
        user2.contacts.forEach((element: any) => {
            if(element.email == email1) {
                message.save();
                return message;
            }
        });
        user2.contacts.push({
            name: user1.name,
            email: user1.email,
            lastMessage: "",
            time: "",
            unread: 0,
            online: false,
            avatar: user1.avatar
        });
        user2.save();
        message.save();
        return message;
    }
    return msg;
}

const sendMessage = async (email1 : String , email2 : String , content : String) => {
    let msg = await Message.findOne({ emails: { $all: [email1, email2] } });
    if(!msg) {
        const message = new Message({
            emails : [email1 , email2] ,
            messages : [{
                sender : email1 ,
                content : content,
                time : new Date().toISOString(),
                isOwn : false
            }]
        });
        message.save();
        return message;
    }
    msg.messages.push({
        sender : email1,
        content : content ,
        time : new Date().toISOString(),
        isOwn : false
    });
    msg.save();
    return msg;
}

export default {getUser , addContact , sendMessage , getMessages};    