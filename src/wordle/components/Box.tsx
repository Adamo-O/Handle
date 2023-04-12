import "./Box.css";

function Box(props: {
  t?: "edit" | "right" | "wrong" | "wplaced" | "display";
  letter: string;
}) {
  let case_type = "";

  switch (props.t) {
    case "display":
      case_type = "case-x";
      break;
    case "edit":
      case_type = "case-b";
      break;
    case "right":
      case_type = "case-g";
      break;
    case "wrong":
      case_type = "case-e";
      break;
    case "wplaced":
      case_type = "case-y";
      break;
    default:
      break;
  }

  return <div className={"case " + case_type}>{props.letter}</div>;
}

export default Box;
