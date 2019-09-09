

async function repo({org, name}) {
  return {
    org,
    name,
    contents: ({ref}) => {
      console.log(ref);
      return [
        {
          path: ref + 'README.md',
        }
      ]
    }
  }
}

export default {
  repo
}