import {Finger, FingerCurl, FingerDirection, GestureDescription} from 'fingerpose';

export const thumbSign = new GestureDescription('👍');
// [
//     [
//       "Thumb",
//       "No Curl",
//       "Vertical Up"
//     ],
//     [
//       "Index",
//       "Full Curl",
//       "Horizontal Right"
//     ],
//     [
//       "Middle",
//       "Full Curl",
//       "Horizontal Right"
//     ],
//     [
//       "Ring",
//       "Full Curl",
//       "Horizontal Right"
//     ],
//     [
//       "Pinky",
//       "Full Curl",
//       "Horizontal Right"
//     ]
//   ]

//Thumb
thumbSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 0.70);

//Index
thumbSign.addCurl(Finger.Index, FingerCurl.FullCurl, 1);
thumbSign.addDirection(Finger.Index, FingerDirection.HorizontalRight, 0.70);
thumbSign.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 0.70);

//Middle
thumbSign.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
thumbSign.addDirection(Finger.Middle, FingerDirection.HorizontalRight, 0.70);
thumbSign.addDirection(Finger.Middle, FingerDirection.HorizontalLeft, 0.70);

//Ring
thumbSign.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
thumbSign.addDirection(Finger.Ring, FingerDirection.HorizontalRight, 0.70);
thumbSign.addDirection(Finger.Ring, FingerDirection.HorizontalLeft, 0.70);

//Pinky
thumbSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
thumbSign.addDirection(Finger.Pinky, FingerDirection.HorizontalRight, 0.70);
thumbSign.addDirection(Finger.Pinky, FingerDirection.HorizontalLeft, 0.70);

