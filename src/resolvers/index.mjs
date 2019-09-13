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

async function fetchdir(url, depth = 0) {
  const contents = await fetch(url).then(res => res.json());
  console.log(url, depth, contents);
  const folders = contents.filter(({ type}) => type === 'dir');
  const files = contents.filter(({ type}) => type === 'file');

  if (depth > 0 && folders.length > 0) {
    const jobs = folders.map(({_links}) => fetchdir(_links.self, depth - 1));
    const subfiles = await Promise.all(jobs);
    return subfiles.reduce((p, v) => {
      return [...p, ...v];
    }, files);
  }
  
  return files;
}

async function repo({owner, repo}) {
  return {
    owner,
    name: repo,
    contents: ({ref = 'master', path = '', match = '*', depth = 0}) => {
      try {

        return fetchdir(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`, depth)
          //.then(res => res.json())
          .then(res => res.filter(({name}) => minimatch(name, match)))
          .then(res => res.map(content => {
            content.document = document(owner, repo, ref, content.path);
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
  repo, fetchdir
}