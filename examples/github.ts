import RestClient from '../src/rest-client'

const api = new RestClient('https://api.github.com').withRes({
    repos: 'releases',
} as const)

api.repos('Amareis/another-rest-client').releases('latest').get().then((release: any) => {
    console.log(release)
    document.body.innerHTML =
        'Latest release of another-rest-client:<br>' +
        `Published at: ${release.published_at}<br>` +
        `Tag: ${release.tag_name}<br>`
})
