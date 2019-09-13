import fetch from "node-fetch";
import minimatch from "minimatch";

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

async function repo({ owner, repo }, context) {
  const headers = context.req.headers.authorization ? {
    'x-github-token': context.req.headers.authorization.split(' ')[1]
  } : undefined;
  return {
    owner,
    name: repo,
    contents: ({ ref = "master", path = "", match = "*", depth = 0 }) => {
      try {
        return fetch(
          `https://adobeioruntime.net/api/v1/web/helix/helix-services/resolve-git-ref@v1?owner=${owner}&repo=${repo}&ref=${ref}`,
          {
            headers
          }
        )
          .then(res => res.json())
          .then(res => res.sha)
          .then(sha => {
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
              .then(res => res.filter(({ path }) => minimatch(path, match)))
              .then(res =>
                res.map(content => {
                  content.document = document(owner, repo, ref, content.path);
                  return content;
                })
              );
          });
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
