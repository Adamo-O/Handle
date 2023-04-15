import {Finger, FingerCurl, FingerDirection, GestureDescription} from 'fingerpose';

export const nSign = new GestureDescription('N');
// [
//     [
//       "Thumb",
//       "Half Curl",
//       "Diagonal Up Left"
//     ],
//     [
//       "Index",
//       "Full Curl",
//       "Vertical Up"
//     ],
//     [
//       "Middle",
//       "Full Curl",
//       "Vertical Up"
//     ],
//     [
//       "Ring",
//       "Full Curl",
//       "Vertical Up"
//     ],
//     [
//       "Pinky",
//       "Full Curl",
//       "Diagonal Up Left"
//     ]
//   ]

//Thumb
nSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.2);
nSign.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.85);
nSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.85);

//Index
nSign.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.2);
nSign.addCurl(Finger.Index, FingerCurl.FullCurl, 1);
nSign.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.8);

//Middle
nSign.addCurl(Finger.Middle, FingerCurl.HalfCurl, 1.2);
nSign.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
nSign.addDirection(Finger.Middle, FingerDirection.DiagonalUpRight, 0.8);

//Ring
nSign.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
nSign.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.75);

//Pinky
nSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
nSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.75);

