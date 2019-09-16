import fetch from "node-fetch";
import minimatch from "minimatch";
import algoliasearch from "algoliasearch";

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

function document(owner, repo, ref, name) {
  return async e => {
    console.log(
      "fetching metadata",
      e,
      `https://adobeioruntime.net/api/v1/web/helix-pages/dynamic%40v1/idx_json?owner=${owner}&repo=${repo}&ref=${ref}&path=${name}`
    );
    return fetch(
      `https://adobeioruntime.net/api/v1/web/helix-pages/dynamic%40v1/idx_json?owner=${owner}&repo=${repo}&ref=${ref}&path=${name}`
    )
      .then(res => res.json())
      .then(res => ({
        ...res.basic.entries,
        ...res.images.entries
      }));
  };
}

function getref(owner, repo, ref, headers) {
  return fetch(`https://adobeioruntime.net/api/v1/web/helix/helix-services/resolve-git-ref@v1?owner=${owner}&repo=${repo}&ref=${ref}`, {
    headers
  })
    .then(res => res.json())
    .then(res => res.sha);
}

function getrepofromapi(owner, repo, sha, context, type) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
  console.log("sha", sha, url);
  return fetch(url, {
    headers: {
      authorization: context.req.headers.authorization
    }
  })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      return res;
    })
    .then(res => res.tree)
    .then(res => res.filter(({ type }) => type === "blob"))
    .then(res => res.filter(({ path }) => path.endsWith(type)))
    .then(res => res.filter(({ path }) => path.startsWith(parent)))
    .then(res => res.map(content => {
      content.document = document(owner, repo, sha, content.path);
      return content;
    }));
}

async function getrepofromindex(owner, repo, ref, context, type, parent = '/') {
  const filters = `type:.${type} AND parents:${parent}`;
  console.log(filters);
  const index = client.initIndex(owner + '--' + repo);
  const results = await index.search({
    attributesToRetrieve: ['path', 'name'],
    filters
   });
  return results.hits.map(content => {
    content.document = document(owner, repo, ref, content.path);
    return content;
  });
}


function repo({ owner, repo }, context) {
  const headers = context.req.headers.authorization ? {
    'x-github-token': context.req.headers.authorization.split(' ')[1]
  } : undefined;
  return {
    owner,
    name: repo,
    contents: async ({ ref = "master", parent, type = ".md" }) => {
      try {
        const sha = await getref(owner, repo, ref, headers);
        try {
          return getrepofromindex(owner, repo, sha, context, type, parent);
        } catch (e) {
          console.log('no index for ' + owner + ' ' + repo + ' trying recursive approach');
          return getrepofromapi(owner, repo, sha, context, type, parent);
        }
      } catch (e) {
        console.error(e);
        return [];
      }
    }
  };
}

export default {
  repo
};

