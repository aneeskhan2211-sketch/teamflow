module {
  public type Presentation = {
    id : Nat;
    title : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Slide = {
    id : Nat;
    presentationId : Nat;
    position : Nat;
    title : Text;
    content : Text;
    visualType : Text;
  };
};
