import "./App.css";

import {
  RenderingEngine,
  Enums,
  init as csInit,
  Types,
  volumeLoader,
  setVolumesForViewports,
  setUseCPURendering,
} from "@cornerstonejs/core";
import * as cornerstoneTools from '@cornerstonejs/tools';
import { cornerstoneNiftiImageVolumeLoader } from "@cornerstonejs/nifti-volume-loader";
import { useEffect, useId, useRef } from "react";

const {
  LengthTool,
  ToolGroupManager,
  StackScrollMouseWheelTool,
  ZoomTool,
  Enums: csToolsEnums,
  init: csTools3dInit, // ! imporant
  ProbeTool,
  RectangleROITool,
  EllipticalROITool,
  CircleROITool,
  WindowLevelTool,
  PanTool,
  BidirectionalTool,
  AngleTool,
  CobbAngleTool,
  ArrowAnnotateTool,
} = cornerstoneTools;

const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;

//////////////////////////////////////////////

const toolsNames = [
  WindowLevelTool.toolName,
  PanTool.toolName,
  LengthTool.toolName,
  ProbeTool.toolName,
  RectangleROITool.toolName,
  EllipticalROITool.toolName,
  CircleROITool.toolName,
  BidirectionalTool.toolName,
  AngleTool.toolName,
  CobbAngleTool.toolName,
  ArrowAnnotateTool.toolName,
];

let selectedToolName = toolsNames[0];
const toolGroupId = 'STACK_TOOL_GROUP_ID';

//////////////////////////////////////////////
const windowWidth = 400;
const windowCenter = 40;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

export function setCtTransferFunctionForVolumeActor({ volumeActor } : { volumeActor: any }) {
  volumeActor
    .getProperty()
    .getRGBTransferFunction(0)
    .setMappingRange(lower, upper);
}
//////////////////////////////////////////////

const viewportId1 = "CT_NIFTI_AXIAL";
const viewportId2 = "CT_NIFTI_SAGITTAL";
const viewportId3 = "CT_NIFTI_CORONAL";

const viewportIds = [viewportId1, viewportId2, viewportId3];

function setTools(renderingEngineId) {
  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(LengthTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(ProbeTool);
  cornerstoneTools.addTool(RectangleROITool);
  cornerstoneTools.addTool(EllipticalROITool);
  cornerstoneTools.addTool(CircleROITool);
  cornerstoneTools.addTool(BidirectionalTool);
  cornerstoneTools.addTool(AngleTool);
  cornerstoneTools.addTool(CobbAngleTool);
  cornerstoneTools.addTool(ArrowAnnotateTool);

  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)!;

  // Add the tools to the tool group and specify which volume they are pointing at
  toolGroup.addTool(WindowLevelTool.toolName);
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(RectangleROITool.toolName);
  toolGroup.addTool(EllipticalROITool.toolName);
  toolGroup.addTool(StackScrollMouseWheelTool.toolName);
  toolGroup.addTool(LengthTool.toolName);
  toolGroup.addTool(ProbeTool.toolName);
  toolGroup.addTool(RectangleROITool.toolName);
  toolGroup.addTool(CircleROITool.toolName);
  toolGroup.addTool(BidirectionalTool.toolName);
  toolGroup.addTool(AngleTool.toolName);
  toolGroup.addTool(CobbAngleTool.toolName);
  toolGroup.addTool(ArrowAnnotateTool.toolName);

  // Set the initial state of the tools, here we set one tool active on left click.
  // This means left click will draw that tool.
  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary, // Left Click
      },
    ],
  });

  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Right Click
      },
    ],
  });

    // As the Stack Scroll mouse wheel is a tool using the `mouseWheelCallback`
  // hook instead of mouse buttons, it does not need to assign any mouse button.
  toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

  toolGroup.setToolPassive(ProbeTool.toolName);
  toolGroup.setToolPassive(RectangleROITool.toolName);
  toolGroup.setToolPassive(EllipticalROITool.toolName);
  toolGroup.setToolPassive(CircleROITool.toolName);
  toolGroup.setToolPassive(BidirectionalTool.toolName);
  toolGroup.setToolPassive(AngleTool.toolName);
  toolGroup.setToolPassive(CobbAngleTool.toolName);
  toolGroup.setToolPassive(ArrowAnnotateTool.toolName);

    // Set the tool group on the viewports
    viewportIds.forEach((viewportId) =>
    toolGroup.addViewport(viewportId, renderingEngineId)
  );

}

