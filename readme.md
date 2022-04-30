### Done:
* Generates GHAS Org level findings in an excel 
  * code scanning alerts.
  * dependabot alerts.
  * secret scanning alerts.
* Consider API Pagination limits.
* Is bottleneck by API rate limit of 5000 calls/hr/user. 
  * Rate limit and other errors are captured in the excel file.
* Make multiple parallel asynchronous calls (using [async-await pattern](https://en.wikipedia.org/wiki/Async/await)). 
  * Is not multi-threaded. 
* Capture all error logs in an excel worksheet.

### To-dos:
* Need to run in a more reasonable time (5-10 mins).
  * It take about 30-40 mins / 1000 repo org.
* Implement multi-threading to improve performance.
  * Ability to specify multiple tokens for the thread-pool to work around GH rate-limits.
* Implement an API cache for reruns (for when API rate limit is hit).

### Usage: 
* copy and paste [this](https://github.com/amitgupta7/node-async/blob/master/.github/workflows/run-test.yml) in your actions workflow.
* Set appropreate PAT and ORG value in the `env` section of the workflow.
* run the workflow (and wait for about 30 - 40 mins) 

### local development:
```
> export INPUT_TOKEN=ghp_github_personal_access_token
> export GITHUB_ORG=github_org_name
# clone repo
> npm install
> npm run all
```
