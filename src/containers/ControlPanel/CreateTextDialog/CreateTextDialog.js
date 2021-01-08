import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextFormatIcon from '@material-ui/icons/TextFormat';

import ControlContext from "../../../contexts/control-context";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const {
    currBorderColor,
    currFillColor,
    addShape,
    changeCurrMode
  } = React.useContext(ControlContext);

  const handleClickOpen = () => {
    setOpen(true);
    setInput("");
  };

  const handleCancel = () => {
    setOpen(false);
    setInput("");
  };

  const handleConfirm = () => {
    setOpen(false);
    if (input) {
      addShape({
        type: "text",
        textContent: input,
        initCoords: { x: 40, y: 40 },
        borderColor: currBorderColor,
        fillColor: currFillColor
      });
    }
  };

  const handleExit = () => {
    changeCurrMode("select");
  }

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const disableConfirm = !input;

  return (
    <div>
      <TextFormatIcon onClick={handleClickOpen} />
      <Dialog open={open}
        aria-labelledby="form-dialog-title"
        onExit={handleExit}
      >
        <DialogTitle id="form-dialog-title">Add text</DialogTitle>
        <DialogContent>
          <TextField
            value={input}
            onChange={handleChange}
            label="Text content"
            autoFocus
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" disabled={disableConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
