# 2D/3D Polygon Viewer

## Overview
The **2D/3D Polygon Viewer** is a web application that allows users to visualize polygons in both 2D and 3D using data from a JSON file. The application includes interactive features like pan, zoom, polygon selection, and 3D rotation. It runs locally using Node.js.

## Features

### 2D Viewer
- **Dropdown Menu**: Lists all sections found under the `polygonsBySection` node in the JSON file. Each section corresponds to a different set of polygons.
- **Polygon Rendering**: Upon selecting a section from the dropdown, all polygons within that section are rendered on the 2D viewer.
- **Zoom and Pan**: Users can zoom in and out, and pan across the viewer. Both horizontal and vertical axes adjust accordingly.
- **Polygon Selection**: Users can click on individual polygons to select them.

### 3D Viewer
- **Display All Polygons**: Shows polygons from all sections on a 3D plane.
- **Gridline**: A gridline is drawn at the floor level, bound by the min/max coordinates of the polygons.
- **Zoom, Rotate, Pan**: Users can zoom, rotate, and pan across the 3D scene.

## JSON File Structure
The coordinates for the vertices are stored in a JSON file. The relevant data is found under the `polygonsBySection` node, where several sections are defined. Each section contains polygon data, including the coordinates of their vertices.

### Example JSON Structure
```json
{
  "polygonsBySection": {
    "section1": [
      {
        "vertices": [[x1, y1], [x2, y2], [x3, y3], ...]
      },
      ...
    ],
    "section2": [
      {
        "vertices": [[x1, y1], [x2, y2], [x3, y3], ...]
      },
      ...
    ]
  }
}
```
### Getting Started

**Prerequisites**
- Node.js (v16 or higher)
- npm (v7 or higher)

**Installation**

+ Clone the repository:
git clone https://github.com/ceowapp/rocscience-test1.git

+ Install the required dependencies:

    ```npm install```

+ Running the Project
Start the server:

    ```node server.js```

Open your browser and navigate to:
```http://localhost:3000```

You should now see the 2D and 3D viewers in your browser.

**Controls**

+ 2D Viewer
1. Zoom: Scroll in/out to zoom.
2. Pan: Click and drag to pan around the view.
3. Select Polygon: Click on any polygon to select it.
+ 3D Viewer
1. Zoom: Scroll in/out to zoom.
2. Rotate: Click and drag to rotate the 3D view.
3. Pan: Right-click and drag to pan across the view.

**Screenshots**

2D Viewer
<Image goes here>

3D Viewer
<Image goes here>

**Contributing**

If you'd like to contribute to this project, feel free to submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

**License**

This project is licensed under the MIT License - see the LICENSE file for details.

