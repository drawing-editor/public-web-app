import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import AddImgIcon from "@material-ui/icons/Image";

import ImageCard from "./ImageCard/ImageCard";

import { initFetchPictures, nextFetchPictures } from "./Unsplash";
import { initFetchGIPHY, nextFetchGIPHY } from "./Giphy";
import "./AddImageDialog.css";

import ControlContext from "../../../contexts/control-context";

function TabPanel(props) {
  let { value, index, items, hasMore, handleLoadMore, ...other } = props;

  return (
    <div
      className="tabPanel"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {
            items.length === 0
            ? <p>No Results found</p>
            : <Box className="ImageCardList">
              {
                items.map((item, idx) => (
                  <ImageCard key={idx} {...item} />
                ))
              }
              </Box>
          }
          {
            hasMore
            ? <Button className="loadMoreButton" onClick={handleLoadMore}>More</Button>
            : null
          }
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const initialSearchResultState = { 
  items: [],
  page: 1,
  totalPages: 0,
  query: null,
  hadMore: false
};

function searchResultReducer(state, action) {
  switch (action.type) {
    case "FIRST_FETCH":
      return {
        items: action.newItems,
        page: state.page + 1,
        totalPages: action.totalPages,
        query: action.query,
        hasMore: action.totalPages >= state.page
      }
    case "NEXT_FETCH":
      return {
        ...state,
        items: [...state.items, ...action.newItems],
        page: state.page + 1,
        hasMore: state.totalPages >= state.page
      };
    case "RESET":
      return initialSearchResultState;
    default:
      throw new Error();
  }
}

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [tabValue, setTabValue] = React.useState(0);

  const [pictures, pictureDispatch] = React.useReducer(searchResultReducer, initialSearchResultState);
  const [GIFs, GIFDispatch] = React.useReducer(searchResultReducer, initialSearchResultState);
  const [stickers, stickerDispatch] = React.useReducer(searchResultReducer, initialSearchResultState);

  const { changeCurrMode } = React.useContext(ControlContext);

  const handleClickOpen = () => {
    setOpen(true);
    setInput("");
  };

  const handleCancel = () => {
    setOpen(false);
    setInput("");
    pictureDispatch({ type: "RESET" });
    GIFDispatch({ type: "RESET" });
    stickerDispatch({ type: "RESET" });
  };

  const handleExit = () => {
    changeCurrMode("select");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue);
  };

  const disableSearch = !input;

  const handleSearch = (e) => {
    if (input) {
      initFetchPictures(input, pictures.page, pictureDispatch);
      initFetchGIPHY("GIF", input, GIFs.page, GIFDispatch);
      initFetchGIPHY("sticker", input, stickers.page, stickerDispatch);
    }
  };

  return (
    <div>
      <AddImgIcon onClick={handleClickOpen} />
      <Dialog open={open}
        aria-labelledby="form-dialog-title"
        className="addImageDialogWrapper"
        maxWidth="md"
        fullWidth
        onExit={handleExit}
      >
        <DialogTitle id="form-dialog-title">Add image</DialogTitle>
        <DialogContent>
          <TextField
            value={input}
            onChange={handleInputChange}
            label="Keyword"
            autoFocus
            fullWidth
          />
          <div className="addImageDialogSearchButtonWrapper">
            <Button onClick={handleSearch} color="primary" disabled={disableSearch}>
              Search
            </Button>            
          </div>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Pictures" {...a11yProps(0)} />
            <Tab label="GIFs" {...a11yProps(1)} />
            <Tab label="Stickers" {...a11yProps(2)} />
          </Tabs>
          <TabPanel
            value={tabValue}
            index={0}
            items={pictures.items}
            hasMore={pictures.hasMore}
            handleLoadMore={() => nextFetchPictures(pictures, pictureDispatch)}
          />
          <TabPanel
            value={tabValue}
            index={1}
            items={GIFs.items}
            hasMore={GIFs.hasMore}
            handleLoadMore={() => nextFetchGIPHY("GIF", GIFs, GIFDispatch)}
          />
          <TabPanel
            value={tabValue}
            index={2}
            items={stickers.items}
            hasMore={stickers.hasMore}
            handleLoadMore={() => nextFetchGIPHY("sticker", stickers, stickerDispatch)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
