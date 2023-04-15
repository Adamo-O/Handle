import {Finger, FingerCurl, FingerDirection, GestureDescription} from 'fingerpose';

export const mSign = new GestureDescription('M');
// [
//     [
//       "Thumb",
//       "Half Curl",
//       "Diagonal Up Left"
//     ],
//     [
//       "Index",
//       "Full Curl",
//       "Diagonal Up Right"
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
//       "Vertical Up"
//     ]
//   ]

//Thumb
mSign.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
// mSign.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 0.7);
mSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 0.7);

//Index
mSign.addCurl(Finger.Index, FingerCurl.FullCurl, 1);
mSign.addDirection(Finger.Index, FingerDirection.DiagonalUpRight, 0.70);

//Middle
mSign.addCurl(Finger.Middle, FingerCurl.FullCurl, 1);
mSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 0.70);

//Ring
mSign.addCurl(Finger.Ring, FingerCurl.FullCurl, 1);
mSign.addDirection(Finger.Ring, FingerDirection.VerticalUp, 0.70);

//Pinky
mSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1);
mSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 0.70);

