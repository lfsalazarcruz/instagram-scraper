const requestPromise = require("request-promise");
const cheerio = require("cheerio");

(async () => {
  const USERNAME = "garyvee";
  const BASE_URL = `https://www.instagram.com/${USERNAME}/?hl=en`;

  let response = await requestPromise(BASE_URL);

  let $ = cheerio.load(response);

  let script = $('script[type="text/javascript"]')
    .eq(3)
    .html();

  let script_regex = /window._sharedData = (.+);/.exec(script);

  let {
    entry_data: {
      ProfilePage: {
        [0]: {
          graphql: { user }
        }
      }
    }
  } = JSON.parse(script_regex[1]);

  // Accessing the posts inside the user variable
  let edges = user.edge_owner_to_timeline_media.edges.reduce(
    (accumulator, current) => {
      if (!accumulator.hasOwnProperty(current)) {
        accumulator.push(current.node);
      }
      return accumulator;
    },
    []
  );

  let posts = [];

  for (let edge of edges) {
    posts.push({
      id: edge.id,
      shortcode: edge.shortcode,
      caption: edge.edge_media_to_caption.edges[0].node.text,
      timestamp: edge.taken_at_timestamp,
      image_url: edge.display_url,
      likes: edge.edge_liked_by.count,
      comments: edge.edge_media_to_comment.count,
      video: edge.video_view_count
    });
  }

  let instagram_data = {
    username: user.username,
    fullname: user.full_name,
    profile_pic: user.profile_pic_url_hd,
    biography: user.biography,
    category: user.business_category_name,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    posts: posts
  };

  console.log(instagram_data);
  debugger;
})();
