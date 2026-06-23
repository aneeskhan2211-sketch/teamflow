import PeopleTypes "../types/people";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type Person = PeopleTypes.Person;

  public type State = {
    people : Map.Map<Nat, Person>;
    counters : { var nextId : Nat };
  };

  public func seedPeople(s : State) {
    let now = Time.now();

    s.people.add(1, { id = 1; name = "Alex Rivera"; role = "Product Manager"; email = "alex@teamflow.app"; department = "Product"; status = "active"; avatarInitials = "AR"; createdAt = now });
    s.people.add(2, { id = 2; name = "Jamie Chen"; role = "Lead Engineer"; email = "jamie@teamflow.app"; department = "Engineering"; status = "active"; avatarInitials = "JC"; createdAt = now });
    s.people.add(3, { id = 3; name = "Morgan Lee"; role = "Designer"; email = "morgan@teamflow.app"; department = "Design"; status = "active"; avatarInitials = "ML"; createdAt = now });
    s.people.add(4, { id = 4; name = "Taylor Kim"; role = "Marketing Lead"; email = "taylor@teamflow.app"; department = "Marketing"; status = "active"; avatarInitials = "TK"; createdAt = now });
    s.people.add(5, { id = 5; name = "Jordan Park"; role = "Customer Success"; email = "jordan@teamflow.app"; department = "Operations"; status = "away"; avatarInitials = "JP"; createdAt = now });
    s.counters.nextId := 6;
  };

  public func getAll(s : State) : [Person] {
    var result : [Person] = [];
    for ((_, p) in s.people.entries()) {
      result := result.concat([p]);
    };
    result;
  };

  public func getById(s : State, id : Nat) : ?Person {
    s.people.get(id);
  };

  public func addPerson(
    s : State,
    name : Text,
    role : Text,
    email : Text,
    department : Text,
    avatarInitials : Text,
  ) : Person {
    let id = s.counters.nextId;
    s.counters.nextId += 1;
    let p : Person = { id; name; role; email; department; status = "active"; avatarInitials; createdAt = Time.now() };
    s.people.add(id, p);
    p;
  };

  public func updatePersonStatus(s : State, id : Nat, status : Text) : ?Person {
    switch (s.people.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with status };
        s.people.add(id, updated);
        ?updated;
      };
    };
  };

  public func updatePerson(
    s : State,
    id : Nat,
    name : Text,
    role : Text,
    email : Text,
    department : Text,
  ) : ?Person {
    switch (s.people.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with name; role; email; department };
        s.people.add(id, updated);
        ?updated;
      };
    };
  };

  public func removePerson(s : State, id : Nat) : Bool {
    switch (s.people.get(id)) {
      case null false;
      case (?_) {
        s.people.remove(id);
        true;
      };
    };
  };
};
