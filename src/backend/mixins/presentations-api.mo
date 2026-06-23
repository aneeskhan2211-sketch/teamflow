import PresLib "../lib/presentations";
import PresTypes "../types/presentations";
import Map "mo:core/Map";

mixin () {
  let _presentations : Map.Map<Nat, PresTypes.Presentation> = Map.empty<Nat, PresTypes.Presentation>();
  let _slides : Map.Map<Nat, PresTypes.Slide> = Map.empty<Nat, PresTypes.Slide>();
  let _presCounters = { var nextPresId : Nat = 1; var nextSlideId : Nat = 1 };

  let _presState : PresLib.State = {
    presentations = _presentations;
    slides = _slides;
    counters = _presCounters;
  };

  PresLib.seedPresentations(_presState);

  public query func getPresentations() : async [PresTypes.Presentation] {
    PresLib.getPresentations(_presState);
  };

  public query func getPresentation(id : Nat) : async ?PresTypes.Presentation {
    PresLib.getPresentation(_presState, id);
  };

  public query func getPresentationSlides(presentationId : Nat) : async [PresTypes.Slide] {
    PresLib.getSlides(_presState, presentationId);
  };

  public func createPresentation(title : Text) : async PresTypes.Presentation {
    PresLib.createPresentation(_presState, title);
  };

  public func createSlide(
    presentationId : Nat,
    position : Nat,
    title : Text,
    content : Text,
    visualType : Text,
  ) : async PresTypes.Slide {
    PresLib.createSlide(_presState, presentationId, position, title, content, visualType);
  };

  public func updateSlide(
    id : Nat,
    title : Text,
    content : Text,
    visualType : Text,
  ) : async ?PresTypes.Slide {
    PresLib.updateSlide(_presState, id, title, content, visualType);
  };

  public func deleteSlide(id : Nat) : async Bool {
    PresLib.deleteSlide(_presState, id);
  };

  public func renamePresentation(id : Nat, title : Text) : async ?PresTypes.Presentation {
    PresLib.renamePresentation(_presState, id, title);
  };

  public func deletePresentation(id : Nat) : async Bool {
    PresLib.deletePresentation(_presState, id);
  };

  public func reorderSlides(presentationId : Nat, orderedIds : [Nat]) : async [PresTypes.Slide] {
    PresLib.reorderSlides(_presState, presentationId, orderedIds);
  };
};
