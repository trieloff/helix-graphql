# Helix GraphQL

> An experimental GraphQL representation of the GitHub Content Repository for Project helix

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-library.svg)](https://codecov.io/gh/adobe/helix-library)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/helix-library.svg)](https://circleci.com/gh/adobe/helix-library)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-library.svg)](https://github.com/adobe/helix-library/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-library.svg)](https://github.com/adobe/helix-library/issues)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/helix-library.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/helix-library)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/helix-library.svg)](https://greenkeeper.io/)

This thing is a very experimental proof of concept. Be surprised if it runs. Be more surprised if it doesn't burn down your house.

## Usage (Local)

```bash
$ npm install
$ npx autographql dev -c autographql.json
```

You can then run GraphQL queries against `http://localhost:8080`. For example:

```graphql
query {
  repo(owner: "trieloff", repo: "helix-demo") {
    owner,
    name,
    contents(ref: "master", parent: "", type: "md") {
      path,
      name,
      document {
        description,
        title,
        images
      }
    }
  }
}

```

will yield:

```json
{
  "errors": [
    {
      "message": "invalid json response body at https://adobeioruntime.net/api/v1/web/helix-pages/dynamic%40v1/idx_json?owner=trieloff&repo=helix-demo&ref=master&path=foo.md reason: Unexpected end of JSON input",
      "locations": [
        {
          "line": 8,
          "column": 7
        }
      ],
      "path": [
        "repo",
        "contents",
        0,
        "document"
      ]
    }
  ],
  "data": {
    "repo": {
      "owner": "trieloff",
      "name": "helix-demo",
      "contents": [
        {
          "path": "foo.md",
          "name": "foo.md",
          "document": null
        },
        {
          "path": "index.md",
          "name": "index.md",
          "document": {
            "description": null,
            "title": "Helix - demo",
            "images": [
              "/content/dam/udp/language-masters/en/home_callout01.jpg.img.jpg",
              "htdocs/big-image.jpg"
            ]
          }
        },
        {
          "path": "more.md",
          "name": "more.md",
          "document": {
            "description": null,
            "title": "More?",
            "images": []
          }
        },
        {
          "path": "schwupp.md",
          "name": "schwupp.md",
          "document": {
            "description": null,
            "title": null,
            "images": []
          }
        }
      ]
    }
  }
}
```

### What Happens Here?

The Helix GraphQL service combines the results of two API calls:

1. the GitHub REST API to retrieve files in a folder of a GitHub repo (at a particular `ref`)
2. the Helix Pages Index API to extract some metadata

## Improvements Wanted/Needed

- [ ] deploy to Adobe I/O Runtime
- [ ] use local caching for Index API
- [ ] use Fastly caching for Index API
- [x] use `helix-resolve-git-ref` instead of named refs
- [ ] expose Sections in schema and response
- [x] enable recursive file listing
- [x] enable authenticated requests
- [x] provide better filters
- [ ] Use [`delegateToSchema`](https://www.apollographql.com/docs/graphql-tools/schema-delegation/#delegatetoschema) and wrap the GitHub GraphQL API