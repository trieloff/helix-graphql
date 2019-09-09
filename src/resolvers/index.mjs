import fetch from "node-fetch";
import minimatch from "minimatch";

function document(owner, repo, ref, name) {
  return async (e) => {
    console.log('fetching metadata', e, `https://adobeioruntime.net/api/v1/web/helix-pages/dynamic%40v1/idx_json?owner=${owner}&repo=${repo}&ref=${ref}&path=${name}`);
    return fetch(`https://adobeioruntime.net/api/v1/web/helix-pages/dynamic%40v1/idx_json?owner=${owner}&repo=${repo}&ref=${ref}&path=${name}`)
      .then(res => res.json())
      .then(res => ({
        ...res.basic.entries,
        ...res.images.entries
      }));
  }
}

async function repo({owner, repo}) {
  return {
    owner,
    name: repo,
    contents: ({ref = 'master', path = '', match = '*'}) => {
      try {
        return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`)
          .then(res => res.json())
          .then(res => res.filter(({name}) => minimatch(name, match)))
          .then(res => res.map(content => {
            content.document = document(owner, repo, ref, content.name);
            return content;
          }));
      } catch (e) {
        console.error(e);
        return [];
      }
    }
  }
}

export default {
  repo
}