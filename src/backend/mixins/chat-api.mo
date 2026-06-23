import ChatLib "../lib/chat";
import ChatTypes "../types/chat";
import Map "mo:core/Map";

mixin () {
  let _chatChannels : Map.Map<Nat, ChatTypes.Channel> = Map.empty<Nat, ChatTypes.Channel>();
  let _chatMessages : Map.Map<Nat, ChatTypes.Message> = Map.empty<Nat, ChatTypes.Message>();
  let _chatDms : Map.Map<Nat, ChatTypes.DirectMessage> = Map.empty<Nat, ChatTypes.DirectMessage>();
  let _chatCounters = { var nextChannelId : Nat = 1; var nextMessageId : Nat = 1; var nextDmId : Nat = 1 };

  let _chatState : ChatLib.State = {
    channels = _chatChannels;
    messages = _chatMessages;
    directMessages = _chatDms;
    counters = _chatCounters;
  };

  // Seed immediately at actor init time
  ChatLib.seedChannels(_chatState);

  public query func getChannels() : async [ChatTypes.Channel] {
    ChatLib.getChannels(_chatState);
  };

  public func createChannel(name : Text, topic : Text) : async ChatTypes.Channel {
    ChatLib.createChannel(_chatState, name, topic);
  };

  public query func getMessages(channelId : Nat) : async [ChatTypes.Message] {
    ChatLib.getMessages(_chatState, channelId);
  };

  public func sendMessage(channelId : Nat, content : Text, authorId : Nat) : async ChatTypes.Message {
    ChatLib.sendMessage(_chatState, channelId, content, authorId);
  };

  public query func getDirectMessages(userId : Nat, withUserId : Nat) : async [ChatTypes.DirectMessage] {
    ChatLib.getDirectMessages(_chatState, userId, withUserId);
  };

  public func sendDirectMessage(fromUserId : Nat, toUserId : Nat, content : Text) : async ChatTypes.DirectMessage {
    ChatLib.sendDirectMessage(_chatState, fromUserId, toUserId, content);
  };
};
