import { domParser, getLoadingAnimation, sendGetOrHead } from './util.js';

const container = document.querySelector('.container');
let page = 1;

async function getArticleList() {
  try {
    const res = await sendGetOrHead('GET', `/article/page/${page++}`);
    const rawHtml = await res.text();

    return rawHtml;
  } catch (error) {
    throw error;
  }
}

function appendElements(rawHtml) {
    const newNodes = domParser.parseFromString(rawHtml, 'text/html');
    newNodes.body.childNodes.forEach(row => container.appendChild(row));
}

const infScroll = new InfiniteScroll('.container', {
  path: () => '/'
});

infScroll.on('scrollThreshold', async (e) => {
  try {
    container.appendChild(getLoadingAnimation().body.childNodes[0]);
    infScroll.option({loadOnScroll: false});
    const rawHtml = await getArticleList();
    if (rawHtml) {
      container.removeChild(container.lastChild);
      appendElements(rawHtml);
      infScroll.option({loadOnScroll: true});
    } else {
      container.removeChild(container.lastChild);
      infScroll.destroy();
    }
  } catch (error) {
    console.error(error);
    container.removeChild(container.lastChild);
    infScroll.destroy();
  }
});

// Execute first loading
(async () => {
  try {
    const rawHtml = await getArticleList();
    appendElements(rawHtml);
  } catch (error) {
    console.error(error);
    infScroll.destroy();
  }
})();
