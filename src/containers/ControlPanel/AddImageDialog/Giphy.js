import axios from "axios";
import { APIConfig } from "./APIConfig";

const GIF_URL = "https://api.giphy.com/v1/gifs/search";
const STICKER_URL = "https://api.giphy.com/v1/stickers/search";

const getImages = (imageType, query, page) => {
  let url = (imageType === "GIF") ? GIF_URL : STICKER_URL;
  return axios
  .get(url, {
    params: {
      q: query,
      api_key: APIConfig.GIPHY_API_KEY,
      limit: 10,
      offset: (page - 1) * 10
    }
  });
};

const parseNewItems =  (data) => {
  let newItems = [];
  data.forEach((item, idx) => {
    let { title, images } = item;
    newItems.push({
      width: images.original.width,
      height: images.original.height,
      src: images.original.url,
      description: title
    })
  });
  return newItems;
};

export const initFetchGIPHY = (imageType, query, page, dispatch) => {
  getImages(imageType, query, page)
  .then((res) => {
    let newItems = parseNewItems(res.data.data);
    dispatch({
      type: "FIRST_FETCH",
      newItems,
      query,
      totalPages: 5 // hack; assume there is at least 60 results for each query
    })
  })
  .catch((e) => console.error(e));
}

export const nextFetchGIPHY = (imageType, state, dispatch) => {
  getImages(imageType, state.query, state.page)
  .then((res) => {
    let newItems = parseNewItems(res.data.data);
    dispatch({
      type: "NEXT_FETCH",
      newItems
    })
  })
  .catch((e) => console.error(e));
}
