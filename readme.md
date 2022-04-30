Demo script to generate org level GHAS alerts using actions workflow. The example require a GitHub PAT and GitHub Org to generate an excel file with the org level details. This is unable to capture all alerts if rate limit is hit for GitHub API (5000/hr/user). All errors will be captured and written to the excel worksheet. 

usage: copy and paste the below workflow in your repo, and set appropreate PAT and ORG value in the `env` section.
```
https://github.com/amitgupta7/node-async/blob/master/.github/workflows/run-test.yml
```
