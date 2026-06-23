import ChatTypes "../types/chat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";

module {
  public type Channel = ChatTypes.Channel;
  public type Message = ChatTypes.Message;
  public type DirectMessage = ChatTypes.DirectMessage;

  public type State = {
    channels : Map.Map<Nat, Channel>;
    messages : Map.Map<Nat, Message>;
    directMessages : Map.Map<Nat, DirectMessage>;
    counters : { var nextChannelId : Nat; var nextMessageId : Nat; var nextDmId : Nat };
  };

  public func seedChannels(s : State) {
    let now = Time.now();
    s.channels.add(1, { id = 1; name = "general"; topic = "General discussion"; workspaceId = 1; createdAt = now });
    s.channels.add(2, { id = 2; name = "announcements"; topic = "Important announcements"; workspaceId = 1; createdAt = now });
    s.channels.add(3, { id = 3; name = "random"; topic = "Off-topic chatter"; workspaceId = 1; createdAt = now });
    s.counters.nextChannelId := 4;

    // #general messages
    s.messages.add(1, { id = 1; channelId = 1; authorId = 1; content = "Welcome everyone to TeamFlow! 🎉 Excited to have you all here."; createdAt = now - 5_000_000_000 });
    s.messages.add(2, { id = 2; channelId = 1; authorId = 2; content = "Thanks Alice! The platform looks amazing. Really impressed with the setup."; createdAt = now - 4_000_000_000 });
    s.messages.add(3, { id = 3; channelId = 1; authorId = 3; content = "Agreed! Already started working on the design files. This is going to be great."; createdAt = now - 3_000_000_000 });
    s.messages.add(4, { id = 4; channelId = 1; authorId = 1; content = "We have our first sprint planning tomorrow at 10am. Don't forget!"; createdAt = now - 2_000_000_000 });
    s.messages.add(5, { id = 5; channelId = 1; authorId = 2; content = "Already on the calendar. See you all then!"; createdAt = now - 1_000_000_000 });

    // #announcements messages
    s.messages.add(6, { id = 6; channelId = 2; authorId = 1; content = "🚀 TeamFlow is now live! Welcome to our collaborative workspace platform."; createdAt = now - 6_000_000_000 });
    s.messages.add(7, { id = 7; channelId = 2; authorId = 1; content = "Please take a moment to complete your profile and say hello in #general."; createdAt = now - 5_500_000_000 });
    s.messages.add(8, { id = 8; channelId = 2; authorId = 1; content = "Our team handbook is now available in Documents. Check it out!"; createdAt = now - 4_500_000_000 });

    // #random messages
    s.messages.add(9, { id = 9; channelId = 3; authorId = 2; content = "Anyone else excited for the long weekend? ☀️"; createdAt = now - 3_500_000_000 });
    s.messages.add(10, { id = 10; channelId = 3; authorId = 3; content = "Absolutely! Planning a hiking trip 🏔️"; createdAt = now - 3_200_000_000 });
    s.messages.add(11, { id = 11; channelId = 3; authorId = 1; content = "Fun! I'll be catching up on reading. Enjoy everyone!"; createdAt = now - 3_000_000_000 });
    s.messages.add(12, { id = 12; channelId = 3; authorId = 2; content = "Has anyone tried the new coffee place on Main St? It's incredible."; createdAt = now - 1_500_000_000 });

    s.counters.nextMessageId := 13;
    s.counters.nextDmId := 1;
  };

  public func getChannels(s : State) : [Channel] {
    var result : [Channel] = [];
    for ((_, ch) in s.channels.entries()) {
      result := result.concat([ch]);
    };
    result;
  };

  public func createChannel(s : State, name : Text, topic : Text) : Channel {
    let id = s.counters.nextChannelId;
    s.counters.nextChannelId += 1;
    let ch : Channel = { id; name; topic; workspaceId = 1; createdAt = Time.now() };
    s.channels.add(id, ch);
    ch;
  };

  public func getMessages(s : State, channelId : Nat) : [Message] {
    var result : [Message] = [];
    for ((_, msg) in s.messages.entries()) {
      if (msg.channelId == channelId) {
        result := result.concat([msg]);
      };
    };
    result.sort(func(a : Message, b : Message) : Order.Order { Int.compare(a.createdAt, b.createdAt) });
  };

  public func sendMessage(s : State, channelId : Nat, content : Text, authorId : Nat) : Message {
    let id = s.counters.nextMessageId;
    s.counters.nextMessageId += 1;
    let msg : Message = { id; channelId; authorId; content; createdAt = Time.now() };
    s.messages.add(id, msg);
    msg;
  };

  public func getDirectMessages(s : State, userId : Nat, withUserId : Nat) : [DirectMessage] {
    var result : [DirectMessage] = [];
    for ((_, dm) in s.directMessages.entries()) {
      let isMatch = (dm.fromUserId == userId and dm.toUserId == withUserId)
        or (dm.fromUserId == withUserId and dm.toUserId == userId);
      if (isMatch) {
        result := result.concat([dm]);
      };
    };
    result.sort(func(a : DirectMessage, b : DirectMessage) : Order.Order { Int.compare(a.createdAt, b.createdAt) });
  };

  public func sendDirectMessage(s : State, fromUserId : Nat, toUserId : Nat, content : Text) : DirectMessage {
    let id = s.counters.nextDmId;
    s.counters.nextDmId += 1;
    let dm : DirectMessage = { id; fromUserId; toUserId; content; createdAt = Time.now() };
    s.directMessages.add(id, dm);
    dm;
  };
};
