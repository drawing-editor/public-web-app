import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CreateIcon from "@material-ui/icons/Create";

import ControlContext from "../../../contexts/control-context";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const {
    updateSheet
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
    updateSheet({"title": input});
  }

  const handleChange = (e) => {
    setInput(e.target.value);
  }

  return (
    <div>
      <CreateIcon className="ButtonIcon" onClick={handleClickOpen} />
      <Dialog open={open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Update sheet title</DialogTitle>
        <DialogContent>
          <TextField
            value={input}
            onChange={handleChange}
            label="Title"
            autoFocus
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
