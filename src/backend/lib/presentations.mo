import PresTypes "../types/presentations";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public type Presentation = PresTypes.Presentation;
  public type Slide = PresTypes.Slide;

  public type State = {
    presentations : Map.Map<Nat, Presentation>;
    slides : Map.Map<Nat, Slide>;
    counters : { var nextPresId : Nat; var nextSlideId : Nat };
  };

  public func seedPresentations(s : State) {
    let now = Time.now();

    s.presentations.add(1, { id = 1; title = "Q3 Roadmap"; createdAt = now; updatedAt = now });
    s.presentations.add(2, { id = 2; title = "Onboarding Deck"; createdAt = now; updatedAt = now });
    s.counters.nextPresId := 3;

    s.slides.add(1, { id = 1; presentationId = 1; position = 0; title = "Q3 Roadmap"; content = "Our goals and priorities for Q3"; visualType = "title" });
    s.slides.add(2, { id = 2; presentationId = 1; position = 1; title = "Key Initiatives"; content = "1. Mobile app v2\n2. Website redesign\n3. Marketing campaign"; visualType = "bullets" });
    s.slides.add(3, { id = 3; presentationId = 1; position = 2; title = "Timeline"; content = "July: Planning\nAugust: Execution\nSeptember: Launch"; visualType = "timeline" });
    s.slides.add(4, { id = 4; presentationId = 2; position = 0; title = "Welcome to TeamFlow"; content = "Your unified workspace"; visualType = "title" });
    s.slides.add(5, { id = 5; presentationId = 2; position = 1; title = "Getting Started"; content = "1. Set up your profile\n2. Join channels\n3. Review your tasks"; visualType = "bullets" });
    s.counters.nextSlideId := 6;
  };

  public func getPresentations(s : State) : [Presentation] {
    var result : [Presentation] = [];
    for ((_, p) in s.presentations.entries()) {
      result := result.concat([p]);
    };
    result;
  };

  public func getPresentation(s : State, id : Nat) : ?Presentation {
    s.presentations.get(id);
  };

  public func getSlides(s : State, presentationId : Nat) : [Slide] {
    var result : [Slide] = [];
    for ((_, sl) in s.slides.entries()) {
      if (sl.presentationId == presentationId) {
        result := result.concat([sl]);
      };
    };
    result;
  };

  public func createPresentation(s : State, title : Text) : Presentation {
    let id = s.counters.nextPresId;
    s.counters.nextPresId += 1;
    let now = Time.now();
    let p : Presentation = { id; title; createdAt = now; updatedAt = now };
    s.presentations.add(id, p);
    p;
  };

  public func renamePresentation(s : State, id : Nat, title : Text) : ?Presentation {
    switch (s.presentations.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; updatedAt = Time.now() };
        s.presentations.add(id, updated);
        ?updated;
      };
    };
  };

  public func deletePresentation(s : State, id : Nat) : Bool {
    switch (s.presentations.get(id)) {
      case null false;
      case (?_) {
        s.presentations.remove(id);
        // Remove all slides for this presentation
        var toRemove : [Nat] = [];
        for ((sid, sl) in s.slides.entries()) {
          if (sl.presentationId == id) { toRemove := toRemove.concat([sid]) };
        };
        for (sid in toRemove.vals()) { s.slides.remove(sid) };
        true;
      };
    };
  };

  public func createSlide(
    s : State,
    presentationId : Nat,
    position : Nat,
    title : Text,
    content : Text,
    visualType : Text,
  ) : Slide {
    let id = s.counters.nextSlideId;
    s.counters.nextSlideId += 1;
    let sl : Slide = { id; presentationId; position; title; content; visualType };
    s.slides.add(id, sl);
    sl;
  };

  public func updateSlide(
    s : State,
    id : Nat,
    title : Text,
    content : Text,
    visualType : Text,
  ) : ?Slide {
    switch (s.slides.get(id)) {
      case null null;
      case (?existing) {
        let updated = { existing with title; content; visualType };
        s.slides.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteSlide(s : State, id : Nat) : Bool {
    switch (s.slides.get(id)) {
      case null false;
      case (?_) {
        s.slides.remove(id);
        true;
      };
    };
  };

  public func reorderSlides(s : State, presentationId : Nat, orderedIds : [Nat]) : [Slide] {
    var pos = 0;
    for (sid in orderedIds.vals()) {
      switch (s.slides.get(sid)) {
        case null {};
        case (?sl) {
          if (sl.presentationId == presentationId) {
            s.slides.add(sid, { sl with position = pos });
          };
        };
      };
      pos += 1;
    };
    getSlides(s, presentationId);
  };
};
