import PeopleLib "../lib/people";
import PeopleTypes "../types/people";
import Map "mo:core/Map";

mixin () {
  let _people : Map.Map<Nat, PeopleTypes.Person> = Map.empty<Nat, PeopleTypes.Person>();
  let _peopleCounters = { var nextId : Nat = 1 };

  let _peopleState : PeopleLib.State = {
    people = _people;
    counters = _peopleCounters;
  };

  PeopleLib.seedPeople(_peopleState);

  public query func getPeople() : async [PeopleTypes.Person] {
    PeopleLib.getAll(_peopleState);
  };

  public query func getPerson(id : Nat) : async ?PeopleTypes.Person {
    PeopleLib.getById(_peopleState, id);
  };

  public func addPerson(
    name : Text,
    role : Text,
    email : Text,
    department : Text,
    avatarInitials : Text,
  ) : async PeopleTypes.Person {
    PeopleLib.addPerson(_peopleState, name, role, email, department, avatarInitials);
  };

  public func updatePersonStatus(id : Nat, status : Text) : async ?PeopleTypes.Person {
    PeopleLib.updatePersonStatus(_peopleState, id, status);
  };

  public func updateMember(
    id : Nat,
    name : Text,
    role : Text,
    email : Text,
    department : Text,
  ) : async ?PeopleTypes.Person {
    PeopleLib.updatePerson(_peopleState, id, name, role, email, department);
  };

  public func removeMember(id : Nat) : async Bool {
    PeopleLib.removePerson(_peopleState, id);
  };
};
