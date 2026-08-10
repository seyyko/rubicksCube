// 2. LBL:
// We assume the bottom face already has a completed cross.
// First, we look for a corner containing the colors of the front, right, and bottom faces.
//
// If the corner is in the bottom layer:
// - If it is already correctly positioned and oriented, we leave it untouched.
// - If it is correctly positioned but incorrectly oriented, we perform the Sexy Move until it is oriented correctly.
// - Otherwise, we bring it to the top layer and insert it into the correct position.
//
// We repeat this process for all four corners.
//
// EDGE PARKING :
// Once the first layer is completed, we focus on the edges.
// We rotate the cube and, at each rotation, check whether the right edge
// of the front face contains an edge piece that does NOT have the top-face color.
//
// If it does, we move that edge to the top layer without disturbing any of the
// already solved corners.
//
// The top layer has four edge slots. A slot is considered empty when it contains
// an edge piece with the top-face color.
//
// To insert an edge into the top layer:
// - The edge must be located between the front and right faces.
//   (Since we check this condition at each cube rotation, this should already be true.)
// - Slot #2 on the top face must be empty.
//   If it is not, simply rotate the top face until slot #2 becomes empty.
//
// Example configuration:
// Front face (edge)
// [ ] [ ] [ ]
// [ ] [ ] [e]
// [ ] [ ] [ ]
// Right face (edge)
// [ ] [ ] [ ]
// [e] [ ] [ ]
// [ ] [ ] [ ]
// Upper face (slots)
// [ ] [1] [ ]
// [2] [ ] [3]
// [ ] [4] [ ]

// The goal is to fill all four edge slots in the top layer.
// Once all required edges have been moved there, they can be paired
// and inserted into their corresponding corner positions using the
// standard beginner F2L method.
//
// After all edge-corner pairs are inserted correctly,
// the F2L is complete.
