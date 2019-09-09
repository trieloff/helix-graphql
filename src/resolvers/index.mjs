import fetch from "node-fetch";
import minimatch from "minimatch";

async function repo({owner, repo}) {
  return {
    owner,
    name: repo,
    contents: ({ref = 'master', path = '', match = '*'}) => {
      try {
        return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`)
          .then(res => res.json())
          .then(res => res.filter(({name}) => minimatch(name, match)));
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