async function setup(element1: any, element2: any, element3: any) {
  setUseCPURendering(false); // chuje leca w kulki, nie dziala fallback do cpu :|
  await csInit();
  await csTools3dInit();
  console.log("Cornerstone initialized");
  volumeLoader.registerVolumeLoader("nifti", cornerstoneNiftiImageVolumeLoader);
 
  const niftiURL = new URL('../abd.nii.gz', import.meta.url).href;
  console.log(niftiURL);
  //const niftiURL = "https://ohif-assets.s3.us-east-2.amazonaws.com/nifti/MRHead.nii.gz";
  const volumeId = "nifti:" + niftiURL;

  console.time("Loading volume");
  const volume = await volumeLoader.createAndCacheVolume(volumeId);
  console.timeEnd("Loading volume");
  console.log("Volume loaded");
  console.log(volume);

  const renderingEngineId = "myRenderingEngine";
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportInputArray = [
    {
      viewportId: viewportId1,
      type: Enums.ViewportType.ORTHOGRAPHIC,
      element: element1,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportId2,
      type: Enums.ViewportType.ORTHOGRAPHIC,
      element: element2,
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
    {
      viewportId: viewportId3,
      type: Enums.ViewportType.ORTHOGRAPHIC,
      element: element3,
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
  ];
  renderingEngine.setViewports(viewportInputArray);
  console.log("Setting up viewports done");

  
  setTools(renderingEngineId);
  console.log("Setting up tools done");

  setVolumesForViewports(
    renderingEngine,
    [{ volumeId, callback: setCtTransferFunctionForVolumeActor }],
    viewportInputArray.map((v) => v.viewportId)
  );

  renderingEngine.render();

}

function Cornerstone() {
  const id = useId();
  const ref = useRef(false);

  useEffect(() => {
    // to ensure this is only called once
    // I don't know how to reset this
    if (ref.current) {
      return;
    }
    ref.current = true;

    let content = document.getElementById(id);
    if (!content) {
      return;
    }
    // ensure it is cleared
    content.innerHTML = "";

    const viewportGrid = document.createElement("div");
    viewportGrid.style.background = "#0000cc";
    viewportGrid.style.display = "flex";
    viewportGrid.style.flexDirection = "row";
    viewportGrid.style.gap = "2px";
    viewportGrid.style.width = "100%";
    viewportGrid.style.height = "100%";
    const size = "256px";

    const element1 = document.createElement("div");
    const element2 = document.createElement("div");
    const element3 = document.createElement("div");
    element1.style.width = size;
    element1.style.height = size;
    element1.id = viewportId1;
    element2.style.width = size;
    element2.style.height = size;
    element2.id = viewportId2;
    element3.style.width = size;
    element3.style.height = size;
    element3.id = viewportId3;

    viewportGrid.appendChild(element1);
    viewportGrid.appendChild(element2);
    viewportGrid.appendChild(element3);

    content!.appendChild(viewportGrid);

    setup(element1, element2, element3);
  }, [id]);

  return (
    <>
      <div
        id={id}
        style={{
          background: "#032c0a",
        }}
      ></div>
    </>
  );
}

function App() {
  return (
    <>
      <h1>Test cornerstone</h1>
      <Cornerstone />
    </>
  );
}

export default App;
