import "./App.css";

import {
  RenderingEngine,
  Enums,
  init as csInit,
  volumeLoader,
  setVolumesForViewports,
  // setUseCPURendering,
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
  init: csTools3dInit, // ! important
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
  SegmentationDisplayTool,
  segmentation
} = cornerstoneTools;

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
  SegmentationDisplayTool.toolName,
];

const selectedToolName = toolsNames[0];
const toolGroupId = 'STACK_TOOL_GROUP_ID';

//////////////////////////////////////////////
const windowWidth = 2000;
const windowCenter = 1000;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

export function setCtTransferFunctionForVolumeActor({ volumeActor } : { volumeActor: any }) {
  volumeActor
    .getProperty()
    .getRGBTransferFunction(0)
    .setMappingRange(lower, upper);
}
//////////////////////////////////////////////


let addedTools = false;
function setTools() {
  if (addedTools) {
    return;
  }
  addedTools = true;
  console.log(selectedToolName);
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
  cornerstoneTools.addTool(SegmentationDisplayTool);

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
  toolGroup.addTool(SegmentationDisplayTool.toolName);

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
  
  toolGroup.setToolEnabled(SegmentationDisplayTool.toolName)

  toolGroup.setToolPassive(ProbeTool.toolName);
  toolGroup.setToolPassive(RectangleROITool.toolName);
  toolGroup.setToolPassive(EllipticalROITool.toolName);
  toolGroup.setToolPassive(CircleROITool.toolName);
  toolGroup.setToolPassive(BidirectionalTool.toolName);
  toolGroup.setToolPassive(AngleTool.toolName);
  toolGroup.setToolPassive(CobbAngleTool.toolName);
  toolGroup.setToolPassive(ArrowAnnotateTool.toolName);

  return toolGroup;
}


console.log("Initializing cornerstone");
await csInit();
console.log("Cornerstone initialized");
await csTools3dInit();
console.log("Setting up tools");
const toolGroup = setTools();
console.log("Setup tools done");
volumeLoader.registerVolumeLoader("nifti", cornerstoneNiftiImageVolumeLoader);

async function setup(viewportInputArray, volumeUrl: string, labelUrl: string) {
  // setUseCPURendering(false); // sometimes fallback to cpu does not work (on my laptop with weak gpu)
 
  console.log(labelUrl);
  console.log(volumeUrl);
  
  console.time("Loading volume");
  const volumeId = "nifti:" + volumeUrl;
  const volume = await volumeLoader.createAndCacheVolume(volumeId);
  console.timeEnd("Loading volume");
  const labelId = "nifti:" + labelUrl;
  const segmentationId = "LESION_SEG_1";
  console.log(labelId)
  const label = await volumeLoader.createAndCacheVolume(labelId);
  console.time("Load label")
  console.timeEnd("Load label")

  console.log("Volume loaded");
  console.log(volume);
  console.log(label);

  const renderingEngineId = "render" + viewportInputArray[0].viewportId;
  const renderingEngine = new RenderingEngine(renderingEngineId);

  renderingEngine.setViewports(viewportInputArray);
  console.log("Setting up viewports done");

  segmentation.addSegmentations([
    {
      segmentationId,
      representation: {
        // The type of segmentation
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
        // The actual segmentation data, in the case of labelmap this is a
        // reference to the source volume of the segmentation.
        data: {
          volumeId: labelId,
        },
      },
    },
  ]);

  // Set the tool group on the viewports
  viewportInputArray.forEach(({viewportId}) =>
    toolGroup.addViewport(viewportId, renderingEngineId)
  );
  console.log("Setting up tools done");

  setVolumesForViewports(
    renderingEngine,
    [{ volumeId, callback: setCtTransferFunctionForVolumeActor }],
    viewportInputArray.map((v) => v.viewportId)
  );

  // Add the segmentation representation to the toolGroup
  await segmentation.addSegmentationRepresentations(toolGroupId, [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
    },
  ]);

  renderingEngine.render();
}


function Cornerstone({volumeUrl, labelUrl}) {
  const id = useId();
  const ref = useRef(false);

  const ids = useId();
  console.log(ids);

  console.log(volumeUrl, labelUrl, id);

  const viewportId1 = useId();
  const viewportId2 = useId();
  const viewportId3 = useId();

  useEffect(() => {
    // to ensure this is only called once
    // I don't know how to reset this
    if (ref.current) {
      return;
    }
    ref.current = true;

    const viewportInputArray = [
      {
        viewportId: viewportId1,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: document.getElementById(viewportId1),
        defaultOptions: {
          orientation: Enums.OrientationAxis.AXIAL,
        },
      },
      {
        viewportId: viewportId2,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: document.getElementById(viewportId2),
        defaultOptions: {
          orientation: Enums.OrientationAxis.SAGITTAL,
        },
      },
      {
        viewportId: viewportId3,
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: document.getElementById(viewportId3),
        defaultOptions: {
          orientation: Enums.OrientationAxis.CORONAL,
        },
      }];

    setup(viewportInputArray, volumeUrl, labelUrl);

    const handleResize = () => {
      console.log("Resizing");
    }
    console.log("Adding resize event listener");
    window.addEventListener('resize', handleResize);

    return () => {
      // cleanup
      console.log("Cleaning up! why it is called???");
      console.log("Removing resize event listener");
      window.removeEventListener('resize', handleResize);
    }
  }, [id, volumeUrl, labelUrl, viewportId1, viewportId2, viewportId3]);

  return (
    <>
    <div className="flex flex-col lg:flex-row min-w-full min-h-[90vh] flex-grow gap-1 bg-black" onContextMenu={(e) => e.preventDefault()}>
      <div className="border-green-800 border-2 relative flex-grow">
        <div className="absolute top-0 left-0 w-full h-full" id={viewportId1}/>
        <span className="absolute bottom-0 left-0 bg-green-800 text-white p-1 rounded-tr-md">AXIAL</span>
      </div>

      <div className="border-yellow-600 border-2 relative flex-grow">
        <div className="absolute top-0 left-0 w-full h-full" id={viewportId2}/>
        <span className="absolute bottom-0 left-0 bg-yellow-600 text-white p-1 rounded-tr-md">SAGITTAL</span>
      </div>

      <div className="border-red-800 border-2 relative flex-grow">
        <div className="absolute top-0 left-0 w-full h-full" id={viewportId3}/>
        <span className="absolute bottom-0 left-0 bg-red-800 p-1 text-white rounded-tr-md">CORONAL</span>
      </div>
    </div>
    </>
  );
}

function App() {
  const niftiURL = new URL('../pat3.nii.gz', import.meta.url).href;
  const labelURL = new URL('../pat3_label.nii.gz', import.meta.url).href;

  return (
    <>
      <Cornerstone volumeUrl={niftiURL} labelUrl={labelURL} />
    </>
  );
}

export default App;
