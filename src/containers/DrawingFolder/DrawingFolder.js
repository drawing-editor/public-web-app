import React, { useContext } from "react";
import UpdateSheetDialog from "./UpdateSheetDialog/UpdateSheetDialog";
import ControlContext from "../../contexts/control-context";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import CreateIcon from "@material-ui/icons/Create";
import "./DrawingFolder.css";
require("typeface-varela-round")

const DrawingFolder = () => {
  const {
    addSheet,
    loadSheet,
    deleteSheet,
    userId,
    sheets,
    selectedSheetId
  } = useContext(ControlContext);

  return (
    <div className="drawing-folder-container">
      <div className="folder">
        <Tabs
          className="tabs"
          orientation="vertical"
          variant="scrollable"
          value={selectedSheetId}
        >
        { sheets.map((sheet) => (
            <Tab
              key={sheet.id}
              value={sheet.id}
              label={sheet.title}
              onClick={() => loadSheet(sheet.id)}
            />
          ))
        }
        </Tabs>
      </div>
      <div className="canvas-controls">
        { userId
          ? <AddIcon className="ButtonIcon" onClick={addSheet} />
          : <AddIcon className="ButtonIcon hidden" />
        }
        { userId && selectedSheetId
          ? <>
              <RemoveIcon className="ButtonIcon" onClick={deleteSheet} />
              <UpdateSheetDialog />
            </>
          : <>
              <RemoveIcon className="ButtonIcon hidden" />
              <CreateIcon className="ButtonIcon hidden" />
            </>
        }
      </div>
    </div>
  );
};

export default DrawingFolder;