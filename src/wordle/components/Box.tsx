import { ComponentProps } from "react";
import "./Box.css";

interface BoxProps extends ComponentProps<'div'> {
  t?: "edit" | "right" | "wrong" | "wplaced" | "display";
  letter: string;
}

function Box(props: BoxProps) {
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

  return <div {...props} className={`${props.className} case ${case_type}`}>{props.letter}</div>;
}

export default Box;
