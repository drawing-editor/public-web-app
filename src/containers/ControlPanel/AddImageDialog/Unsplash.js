import { createApi } from 'unsplash-js';
import { APIConfig } from "./APIConfig";

const unsplash = createApi({
  accessKey: APIConfig.UNSPLASH_API_KEY
});

const parseNewItems = (data) => {
  let newItems = [];
  data.forEach((item, idx) => {
    let {width, height, urls, description } = item;
    newItems.push({
      width,
      height,
      src: urls.regular,
      description
    });
  });
  return newItems;
}

export const initFetchPictures = (query, page, dispatch) => {
  unsplash.search.getPhotos({ query, page })
  .then((result) => {
    switch (result.type) {
      case "error":
        console.log("error occurred: ", result.errors[0]);
        break;
      case "success":
        let { total, results } = result.response;
        if (total) {
          let newItems = parseNewItems(results);
          dispatch({
            type: "FIRST_FETCH",
            newItems,
            query,
            totalPages: (total > 5) ? 5 : total // restrict maximum size of up tp 60 results
          });
        }
        break;
      default:
        // do nothing
    }
  })
  .catch((e) => console.error(e));
};

export const nextFetchPictures = (state, dispatch) => {
  let { query, page } = state;
  unsplash.search.getPhotos({ query, page })
  .then((result) => {
    switch (result.type) {
      case "error":
        console.log("error occurred: ", result.errors[0]);
        break;
      case "success":
        let { total, results } = result.response;
        if (total) {
          let newItems = parseNewItems(results);
          dispatch({
            type: "NEXT_FETCH",
            newItems
          });
        }
        break;
      default:
        // do nothing
    }
  })
  .catch((e) => console.error(e));
};
